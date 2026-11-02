#!/usr/bin/env python3
"""
cleanup-test-data.py

Sweeps and deletes leftover test data (e.g. entities prefixed with "AQA-Sample-")
from the Green & Tasty backend environment.

Can operate in three modes:
1. Direct DynamoDB cleanup via boto3.
2. Direct DynamoDB cleanup via AWS CLI (subprocess).
3. REST API cleanup (using waiter/admin token against API Gateway).
"""

import os
import sys
import json
import subprocess
import urllib.request
import urllib.parse
import urllib.error

PREFIX = "AQA-Sample-"

def log(msg: str):
    print(f"[Cleanup] {msg}")

def cleanup_via_aws_cli() -> bool:
    """Uses the AWS CLI if available and credentials configured."""
    region = os.environ.get("AWS_REGION", "us-east-1")
    try:
        check = subprocess.run(
            ["aws", "sts", "get-caller-identity"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False
        )
        if check.returncode != 0:
            return False
    except FileNotFoundError:
        return False

    log(f"AWS CLI detected. Scanning DynamoDB tables in region {region}...")

    # 1. Scan and delete Dishes
    try:
        scan_proc = subprocess.run(
            [
                "aws", "dynamodb", "scan",
                "--table-name", "Dishes",
                "--region", region,
                "--filter-expression", "begins_with(#n, :prefix)",
                "--expression-attribute-names", '{"#n": "name"}',
                "--expression-attribute-values", json.dumps({":prefix": {"S": PREFIX}}),
                "--output", "json"
            ],
            capture_output=True,
            text=True,
            check=False
        )
        if scan_proc.returncode == 0:
            items = json.loads(scan_proc.stdout).get("Items", [])
            dish_ids = [d["id"]["S"] for d in items if "id" in d]
            if dish_ids:
                log(f"Found {len(dish_ids)} test dish(es) in Dishes table via AWS CLI.")
                # Clean from Locations.specialtyDishIds
                loc_proc = subprocess.run(
                    [
                        "aws", "dynamodb", "scan",
                        "--table-name", "Locations",
                        "--region", region,
                        "--filter-expression", "attribute_exists(specialtyDishIds)",
                        "--output", "json"
                    ],
                    capture_output=True,
                    text=True,
                    check=False
                )
                if loc_proc.returncode == 0:
                    for loc in json.loads(loc_proc.stdout).get("Items", []):
                        loc_id = loc["id"]["S"]
                        current_ids = set(loc.get("specialtyDishIds", {}).get("SS", []))
                        cleaned_ids = current_ids - set(dish_ids)
                        if len(cleaned_ids) != len(current_ids):
                            if cleaned_ids:
                                subprocess.run([
                                    "aws", "dynamodb", "update-item",
                                    "--table-name", "Locations",
                                    "--region", region,
                                    "--key", json.dumps({"id": {"S": loc_id}}),
                                    "--update-expression", "SET specialtyDishIds = :new_ids",
                                    "--expression-attribute-values", json.dumps({":new_ids": {"SS": list(cleaned_ids)}})
                                ], check=False)
                            else:
                                subprocess.run([
                                    "aws", "dynamodb", "update-item",
                                    "--table-name", "Locations",
                                    "--region", region,
                                    "--key", json.dumps({"id": {"S": loc_id}}),
                                    "--update-expression", "REMOVE specialtyDishIds"
                                ], check=False)

                for dish_id in dish_ids:
                    subprocess.run([
                        "aws", "dynamodb", "delete-item",
                        "--table-name", "Dishes",
                        "--region", region,
                        "--key", json.dumps({"id": {"S": dish_id}})
                    ], check=False)
                    log(f"Deleted dish {dish_id}")
            else:
                log("No test dishes found in Dishes table.")
    except Exception as e:
        log(f"AWS CLI dish cleanup error: {e}")

    # 2. Scan and delete Locations
    try:
        loc_scan = subprocess.run(
            [
                "aws", "dynamodb", "scan",
                "--table-name", "Locations",
                "--region", region,
                "--filter-expression", "begins_with(address, :prefix)",
                "--expression-attribute-values", json.dumps({":prefix": {"S": PREFIX}}),
                "--output", "json"
            ],
            capture_output=True,
            text=True,
            check=False
        )
        if loc_scan.returncode == 0:
            for loc in json.loads(loc_scan.stdout).get("Items", []):
                loc_id = loc["id"]["S"]
                subprocess.run([
                    "aws", "dynamodb", "delete-item",
                    "--table-name", "Locations",
                    "--region", region,
                    "--key", json.dumps({"id": {"S": loc_id}})
                ], check=False)
                log(f"Deleted location {loc_id}")
    except Exception as e:
        log(f"AWS CLI location cleanup error: {e}")

    return True

def cleanup_via_dynamodb() -> bool:
    """Attempts direct DynamoDB cleanup if boto3 is available."""
    try:
        import boto3
        from botocore.exceptions import ClientError, NoCredentialsError
    except ImportError:
        return False

    region = os.environ.get("AWS_REGION", "us-east-1")
    try:
        dynamodb = boto3.client("dynamodb", region_name=region)
        dynamodb.list_tables()
    except Exception:
        return False

    log(f"Connected to DynamoDB via boto3 ({region}).")
    try:
        dishes_resp = dynamodb.scan(
            TableName="Dishes",
            FilterExpression="begins_with(#n, :prefix)",
            ExpressionAttributeNames={"#n": "name"},
            ExpressionAttributeValues={":prefix": {"S": PREFIX}}
        )
        for d in dishes_resp.get("Items", []):
            dish_id = d["id"]["S"]
            dynamodb.delete_item(TableName="Dishes", Key={"id": {"S": dish_id}})
            log(f"Deleted dish {dish_id}")
    except Exception as e:
        log(f"boto3 error: {e}")

    return True

def cleanup_via_api() -> bool:
    """Fallback: cleans up test data using REST API endpoints with waiter/admin authentication."""
    api_url = os.environ.get("AQA_API_URL", os.environ.get("API_URL", "https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop")).rstrip("/")
    waiter_user = os.environ.get("AQA_WAITER_USERNAME", os.environ.get("WAITER_USERNAME", "waiter@green-tasty.com"))
    waiter_pass = os.environ.get("AQA_WAITER_PASSWORD", os.environ.get("WAITER_PASSWORD"))
    admin_user = os.environ.get("AQA_ADMIN_USERNAME", os.environ.get("ADMIN_USERNAME", "admin@green-tasty.com"))
    admin_pass = os.environ.get("AQA_ADMIN_PASSWORD", os.environ.get("ADMIN_PASSWORD"))

    log(f"Checking REST API at {api_url}...")

    def sign_in(user, pwd):
        if not user or not pwd:
            return None
        url = f"{api_url}/signin"
        data = json.dumps({"username": user, "password": pwd}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                return body.get("idToken")
        except Exception as e:
            log(f"Sign-in for {user} failed: {e}")
            return None

    token = sign_in(waiter_user, waiter_pass) or sign_in(admin_user, admin_pass)

    try:
        url = f"{api_url}/dishes"
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            dishes = json.loads(resp.read().decode("utf-8"))

        sample_dishes = [d for d in dishes if d.get("name", "").startswith(PREFIX)]
        log(f"Found {len(sample_dishes)} test dish(es) via API.")

        for d in sample_dishes:
            dish_id = d.get("id")
            del_url = f"{api_url}/dishes/{dish_id}?force=true"
            headers = {"Accept": "application/json"}
            if token:
                headers["Authorization"] = f"Bearer {token}"
            del_req = urllib.request.Request(del_url, headers=headers, method="DELETE")
            try:
                with urllib.request.urlopen(del_req, timeout=15) as del_resp:
                    log(f"Deleted dish {dish_id} via API: HTTP {del_resp.status}")
            except Exception as e:
                log(f"Failed to delete dish {dish_id} via API: {e}")
    except Exception as e:
        log(f"Failed to query dishes via API: {e}")

    try:
        url = f"{api_url}/locations"
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            locations = json.loads(resp.read().decode("utf-8"))

        sample_locs = [loc for loc in locations if loc.get("address", "").startswith(PREFIX)]
        log(f"Found {len(sample_locs)} test location(s) via API.")

        for loc in sample_locs:
            loc_id = loc.get("id")
            del_url = f"{api_url}/locations/{loc_id}?force=true"
            headers = {"Accept": "application/json"}
            if token:
                headers["Authorization"] = f"Bearer {token}"
            del_req = urllib.request.Request(del_url, headers=headers, method="DELETE")
            try:
                with urllib.request.urlopen(del_req, timeout=15) as del_resp:
                    log(f"Deleted location {loc_id} via API: HTTP {del_resp.status}")
            except Exception as e:
                log(f"Failed to delete location {loc_id} via API: {e}")
    except Exception as e:
        log(f"Failed to query locations via API: {e}")

    return True

def main():
    log("Starting sweep of AQA garbage test data...")
    if not cleanup_via_dynamodb():
        if not cleanup_via_aws_cli():
            cleanup_via_api()

    log("AQA test data cleanup complete.")

if __name__ == "__main__":
    main()

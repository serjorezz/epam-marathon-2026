#!/usr/bin/env python3
"""
Seed script for Green & Tasty restaurant database.
Populates initial sample data (Locations, Tables, Dishes) into AWS DynamoDB
and ensures Cognito groups, Admin, Waiters, and Customer accounts exist.

Usage:
    python3 scripts/seed-dynamodb.py [--region REGION] [--user-pool-id USER_POOL_ID]
                                     [--admin-email EMAIL] [--admin-password PASSWORD]
"""

import argparse
from datetime import datetime, timezone
import json
import subprocess
import sys


def run_cmd(cmd: list[str]) -> tuple[int, str, str]:
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.returncode, res.stdout, res.stderr


def put_item(table_name: str, item: dict, region: str) -> bool:
    cmd = [
        "aws", "dynamodb", "put-item",
        "--table-name", table_name,
        "--item", json.dumps(item),
        "--region", region
    ]
    code, stdout, stderr = run_cmd(cmd)
    if code != 0:
        print(f"  [ERROR] {table_name}: {stderr.strip()}", file=sys.stderr)
        return False
    identifier = item.get("id", {}).get("S") or item.get("name", {}).get("S") or item.get("userId", {}).get("S")
    print(f"  [OK] {table_name} -> {identifier}")
    return True


def ensure_cognito_admin(user_pool_id: str, email: str, password: str, region: str):
    print(f"\n4. Setting up Cognito Groups & Admin User in User Pool ({user_pool_id})...")

    # 1. Ensure Groups exist
    for group_name in ["Admin", "Waiter", "Customer"]:
        check_cmd = [
            "aws", "cognito-idp", "get-group",
            "--user-pool-id", user_pool_id,
            "--group-name", group_name,
            "--region", region
        ]
        code, _, _ = run_cmd(check_cmd)
        if code != 0:
            create_cmd = [
                "aws", "cognito-idp", "create-group",
                "--user-pool-id", user_pool_id,
                "--group-name", group_name,
                "--description", f"{group_name} group",
                "--region", region
            ]
            run_cmd(create_cmd)
            print(f"  [OK] Created Cognito group: {group_name}")
        else:
            print(f"  [EXISTS] Cognito group: {group_name}")

    # 2. Ensure Admin User exists
    user_check_cmd = [
        "aws", "cognito-idp", "admin-get-user",
        "--user-pool-id", user_pool_id,
        "--username", email,
        "--region", region
    ]
    code, _, _ = run_cmd(user_check_cmd)
    if code != 0:
        create_user_cmd = [
            "aws", "cognito-idp", "admin-create-user",
            "--user-pool-id", user_pool_id,
            "--username", email,
            "--user-attributes",
            f"Name=email,Value={email}",
            "Name=email_verified,Value=true",
            "Name=given_name,Value=Admin",
            "Name=family_name,Value=User",
            "--message-action", "SUPPRESS",
            "--region", region
        ]
        run_cmd(create_user_cmd)
        print(f"  [OK] Created admin user: {email}")
    else:
        print(f"  [EXISTS] Admin user: {email}")

    # 3. Set permanent password
    set_pass_cmd = [
        "aws", "cognito-idp", "admin-set-user-password",
        "--user-pool-id", user_pool_id,
        "--username", email,
        "--password", password,
        "--permanent",
        "--region", region
    ]
    run_cmd(set_pass_cmd)
    print("  [OK] Admin permanent password configured")

    # 4. Add user to Admin group
    add_group_cmd = [
        "aws", "cognito-idp", "admin-add-user-to-group",
        "--user-pool-id", user_pool_id,
        "--username", email,
        "--group-name", "Admin",
        "--region", region
    ]
    run_cmd(add_group_cmd)
    print("  [OK] Admin user assigned to 'Admin' group")


def ensure_waiters(user_pool_id: str, waiters: list[dict], region: str):
    print(f"\n5. Setting up Waiters in Cognito & DynamoDB 'Waiters' table...")

    for w in waiters:
        email = w["email"]
        location_id = w["location_id"]
        pwd = w["password"]
        first_name = w["first_name"]
        last_name = w["last_name"]

        # 1. Ensure Cognito user exists
        user_check_cmd = [
            "aws", "cognito-idp", "admin-get-user",
            "--user-pool-id", user_pool_id,
            "--username", email,
            "--region", region
        ]
        code, stdout, _ = run_cmd(user_check_cmd)
        if code != 0:
            create_user_cmd = [
                "aws", "cognito-idp", "admin-create-user",
                "--user-pool-id", user_pool_id,
                "--username", email,
                "--user-attributes",
                f"Name=email,Value={email}",
                "Name=email_verified,Value=true",
                f"Name=given_name,Value={first_name}",
                f"Name=family_name,Value={last_name}",
                "--message-action", "SUPPRESS",
                "--region", region
            ]
            run_cmd(create_user_cmd)
            print(f"  [OK] Created waiter user: {email}")
            _, stdout, _ = run_cmd(user_check_cmd)
        else:
            print(f"  [EXISTS] Waiter user: {email}")

        # Extract Cognito sub ID
        sub = None
        try:
            user_data = json.loads(stdout)
            for attr in user_data.get("UserAttributes", []):
                if attr.get("Name") == "sub":
                    sub = attr.get("Value")
                    break
        except Exception as e:
            print(f"  [WARN] Failed to parse Cognito user attributes for {email}: {e}")

        # 2. Set permanent password
        set_pass_cmd = [
            "aws", "cognito-idp", "admin-set-user-password",
            "--user-pool-id", user_pool_id,
            "--username", email,
            "--password", pwd,
            "--permanent",
            "--region", region
        ]
        run_cmd(set_pass_cmd)

        # 3. Add user to Waiter group
        add_group_cmd = [
            "aws", "cognito-idp", "admin-add-user-to-group",
            "--user-pool-id", user_pool_id,
            "--username", email,
            "--group-name", "Waiter",
            "--region", region
        ]
        run_cmd(add_group_cmd)

        # 4. Ensure record exists in Waiters DynamoDB table
        if sub:
            get_item_cmd = [
                "aws", "dynamodb", "get-item",
                "--table-name", "Waiters",
                "--key", json.dumps({"userId": {"S": sub}}),
                "--region", region
            ]
            c, item_out, _ = run_cmd(get_item_cmd)
            exists = False
            if c == 0:
                try:
                    exists = "Item" in json.loads(item_out)
                except Exception:
                    pass

            if not exists:
                now_str = datetime.now(timezone.utc).isoformat()
                item = {
                    "userId": {"S": sub},
                    "locationId": {"S": location_id},
                    "createdAt": {"S": now_str},
                    "reservations": {"L": []}
                }
                put_item("Waiters", item, region)
            else:
                print(f"  [EXISTS] Waiters DynamoDB item for {email} ({sub}) -> {location_id}")


def ensure_customers(user_pool_id: str, customers: list[dict], region: str):
    print(f"\n6. Setting up Test Customers in Cognito & CustomerFavorites DynamoDB table...")

    for c in customers:
        email = c["email"]
        pwd = c["password"]
        first_name = c["first_name"]
        last_name = c["last_name"]

        user_check_cmd = [
            "aws", "cognito-idp", "admin-get-user",
            "--user-pool-id", user_pool_id,
            "--username", email,
            "--region", region
        ]
        code, stdout, _ = run_cmd(user_check_cmd)
        if code != 0:
            create_user_cmd = [
                "aws", "cognito-idp", "admin-create-user",
                "--user-pool-id", user_pool_id,
                "--username", email,
                "--user-attributes",
                f"Name=email,Value={email}",
                "Name=email_verified,Value=true",
                f"Name=given_name,Value={first_name}",
                f"Name=family_name,Value={last_name}",
                "--message-action", "SUPPRESS",
                "--region", region
            ]
            run_cmd(create_user_cmd)
            print(f"  [OK] Created customer user: {email}")
            _, stdout, _ = run_cmd(user_check_cmd)
        else:
            run_cmd([
                "aws", "cognito-idp", "admin-update-user-attributes",
                "--user-pool-id", user_pool_id,
                "--username", email,
                "--user-attributes",
                f"Name=given_name,Value={first_name}",
                f"Name=family_name,Value={last_name}",
                "--region", region
            ])
            print(f"  [EXISTS] Updated customer user attributes: {email} ({first_name} {last_name})")

        # Extract Cognito sub ID
        sub = None
        try:
            user_data = json.loads(stdout)
            for attr in user_data.get("UserAttributes", []):
                if attr.get("Name") == "sub":
                    sub = attr.get("Value")
                    break
        except Exception as e:
            print(f"  [WARN] Failed to parse Cognito user attributes for {email}: {e}")

        set_pass_cmd = [
            "aws", "cognito-idp", "admin-set-user-password",
            "--user-pool-id", user_pool_id,
            "--username", email,
            "--password", pwd,
            "--permanent",
            "--region", region
        ]
        run_cmd(set_pass_cmd)

        add_group_cmd = [
            "aws", "cognito-idp", "admin-add-user-to-group",
            "--user-pool-id", user_pool_id,
            "--username", email,
            "--group-name", "Customer",
            "--region", region
        ]
        run_cmd(add_group_cmd)

        # Ensure sample favorites for the customer
        if sub:
            get_fav_cmd = [
                "aws", "dynamodb", "get-item",
                "--table-name", "CustomerFavorites",
                "--key", json.dumps({"userId": {"S": sub}}),
                "--region", region
            ]
            c_fav, fav_out, _ = run_cmd(get_fav_cmd)
            fav_exists = False
            if c_fav == 0:
                try:
                    fav_exists = "Item" in json.loads(fav_out)
                except Exception:
                    pass
            if not fav_exists:
                fav_item = {
                    "userId": {"S": sub},
                    "dishIds": {"L": [{"S": "dish-avocado-bowl"}, {"S": "dish-strawberry-salad"}]}
                }
                put_item("CustomerFavorites", fav_item, region)
            else:
                print(f"  [EXISTS] CustomerFavorites DynamoDB item for {email} ({sub})")


LOCATIONS = [
    {
        "id": {"S": "loc-baratashvili"},
        "address": {"S": "14 Baratashvili Street"},
        "description": {"S": "Nestled in the historic heart of Old Tbilisi, our Baratashvili Street restaurant pairs traditional Georgian architectural charm with contemporary eco-friendly design. Guests can unwind on the sunlit veranda overlooking cobblestone streets and scenic hillside views, enjoying a tranquil, welcoming atmosphere perfect for leisurely family gatherings and romantic dinners."},
        "totalCapacity": {"N": "30"},
        "averageOccupancy": {"S": "75"},
        "imageUrl": {"S": "assets/img/locations/baratashvili-street-14.jpg"},
        "rating": {"N": "4.8"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    },
    {
        "id": {"S": "loc-abashidze"},
        "address": {"S": "9 Abashidze Street"},
        "description": {"S": "Situated in the leafy, upscale Vake district, 9 Abashidze Street offers a bright, modern sanctuary centered around a secluded garden courtyard. Floor-to-ceiling windows, natural stone textures, and aromatic herb planters create an airy, farm-to-table ambiance where guests can savor seasonal organic bowls, artisanal teas, and peaceful weekend brunches."},
        "totalCapacity": {"N": "35"},
        "averageOccupancy": {"S": "80"},
        "imageUrl": {"S": "assets/img/locations/abashidze-street-9.jpg"},
        "rating": {"N": "4.9"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    },
    {
        "id": {"S": "loc-rustaveli"},
        "address": {"S": "48 Rustaveli Avenue"},
        "description": {"S": "Located on bustling Rustaveli Avenue, this flagship branch blends vibrant city energy with a warm, botanical-inspired interior. Surrounded by lush indoor greenery, warm oak accents, and soft ambient lighting, it features a spacious outdoor terrace and intimate private dining rooms—making it ideal for both relaxed business lunches and evening celebrations accompanied by live acoustic music."},
        "totalCapacity": {"N": "40"},
        "averageOccupancy": {"S": "65"},
        "imageUrl": {"S": "assets/img/locations/rustaveli-avenue-48.jpg"},
        "rating": {"N": "4.8"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    },
    {
        "id": {"S": "loc-chavchavadze"},
        "address": {"S": "24 Chavchavadze Avenue"},
        "description": {"S": "Set along prestigious Chavchavadze Avenue, this contemporary dining space combines sleek minimalist elegance with warm wooden finishes and curated local art. With its open kitchen concept, cozy booth seating, and botanical mocktail and wine bar, it provides a sophisticated yet relaxed setting for evening dining and friendly get-togethers."},
        "totalCapacity": {"N": "32"},
        "averageOccupancy": {"S": "72"},
        "imageUrl": {"S": "assets/img/locations/chavchavadze-avenue-24.jpg"},
        "rating": {"N": "4.9"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    },
    {
        "id": {"S": "loc-agmashenebeli"},
        "address": {"S": "112 Agmashenebeli Avenue"},
        "description": {"S": "Housed in a beautifully restored 19th-century building on pedestrian-friendly Agmashenebeli Avenue, this lively loft-style venue features high ceilings, exposed brick walls, and abundant natural light. The inviting indoor conservatory and street-side patio offer a vibrant, creative atmosphere for coffee meetups, remote work lunches, and shared plant-based feasts."},
        "totalCapacity": {"N": "36"},
        "averageOccupancy": {"S": "78"},
        "imageUrl": {"S": "assets/img/locations/agmashenebeli-avenue-112.jpg"},
        "rating": {"N": "4.8"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    },
    {
        "id": {"S": "loc-pekini"},
        "address": {"S": "31 Pekini Avenue"},
        "description": {"S": "Perched in dynamic Saburtalo, our Pekini Avenue branch features a breezy, sunlit rooftop terrace and a serene, nature-inspired dining room. Designed as a calm urban oasis away from the busy avenue below, it welcomes guests with panoramic sunset views, comfortable lounge seating, and a refreshing, family-friendly ambiance."},
        "totalCapacity": {"N": "28"},
        "averageOccupancy": {"S": "70"},
        "imageUrl": {"S": "assets/img/locations/pekini-avenue-31.jpg"},
        "rating": {"N": "4.7"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    },
    {
        "id": {"S": "loc-marjanishvili"},
        "address": {"S": "7 Marjanishvili Street"},
        "description": {"S": "Steps away from historic Marjanishvili Theatre, this elegant cultural-quarter restaurant pairs Art Nouveau architectural details with lush hanging botanicals and warm brass lighting. Guests enjoy an intimate, bohemian atmosphere ideal for pre-theatre dinners, artisanal dessert tastings, and relaxed conversations over organic Georgian herbal infusions."},
        "totalCapacity": {"N": "34"},
        "averageOccupancy": {"S": "76"},
        "imageUrl": {"S": "assets/img/locations/marjanishvili-street-7.jpg"},
        "rating": {"N": "4.9"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    },
    {
        "id": {"S": "loc-gorgasali"},
        "address": {"S": "19 Vakhtang Gorgasali Street"},
        "description": {"S": "Overlooking the scenic Mtkvari riverfront in historic Abanotubani, our Gorgasali Street location offers breathtaking views of Narikala Fortress and the sulfur bath domes. Crafted with natural terracotta, reclaimed Georgian walnut wood, and a breezy riverside balcony, it delivers a soulful, unforgettable setting for sunset dining."},
        "totalCapacity": {"N": "38"},
        "averageOccupancy": {"S": "82"},
        "imageUrl": {"S": "assets/img/locations/gorgasali-street-19.jpg"},
        "rating": {"N": "4.9"},
        "happyHoursStart": {"S": "12:00"},
        "happyHoursEnd": {"S": "16:00"},
        "discountPercentage": {"N": "10"}
    }
]

TABLES = [
    # 14 Baratashvili Street
    {"id": {"S": "table-b1"}, "locationId": {"S": "loc-baratashvili"}, "capacity": {"N": "2"}, "tableNumber": {"N": "1"}},
    {"id": {"S": "table-b2"}, "locationId": {"S": "loc-baratashvili"}, "capacity": {"N": "2"}, "tableNumber": {"N": "2"}},
    {"id": {"S": "table-b3"}, "locationId": {"S": "loc-baratashvili"}, "capacity": {"N": "4"}, "tableNumber": {"N": "3"}},
    {"id": {"S": "table-b4"}, "locationId": {"S": "loc-baratashvili"}, "capacity": {"N": "4"}, "tableNumber": {"N": "4"}},
    {"id": {"S": "table-b5"}, "locationId": {"S": "loc-baratashvili"}, "capacity": {"N": "6"}, "tableNumber": {"N": "5"}},
    {"id": {"S": "table-b6"}, "locationId": {"S": "loc-baratashvili"}, "capacity": {"N": "8"}, "tableNumber": {"N": "6"}},
    # 9 Abashidze Street
    {"id": {"S": "table-a1"}, "locationId": {"S": "loc-abashidze"}, "capacity": {"N": "2"}, "tableNumber": {"N": "11"}},
    {"id": {"S": "table-a2"}, "locationId": {"S": "loc-abashidze"}, "capacity": {"N": "2"}, "tableNumber": {"N": "12"}},
    {"id": {"S": "table-a3"}, "locationId": {"S": "loc-abashidze"}, "capacity": {"N": "4"}, "tableNumber": {"N": "13"}},
    {"id": {"S": "table-a4"}, "locationId": {"S": "loc-abashidze"}, "capacity": {"N": "4"}, "tableNumber": {"N": "14"}},
    {"id": {"S": "table-a5"}, "locationId": {"S": "loc-abashidze"}, "capacity": {"N": "6"}, "tableNumber": {"N": "15"}},
    {"id": {"S": "table-a6"}, "locationId": {"S": "loc-abashidze"}, "capacity": {"N": "8"}, "tableNumber": {"N": "16"}},
    # 48 Rustaveli Avenue
    {"id": {"S": "table-r1"}, "locationId": {"S": "loc-rustaveli"}, "capacity": {"N": "2"}, "tableNumber": {"N": "21"}},
    {"id": {"S": "table-r2"}, "locationId": {"S": "loc-rustaveli"}, "capacity": {"N": "4"}, "tableNumber": {"N": "22"}},
    {"id": {"S": "table-r3"}, "locationId": {"S": "loc-rustaveli"}, "capacity": {"N": "4"}, "tableNumber": {"N": "23"}},
    {"id": {"S": "table-r4"}, "locationId": {"S": "loc-rustaveli"}, "capacity": {"N": "6"}, "tableNumber": {"N": "24"}},
    {"id": {"S": "table-r5"}, "locationId": {"S": "loc-rustaveli"}, "capacity": {"N": "8"}, "tableNumber": {"N": "25"}},
    # 24 Chavchavadze Avenue
    {"id": {"S": "table-c1"}, "locationId": {"S": "loc-chavchavadze"}, "capacity": {"N": "2"}, "tableNumber": {"N": "31"}},
    {"id": {"S": "table-c2"}, "locationId": {"S": "loc-chavchavadze"}, "capacity": {"N": "2"}, "tableNumber": {"N": "32"}},
    {"id": {"S": "table-c3"}, "locationId": {"S": "loc-chavchavadze"}, "capacity": {"N": "4"}, "tableNumber": {"N": "33"}},
    {"id": {"S": "table-c4"}, "locationId": {"S": "loc-chavchavadze"}, "capacity": {"N": "4"}, "tableNumber": {"N": "34"}},
    {"id": {"S": "table-c5"}, "locationId": {"S": "loc-chavchavadze"}, "capacity": {"N": "6"}, "tableNumber": {"N": "35"}},
    {"id": {"S": "table-c6"}, "locationId": {"S": "loc-chavchavadze"}, "capacity": {"N": "8"}, "tableNumber": {"N": "36"}},
    # 112 Agmashenebeli Avenue
    {"id": {"S": "table-ag1"}, "locationId": {"S": "loc-agmashenebeli"}, "capacity": {"N": "2"}, "tableNumber": {"N": "41"}},
    {"id": {"S": "table-ag2"}, "locationId": {"S": "loc-agmashenebeli"}, "capacity": {"N": "4"}, "tableNumber": {"N": "42"}},
    {"id": {"S": "table-ag3"}, "locationId": {"S": "loc-agmashenebeli"}, "capacity": {"N": "4"}, "tableNumber": {"N": "43"}},
    {"id": {"S": "table-ag4"}, "locationId": {"S": "loc-agmashenebeli"}, "capacity": {"N": "6"}, "tableNumber": {"N": "44"}},
    {"id": {"S": "table-ag5"}, "locationId": {"S": "loc-agmashenebeli"}, "capacity": {"N": "8"}, "tableNumber": {"N": "45"}},
    # 31 Pekini Avenue
    {"id": {"S": "table-p1"}, "locationId": {"S": "loc-pekini"}, "capacity": {"N": "2"}, "tableNumber": {"N": "51"}},
    {"id": {"S": "table-p2"}, "locationId": {"S": "loc-pekini"}, "capacity": {"N": "2"}, "tableNumber": {"N": "52"}},
    {"id": {"S": "table-p3"}, "locationId": {"S": "loc-pekini"}, "capacity": {"N": "4"}, "tableNumber": {"N": "53"}},
    {"id": {"S": "table-p4"}, "locationId": {"S": "loc-pekini"}, "capacity": {"N": "6"}, "tableNumber": {"N": "54"}},
    {"id": {"S": "table-p5"}, "locationId": {"S": "loc-pekini"}, "capacity": {"N": "8"}, "tableNumber": {"N": "55"}},
    # 7 Marjanishvili Street
    {"id": {"S": "table-m1"}, "locationId": {"S": "loc-marjanishvili"}, "capacity": {"N": "2"}, "tableNumber": {"N": "61"}},
    {"id": {"S": "table-m2"}, "locationId": {"S": "loc-marjanishvili"}, "capacity": {"N": "4"}, "tableNumber": {"N": "62"}},
    {"id": {"S": "table-m3"}, "locationId": {"S": "loc-marjanishvili"}, "capacity": {"N": "4"}, "tableNumber": {"N": "63"}},
    {"id": {"S": "table-m4"}, "locationId": {"S": "loc-marjanishvili"}, "capacity": {"N": "6"}, "tableNumber": {"N": "64"}},
    {"id": {"S": "table-m5"}, "locationId": {"S": "loc-marjanishvili"}, "capacity": {"N": "8"}, "tableNumber": {"N": "65"}},
    # 19 Vakhtang Gorgasali Street
    {"id": {"S": "table-g1"}, "locationId": {"S": "loc-gorgasali"}, "capacity": {"N": "2"}, "tableNumber": {"N": "71"}},
    {"id": {"S": "table-g2"}, "locationId": {"S": "loc-gorgasali"}, "capacity": {"N": "2"}, "tableNumber": {"N": "72"}},
    {"id": {"S": "table-g3"}, "locationId": {"S": "loc-gorgasali"}, "capacity": {"N": "4"}, "tableNumber": {"N": "73"}},
    {"id": {"S": "table-g4"}, "locationId": {"S": "loc-gorgasali"}, "capacity": {"N": "4"}, "tableNumber": {"N": "74"}},
    {"id": {"S": "table-g5"}, "locationId": {"S": "loc-gorgasali"}, "capacity": {"N": "6"}, "tableNumber": {"N": "75"}},
    {"id": {"S": "table-g6"}, "locationId": {"S": "loc-gorgasali"}, "capacity": {"N": "8"}, "tableNumber": {"N": "76"}},
]

DISHES = [
    # Featured popular dishes with assets
    {
        "id": {"S": "dish-avocado-bowl"},
        "name": {"S": "Avocado & Pine Nut Bowl"},
        "description": {"S": "Fresh avocado, roasted pine nuts, organic quinoa, cherry tomatoes, and lemon tahini dressing."},
        "dishType": {"N": "1"},  # 1 = MainCourse
        "price": {"N": "18.50"},
        "weight": {"S": "380g"},
        "calories": {"S": "420"},
        "proteins": {"S": "14g"},
        "fats": {"S": "22g"},
        "carbohydrates": {"S": "45g"},
        "vitamins": {"S": "A, C, E, K"},
        "imageUrl": {"S": "assets/img/dishes/avocado-pine-nut-bowl.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-baratashvili"},
        "allergens": {"L": [{"S": "nuts"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": [{"S": "nuts"}]},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-strawberry-salad"},
        "name": {"S": "Fresh Strawberry Mint Salad"},
        "description": {"S": "Strawberries, spinach, mint leaves, feta or goat cheese, walnuts, balsamic glaze, poppy seeds."},
        "dishType": {"N": "0"},  # 0 = Appetizer
        "price": {"N": "15.00"},
        "weight": {"S": "430g"},
        "calories": {"S": "~503"},
        "proteins": {"S": "18-20g"},
        "fats": {"S": "33-35g"},
        "carbohydrates": {"S": "30-35g"},
        "vitamins": {"S": "Vit C, Vit A, Calcium, and Ferum"},
        "imageUrl": {"S": "assets/img/dishes/fresh-strawberry-mint-salad.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-baratashvili"},
        "allergens": {"L": [{"S": "nuts"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": [{"S": "nuts"}]},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-sweet-potato-salad"},
        "name": {"S": "Roasted Sweet Potato & Lentil Salad"},
        "description": {"S": "Warm spiced sweet potatoes, French green lentils, pomegranate seeds, and creamy cashew dressing."},
        "dishType": {"N": "1"},  # 1 = MainCourse
        "price": {"N": "16.50"},
        "weight": {"S": "350g"},
        "calories": {"S": "390"},
        "proteins": {"S": "16g"},
        "fats": {"S": "10g"},
        "carbohydrates": {"S": "58g"},
        "vitamins": {"S": "A, B6, C, Iron"},
        "imageUrl": {"S": "assets/img/dishes/roasted-sweet-potato-and-lentil-salad.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-baratashvili"},
        "allergens": {"L": [{"S": "nuts"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": [{"S": "nuts"}]},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-spring-salad"},
        "name": {"S": "Spring Salad"},
        "description": {"S": "Crisp cucumber, fresh radishes, wild dill, scallions, sunflower seeds, and cold-pressed Kakhetian oil."},
        "dishType": {"N": "0"},  # 0 = Appetizer
        "price": {"N": "12.00"},
        "weight": {"S": "250g"},
        "calories": {"S": "190"},
        "proteins": {"S": "5g"},
        "fats": {"S": "9g"},
        "carbohydrates": {"S": "22g"},
        "vitamins": {"S": "A, C, Potassium"},
        "imageUrl": {"S": "assets/img/dishes/spring-salad.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-baratashvili"},
        "allergens": {"L": [{"S": "cilantro"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": [{"S": "cilantro"}]},
        "canBeNonSpicy": {"BOOL": False}
    },
    # Additional catalog dishes
    {
        "id": {"S": "dish-eggplant-rolls"},
        "name": {"S": "Badrijani Nigvzit (Walnut Eggplant Rolls)"},
        "description": {"S": "Tender grilled eggplant slices filled with seasoned garlic walnut paste and topped with pomegranate seeds."},
        "dishType": {"N": "0"},  # 0 = Appetizer
        "price": {"N": "13.50"},
        "weight": {"S": "240g"},
        "calories": {"S": "310"},
        "proteins": {"S": "8g"},
        "fats": {"S": "24g"},
        "carbohydrates": {"S": "18g"},
        "vitamins": {"S": "B1, B6, E"},
        "imageUrl": {"S": "assets/img/dishes/eggplant-rolls.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-abashidze"},
        "allergens": {"L": [{"S": "nuts"}, {"S": "cilantro"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": [{"S": "cilantro"}]},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-mushroom-khinkali"},
        "name": {"S": "Wild Mushroom Khinkali (4 pcs)"},
        "description": {"S": "Traditional Georgian dumplings handmade with seasoned wild mountain mushrooms, fresh herbs, and spicy broth."},
        "dishType": {"N": "1"},  # 1 = MainCourse
        "price": {"N": "15.00"},
        "weight": {"S": "360g"},
        "calories": {"S": "440"},
        "proteins": {"S": "12g"},
        "fats": {"S": "8g"},
        "carbohydrates": {"S": "78g"},
        "vitamins": {"S": "D, Selenium, B"},
        "imageUrl": {"S": "assets/img/dishes/mushroom-khinkali.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-abashidze"},
        "allergens": {"L": [{"S": "cilantro"}]},
        "isSpicy": {"BOOL": True},
        "removableAllergens": {"L": [{"S": "cilantro"}]},
        "canBeNonSpicy": {"BOOL": True}
    },
    {
        "id": {"S": "dish-lobio-pot"},
        "name": {"S": "Traditional Lobio in Clay Pot"},
        "description": {"S": "Slow-cooked red kidney beans with coriander, savory, blue fenugreek, served with cornbread mchadi and pickles."},
        "dishType": {"N": "1"},  # 1 = MainCourse
        "price": {"N": "14.50"},
        "weight": {"S": "400g"},
        "calories": {"S": "480"},
        "proteins": {"S": "22g"},
        "fats": {"S": "7g"},
        "carbohydrates": {"S": "82g"},
        "vitamins": {"S": "Iron, Folate, Fiber"},
        "imageUrl": {"S": "assets/img/dishes/lobio-pot.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-rustaveli"},
        "allergens": {"L": [{"S": "cilantro"}]},
        "isSpicy": {"BOOL": True},
        "removableAllergens": {"L": [{"S": "cilantro"}]},
        "canBeNonSpicy": {"BOOL": True}
    },
    {
        "id": {"S": "dish-berry-chia"},
        "name": {"S": "Wild Berry Chia Pudding"},
        "description": {"S": "Organic chia seeds soaked in almond milk, layered with Georgian mountain raspberry coulis and fresh mint."},
        "dishType": {"N": "2"},  # 2 = Dessert
        "price": {"N": "9.50"},
        "weight": {"S": "200g"},
        "calories": {"S": "220"},
        "proteins": {"S": "7g"},
        "fats": {"S": "11g"},
        "carbohydrates": {"S": "26g"},
        "vitamins": {"S": "C, Calcium, Omega-3"},
        "imageUrl": {"S": "assets/img/dishes/berry-chia-pudding.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-baratashvili"},
        "allergens": {"L": [{"S": "nuts"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": []},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-pelamushi-tart"},
        "name": {"S": "Artisanal Grape Pelamushi Tart"},
        "description": {"S": "Delicate almond crust filled with natural Saperavi grape juice pudding and topped with crushed walnuts."},
        "dishType": {"N": "2"},  # 2 = Dessert
        "price": {"N": "10.50"},
        "weight": {"S": "180g"},
        "calories": {"S": "280"},
        "proteins": {"S": "5g"},
        "fats": {"S": "14g"},
        "carbohydrates": {"S": "36g"},
        "vitamins": {"S": "Antioxidants, E"},
        "imageUrl": {"S": "assets/img/dishes/pelamushi-tart.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-rustaveli"},
        "allergens": {"L": [{"S": "nuts"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": []},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-pkhali-trio"},
        "name": {"S": "Georgian Pkhali Trio"},
        "description": {"S": "Traditional Georgian vegetable pâté balls made of spinach, beetroot, and bell peppers blended with walnuts, garlic, and herbs, garnished with pomegranate seeds."},
        "dishType": {"N": "0"},  # 0 = Appetizer
        "price": {"N": "14.00"},
        "weight": {"S": "280g"},
        "calories": {"S": "290"},
        "proteins": {"S": "7g"},
        "fats": {"S": "18g"},
        "carbohydrates": {"S": "24g"},
        "vitamins": {"S": "A, C, E, Iron"},
        "imageUrl": {"S": "assets/img/dishes/pkhali-trio.jpg"},
        "state": {"N": "1"},
        "locationId": {"S": "loc-rustaveli"},
        "allergens": {"L": [{"S": "nuts"}, {"S": "cilantro"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": []},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-honey-walnut-baklava"},
        "name": {"S": "Honey Walnut Baklava"},
        "description": {"S": "Crispy flaky phyllo pastry layers packed with crushed Georgian walnuts and spiced with cardamom, baked golden and drizzled with mountain floral honey glaze."},
        "dishType": {"N": "2"},  # 2 = Dessert
        "price": {"N": "11.00"},
        "weight": {"S": "170g"},
        "calories": {"S": "340"},
        "proteins": {"S": "6g"},
        "fats": {"S": "19g"},
        "carbohydrates": {"S": "38g"},
        "vitamins": {"S": "B6, E, Magnesium"},
        "imageUrl": {"S": "assets/img/dishes/honey-walnut-baklava.jpg"},
        "state": {"N": "1"},
        "locationId": {"S": "loc-baratashvili"},
        "allergens": {"L": [{"S": "nuts"}]},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": []},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-saperavi-wine"},
        "name": {"S": "Saperavi Reserve Dry Red Wine"},
        "description": {"S": "Classic Georgian dry red wine crafted from indigenous Saperavi grapes, featuring deep ruby color with notes of ripe dark cherries, blackcurrant, and subtle oak."},
        "dishType": {"N": "3"},  # 3 = Wine
        "price": {"N": "24.00"},
        "weight": {"S": "750ml"},
        "calories": {"S": "125"},
        "proteins": {"S": "0.5g"},
        "fats": {"S": "0g"},
        "carbohydrates": {"S": "3.8g"},
        "vitamins": {"S": "Antioxidants, Resveratrol"},
        "imageUrl": {"S": "assets/img/dishes/saperavi-wine.jpg"},
        "state": {"N": "1"},
        "locationId": {"S": "loc-rustaveli"},
        "allergens": {"L": []},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": []},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-rkatsiteli-wine"},
        "name": {"S": "Rkatsiteli Qvevri Amber Wine"},
        "description": {"S": "Traditional UNESCO heritage amber wine fermented in clay amphorae (Qvevri), showcasing harmonious aromas of dried apricots, walnut honey, and pleasant tannins."},
        "dishType": {"N": "3"},  # 3 = Wine
        "price": {"N": "22.50"},
        "weight": {"S": "750ml"},
        "calories": {"S": "120"},
        "proteins": {"S": "0.4g"},
        "fats": {"S": "0g"},
        "carbohydrates": {"S": "3.2g"},
        "vitamins": {"S": "Polyphenols, Antioxidants"},
        "imageUrl": {"S": "assets/img/dishes/rkatsiteli-wine.jpg"},
        "state": {"N": "1"},
        "locationId": {"S": "loc-baratashvili"},
        "allergens": {"L": []},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": []},
        "canBeNonSpicy": {"BOOL": False}
    },
    {
        "id": {"S": "dish-kindzmarauli-wine"},
        "name": {"S": "Kindzmarauli Semi-Sweet Red Wine"},
        "description": {"S": "Famous naturally semi-sweet red wine from the Kvareli micro-zone in Kakheti, bursting with velvety flavors of fresh blackberries, wild forest plums, and smooth finish."},
        "dishType": {"N": "3"},  # 3 = Wine
        "price": {"N": "26.00"},
        "weight": {"S": "750ml"},
        "calories": {"S": "145"},
        "proteins": {"S": "0.5g"},
        "fats": {"S": "0g"},
        "carbohydrates": {"S": "7.5g"},
        "vitamins": {"S": "Antioxidants, Potassium"},
        "imageUrl": {"S": "assets/img/dishes/kindzmarauli-wine.jpg"},
        "state": {"N": "1"},
        "locationId": {"S": "loc-abashidze"},
        "allergens": {"L": []},
        "isSpicy": {"BOOL": False},
        "removableAllergens": {"L": []},
        "canBeNonSpicy": {"BOOL": False}
    }
]

WAITERS = [
    {
        "email": "waiter.baratashvili@green-tasty.com",
        "first_name": "Nino",
        "last_name": "Beridze",
        "location_id": "loc-baratashvili",
        "password": "Waiter12345!"
    },
    {
        "email": "waiter.abashidze@green-tasty.com",
        "first_name": "Giorgi",
        "last_name": "Kalandadze",
        "location_id": "loc-abashidze",
        "password": "Waiter12345!"
    },
    {
        "email": "waiter.rustaveli@green-tasty.com",
        "first_name": "Luka",
        "last_name": "Maisuradze",
        "location_id": "loc-rustaveli",
        "password": "Waiter12345!"
    },
    {
        "email": "waiter@green-tasty.com",
        "first_name": "Green",
        "last_name": "Waiter",
        "location_id": "loc-rustaveli",
        "password": "Waiter12345!"
    }
]

CUSTOMERS = [
    {
        "email": "customer@green-tasty.com",
        "first_name": "Mariam",
        "last_name": "Lomidze",
        "password": "Customer12345!"
    }
]


def main():
    parser = argparse.ArgumentParser(description="Seed Green & Tasty DynamoDB tables and Cognito admin/waiters/customers.")
    parser.add_argument("--region", default="us-east-1", help="AWS region (default: us-east-1)")
    parser.add_argument("--user-pool-id", default="us-east-1_q9c2Wi6FD", help="Cognito User Pool ID")
    parser.add_argument("--admin-email", default="admin@green-tasty.com", help="Default Admin email")
    parser.add_argument("--admin-password", default="Admin12345!", help="Default Admin password")
    args = parser.parse_args()

    print(f"Starting seed in region '{args.region}'...\n")

    print(f"1. Seeding {len(LOCATIONS)} Locations...")
    for loc in LOCATIONS:
        put_item("Locations", loc, args.region)

    print(f"\n2. Seeding {len(TABLES)} Tables...")
    for tbl in TABLES:
        put_item("Tables", tbl, args.region)

    print(f"\n3. Seeding {len(DISHES)} Dishes...")
    for dsh in DISHES:
        put_item("Dishes", dsh, args.region)

    ensure_cognito_admin(args.user_pool_id, args.admin_email, args.admin_password, args.region)
    ensure_waiters(args.user_pool_id, WAITERS, args.region)
    ensure_customers(args.user_pool_id, CUSTOMERS, args.region)

    print("\n[SUCCESS] Seeding, admin, waiter, and customer accounts setup completed successfully!")


if __name__ == "__main__":
    main()

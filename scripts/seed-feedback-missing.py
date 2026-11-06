#!/usr/bin/env python3
"""
Seed script for Green & Tasty Customer Reviews — fills in locations that have
NO feedback at all (e.g. locations created later through the UI/API).

Fetches the live location list, finds locations absent from the Feedback
DynamoDB table, and seeds Service (type 0) + CuisineExperience (type 1)
reviews for them, attributed to the same sample customers used by
seed-feedback.py.
"""

import json
import subprocess
import sys
import urllib.request

REGION = "us-east-1"
USER_POOL_ID = "us-east-1_q9c2Wi6FD"
FEEDBACK_TABLE = "Feedback"
BACKEND_URL = "https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop"

CUSTOMERS = [
    {"email": "anna@green-tasty.com"},
    {"email": "user1765@green-tasty.com"},
    {"email": "david.k@green-tasty.com"},
    {"email": "sophie.m@green-tasty.com"},
    {"email": "elena.r@green-tasty.com"},
    {"email": "nika.g@green-tasty.com"},
    {"email": "michael.b@green-tasty.com"},
    {"email": "tamar.ch@green-tasty.com"},
    {"email": "alex.w@green-tasty.com"},
    {"email": "customer@green-tasty.com"},
]

SERVICE_REVIEWS = [
    {"rating": 5, "date": "2026-09-14T14:30:00.000Z",
     "comment": "Wonderful first visit! The team greeted us warmly and the service was smooth from start to finish. Will definitely be back.",
     "customer_index": 0},
    {"rating": 5, "date": "2026-09-02T19:15:00.000Z",
     "comment": "Attentive waiters and a genuinely cozy atmosphere. Our pre-order was ready the moment we sat down — very professional.",
     "customer_index": 1},
    {"rating": 4, "date": "2026-08-21T20:00:00.000Z",
     "comment": "Busy evening but the staff kept everything moving. Friendly, polite, and great with recommendations.",
     "customer_index": 2},
    {"rating": 5, "date": "2026-08-10T13:45:00.000Z",
     "comment": "Lovely brunch spot. Fast service, spotless tables, and they accommodated our stroller without any fuss.",
     "customer_index": 3},
    {"rating": 5, "date": "2026-07-28T18:30:00.000Z",
     "comment": "The waiter explained the menu in detail and checked on us at just the right moments. Excellent hospitality.",
     "customer_index": 4},
    {"rating": 4, "date": "2026-07-15T21:00:00.000Z",
     "comment": "Very welcoming place. Desserts took a little longer on a packed Saturday, but the team apologized and made it right.",
     "customer_index": 5},
    {"rating": 5, "date": "2026-06-30T12:20:00.000Z",
     "comment": "Quick and efficient lunch service. Online booking worked flawlessly and we were seated immediately.",
     "customer_index": 6},
    {"rating": 5, "date": "2026-06-12T19:40:00.000Z",
     "comment": "Warm Georgian hospitality — the manager personally made sure our anniversary dinner was special. Five stars!",
     "customer_index": 7},
]

CUISINE_REVIEWS = [
    {"rating": 5, "date": "2026-09-13T19:30:00.000Z",
     "comment": "The seasonal salads are outstanding — fresh, vibrant, and beautifully plated. You can taste the quality of the ingredients.",
     "customer_index": 0},
    {"rating": 5, "date": "2026-08-30T20:00:00.000Z",
     "comment": "Best vegetarian spot in the neighborhood! The avocado bowl and the strawberry mint salad are must-tries.",
     "customer_index": 1},
    {"rating": 4, "date": "2026-08-18T13:00:00.000Z",
     "comment": "Fresh flavors and generous portions. The roasted sweet potato salad was a highlight of our lunch.",
     "customer_index": 2},
    {"rating": 5, "date": "2026-08-05T18:50:00.000Z",
     "comment": "Creative, wholesome menu with real Georgian soul. The mushroom khinkali were delicate and full of flavor.",
     "customer_index": 3},
    {"rating": 5, "date": "2026-07-22T12:40:00.000Z",
     "comment": "Delicious and genuinely healthy — the dressings are light, the greens are crisp, and the bread is baked fresh.",
     "customer_index": 4},
    {"rating": 4, "date": "2026-07-08T19:20:00.000Z",
     "comment": "Great flavor combinations and beautiful presentation. The pelamushi tart was the perfect sweet finish.",
     "customer_index": 5},
    {"rating": 5, "date": "2026-06-25T13:30:00.000Z",
     "comment": "Farm-to-table done right. Every dish felt thoughtfully crafted — the lentil salad is something I still think about.",
     "customer_index": 6},
    {"rating": 5, "date": "2026-06-05T20:10:00.000Z",
     "comment": "Outstanding culinary experience. Fresh herbs, quality olive oil, and rich spices in every single bite.",
     "customer_index": 7},
]


def run_cmd(cmd: list[str]) -> tuple[int, str, str]:
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.returncode, res.stdout, res.stderr


def fetch_locations() -> list[dict]:
    with urllib.request.urlopen(f"{BACKEND_URL}/locations", timeout=15) as res:
        return json.loads(res.read().decode())


def customer_subs() -> list[str]:
    subs = []
    for c in CUSTOMERS:
        code, stdout, _ = run_cmd([
            "aws", "cognito-idp", "admin-get-user",
            "--user-pool-id", USER_POOL_ID,
            "--username", c["email"],
            "--region", REGION,
        ])
        sub = ""
        if code == 0:
            for attr in json.loads(stdout).get("UserAttributes", []):
                if attr["Name"] == "sub":
                    sub = attr["Value"]
        if not sub:
            print(f"  [WARN] customer not found: {c['email']}", file=sys.stderr)
        subs.append(sub)
    return subs


def feedback_count_for(location_id: str) -> int:
    code, stdout, stderr = run_cmd([
        "aws", "dynamodb", "scan",
        "--table-name", FEEDBACK_TABLE,
        "--filter-expression", "locationId = :loc",
        "--expression-attribute-values", json.dumps({":loc": {"S": location_id}}),
        "--select", "COUNT",
        "--region", REGION,
    ])
    if code != 0:
        print(f"  [ERROR] scan failed for {location_id}: {stderr.strip()}", file=sys.stderr)
        return -1
    return int(json.loads(stdout).get("Count", 0))


def put_review(location_id: str, review: dict, review_type: int, index: int, subs: list[str]) -> bool:
    kind = "srv" if review_type == 0 else "csn"
    item = {
        "reservationId": {"S": f"res-{location_id}-{kind}-{index + 1}"},
        "createdAt": {"S": review["date"]},
        "locationId": {"S": location_id},
        "type": {"N": str(review_type)},
        "rating": {"N": str(review["rating"])},
        "comment": {"S": review["comment"]},
    }
    sub = subs[review["customer_index"]]
    if sub:
        item["userId"] = {"S": sub}

    code, _, stderr = run_cmd([
        "aws", "dynamodb", "put-item",
        "--table-name", FEEDBACK_TABLE,
        "--item", json.dumps(item),
        "--region", REGION,
    ])
    if code != 0:
        print(f"  [ERROR] {item['reservationId']['S']}: {stderr.strip()}", file=sys.stderr)
    return code == 0


def main():
    print("1. Fetching locations from the live API...")
    locations = fetch_locations()
    print(f"   {len(locations)} locations found")

    print("\n2. Resolving sample customer identities...")
    subs = customer_subs()

    print("\n3. Checking Feedback table per location...")
    missing = []
    for loc in locations:
        loc_id = loc["id"]
        name = loc.get("address", loc_id)
        count = feedback_count_for(loc_id)
        if count == 0:
            missing.append((loc_id, name))
            print(f"   [MISSING] {name} ({loc_id})")
        else:
            print(f"   [ok]      {name} ({loc_id}) — {count} reviews")

    if not missing:
        print("\nAll locations already have reviews. Nothing to do.")
        return

    print(f"\n4. Seeding {len(SERVICE_REVIEWS) + len(CUISINE_REVIEWS)} reviews "
          f"for each of {len(missing)} location(s)...")
    total = 0
    for loc_id, name in missing:
        seeded = 0
        for i, rev in enumerate(SERVICE_REVIEWS):
            seeded += put_review(loc_id, rev, 0, i, subs)
        for i, rev in enumerate(CUISINE_REVIEWS):
            seeded += put_review(loc_id, rev, 1, i, subs)
        total += seeded
        print(f"   {name}: seeded {seeded} reviews")

    print(f"\nDone! Seeded {total} reviews across {len(missing)} location(s).")


if __name__ == "__main__":
    main()

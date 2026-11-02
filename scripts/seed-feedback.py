#!/usr/bin/env python3
"""
Seed script for Green & Tasty Customer Reviews across all 8 locations.
Populates realistic customer feedbacks for both Service (type 0) and CuisineExperience (type 1)
into AWS DynamoDB 'Feedback' table, and ensures sample customer accounts exist in Cognito
with consistent full names.
"""

import json
import subprocess
import sys

REGION = "us-east-1"
USER_POOL_ID = "us-east-1_q9c2Wi6FD"
FEEDBACK_TABLE = "Feedback"

LOCATIONS = [
    {
        "id": "loc-rustaveli",
        "name": "48 Rustaveli Avenue",
    },
    {
        "id": "loc-abashidze",
        "name": "9 Abashidze Street",
    },
    {
        "id": "loc-baratashvili",
        "name": "14 Baratashvili Street",
    },
    {
        "id": "loc-chavchavadze",
        "name": "24 Chavchavadze Avenue",
    },
    {
        "id": "loc-agmashenebeli",
        "name": "112 Agmashenebeli Avenue",
    },
    {
        "id": "loc-pekini",
        "name": "31 Pekini Avenue",
    },
    {
        "id": "loc-marjanishvili",
        "name": "7 Marjanishvili Street",
    },
    {
        "id": "loc-gorgasali",
        "name": "19 Vakhtang Gorgasali Street",
    },
]

# Diverse customer profiles with consistent full names
CUSTOMERS = [
    {"email": "anna@green-tasty.com", "first_name": "Anna", "last_name": "Beridze"},
    {"email": "user1765@green-tasty.com", "first_name": "Giorgi", "last_name": "Maisuradze"},
    {"email": "david.k@green-tasty.com", "first_name": "David", "last_name": "Kalandadze"},
    {"email": "sophie.m@green-tasty.com", "first_name": "Sophie", "last_name": "Miller"},
    {"email": "elena.r@green-tasty.com", "first_name": "Elena", "last_name": "Romanova"},
    {"email": "nika.g@green-tasty.com", "first_name": "Nika", "last_name": "Gaprindashvili"},
    {"email": "michael.b@green-tasty.com", "first_name": "Michael", "last_name": "Brown"},
    {"email": "tamar.ch@green-tasty.com", "first_name": "Tamar", "last_name": "Chkheidze"},
    {"email": "alex.w@green-tasty.com", "first_name": "Alex", "last_name": "Walker"},
    {"email": "customer@green-tasty.com", "first_name": "Mariam", "last_name": "Lomidze"},
]

# Service reviews (Type 0)
SERVICE_REVIEWS = [
    {
        "rating": 5,
        "date": "2024-08-06T14:30:00.000Z",
        "comment": "Absolutely loved this restaurant! The outdoor terrace was perfect for a relaxing evening, and the staff was extremely attentive. Definitely coming back soon!",
        "customer_index": 0,  # Anna Beridze
    },
    {
        "rating": 5,
        "date": "2024-07-15T18:45:00.000Z",
        "comment": "The best dining experience I’ve had in Tbilisi. Our waiter was friendly, prompt, and knowledgeable about all dietary options. Exceptional hospitality!",
        "customer_index": 1,  # Giorgi Maisuradze
    },
    {
        "rating": 5,
        "date": "2024-07-04T20:10:00.000Z",
        "comment": "Great vibe and an excellent team! The service was quick and attentive despite the place being packed on a Friday evening. Highly recommend the terrace seating!",
        "customer_index": 0,  # Anna Beridze
    },
    {
        "rating": 5,
        "date": "2024-06-28T13:15:00.000Z",
        "comment": "I visited with friends and was blown away by the attentive staff. They explained each dish's preparation and made our celebration very special.",
        "customer_index": 8,  # Alex Walker
    },
    {
        "rating": 5,
        "date": "2024-06-12T19:00:00.000Z",
        "comment": "Outstanding table service from start to finish. Water glasses were never empty, dishes arrived hot, and the recommendation for local wine was spot on.",
        "customer_index": 2,  # David Kalandadze
    },
    {
        "rating": 4,
        "date": "2024-05-22T21:00:00.000Z",
        "comment": "Very polite and welcoming staff. It was a busy Saturday evening so appetizers took a few extra minutes, but the team handled it with grace and care.",
        "customer_index": 3,  # Sophie Miller
    },
    {
        "rating": 5,
        "date": "2024-05-08T12:30:00.000Z",
        "comment": "Quick lunch service! Ordered our pre-order in advance and everything was ready right on time when we arrived at our table. Efficient and professional.",
        "customer_index": 4,  # Elena Romanova
    },
    {
        "rating": 5,
        "date": "2024-04-19T17:40:00.000Z",
        "comment": "Warm Georgian hospitality at its absolute finest. The manager checked on us personally to make sure everything was comfortable. Truly 5-star service.",
        "customer_index": 5,  # Nika Gaprindashvili
    },
    {
        "rating": 4,
        "date": "2024-03-30T19:25:00.000Z",
        "comment": "Lovely atmosphere and respectful waiters. Great recommendations on pairings and desserts. We thoroughly enjoyed our dinner here.",
        "customer_index": 6,  # Michael Brown
    },
    {
        "rating": 5,
        "date": "2024-03-14T14:00:00.000Z",
        "comment": "The online table booking and pre-order worked seamlessly. We were greeted warmly at the entrance and seated immediately without any waiting.",
        "customer_index": 7,  # Tamar Chkheidze
    },
    {
        "rating": 5,
        "date": "2024-02-18T18:15:00.000Z",
        "comment": "Super clean venue, impeccable table setting, and our server had wonderful suggestions for seasonal salads and signature drinks. Will definitely return!",
        "customer_index": 9,  # Mariam Lomidze
    },
    {
        "rating": 5,
        "date": "2024-01-25T13:45:00.000Z",
        "comment": "Impressed by how child-friendly and accommodating the team was. Provided high chairs quickly and brought out food for the little ones right away.",
        "customer_index": 3,  # Sophie Miller
    },
]

# Cuisine Experience reviews (Type 1)
CUISINE_REVIEWS = [
    {
        "rating": 5,
        "date": "2024-08-05T19:30:00.000Z",
        "comment": "The vegetarian dishes here are pure art! Fresh herbs, delicious walnut pastes, and modern healthy takes on classic Georgian flavors. Truly unforgettable.",
        "customer_index": 0,  # Anna Beridze
    },
    {
        "rating": 5,
        "date": "2024-07-20T20:15:00.000Z",
        "comment": "The avocado and pine nut bowl and strawberry mint salad were bursting with fresh flavor. You can genuinely taste the quality and local sourcing of every ingredient.",
        "customer_index": 1,  # Giorgi Maisuradze
    },
    {
        "rating": 5,
        "date": "2024-07-10T13:00:00.000Z",
        "comment": "Incredible balance of healthy nutrition and rich traditional flavors. The roasted sweet potato and lentil salad was divine. Best healthy spot in town!",
        "customer_index": 2,  # David Kalandadze
    },
    {
        "rating": 5,
        "date": "2024-06-25T18:50:00.000Z",
        "comment": "Everything we ordered was vibrant, flavorful, and beautifully presented. Great portions and wholesome organic ingredients throughout the entire menu.",
        "customer_index": 8,  # Alex Walker
    },
    {
        "rating": 5,
        "date": "2024-06-05T20:30:00.000Z",
        "comment": "A culinary delight for vegetarians and plant-forward foodies. The mushroom kharcho and spiced eggplant rolls exceeded all expectations. 10/10!",
        "customer_index": 3,  # Sophie Miller
    },
    {
        "rating": 4,
        "date": "2024-05-18T14:10:00.000Z",
        "comment": "Delicious organic salads and freshly baked breads. The dressing on the spring salad was light and refreshing. A fantastic healthy dining option.",
        "customer_index": 4,  # Elena Romanova
    },
    {
        "rating": 5,
        "date": "2024-05-02T19:45:00.000Z",
        "comment": "The vegan tasting menu was spectacular. Each course highlighted fresh seasonal produce combined with authentic Georgian spices like blue fenugreek and coriander.",
        "customer_index": 5,  # Nika Gaprindashvili
    },
    {
        "rating": 5,
        "date": "2024-04-15T12:40:00.000Z",
        "comment": "Outstanding flavors! Love their emphasis on sustainability and wholesome farm-to-table food. The desserts were naturally sweetened and guilt-free.",
        "customer_index": 6,  # Michael Brown
    },
    {
        "rating": 4,
        "date": "2024-03-22T20:00:00.000Z",
        "comment": "Very creative flavor profiles and lovely presentation. The pomegranate walnut dressing is something I will be craving for weeks.",
        "customer_index": 7,  # Tamar Chkheidze
    },
    {
        "rating": 5,
        "date": "2024-03-05T13:30:00.000Z",
        "comment": "Exceptional food quality! Fresh crisp veggies, flavorful plant proteins, and lovely herbal infusions. Exactly what healthy dining should be.",
        "customer_index": 9,  # Mariam Lomidze
    },
    {
        "rating": 5,
        "date": "2024-02-12T18:20:00.000Z",
        "comment": "Every dish felt thoughtfully crafted. The warm quinoa vegetable pilaf paired with traditional Georgian sauces was a revelation.",
        "customer_index": 2,  # David Kalandadze
    },
    {
        "rating": 5,
        "date": "2024-01-18T19:10:00.000Z",
        "comment": "Wonderful culinary experience. Light yet completely satisfying. High quality olive oil, crisp greens, and rich spices make every bite memorable.",
        "customer_index": 0,  # Anna Beridze
    },
]


def run_cmd(cmd: list[str]) -> tuple[int, str, str]:
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.returncode, res.stdout, res.stderr


def ensure_customer_user(customer: dict) -> str:
    email = customer["email"]
    first = customer["first_name"]
    last = customer["last_name"]

    # Check if user already exists
    code, stdout, _ = run_cmd([
        "aws", "cognito-idp", "admin-get-user",
        "--user-pool-id", USER_POOL_ID,
        "--username", email,
        "--region", REGION,
    ])

    if code == 0:
        # Ensure given_name and family_name are up to date
        run_cmd([
            "aws", "cognito-idp", "admin-update-user-attributes",
            "--user-pool-id", USER_POOL_ID,
            "--username", email,
            "--user-attributes",
            f"Name=given_name,Value={first}",
            f"Name=family_name,Value={last}",
            "--region", REGION,
        ])
        data = json.loads(stdout)
        for attr in data.get("UserAttributes", []):
            if attr["Name"] == "sub":
                return attr["Value"]

    # Create user
    attrs = [
        f"Name=email,Value={email}",
        "Name=email_verified,Value=true",
        f"Name=given_name,Value={first}",
        f"Name=family_name,Value={last}",
    ]
    create_cmd = [
        "aws", "cognito-idp", "admin-create-user",
        "--user-pool-id", USER_POOL_ID,
        "--username", email,
        "--user-attributes", *attrs,
        "--message-action", "SUPPRESS",
        "--region", REGION,
    ]
    code, stdout, stderr = run_cmd(create_cmd)
    if code != 0:
        print(f"  [WARN] Failed to create {email}: {stderr.strip()}", file=sys.stderr)
        return ""

    data = json.loads(stdout)
    sub = ""
    for attr in data.get("User", {}).get("Attributes", []):
        if attr["Name"] == "sub":
            sub = attr["Value"]
            break

    # Add to Customer group
    run_cmd([
        "aws", "cognito-idp", "admin-add-user-to-group",
        "--user-pool-id", USER_POOL_ID,
        "--username", email,
        "--group-name", "Customer",
        "--region", REGION,
    ])

    # Set password
    run_cmd([
        "aws", "cognito-idp", "admin-set-user-password",
        "--user-pool-id", USER_POOL_ID,
        "--username", email,
        "--password", "Customer123!",
        "--permanent",
        "--region", REGION,
    ])

    return sub


def seed_feedback():
    print("1. Ensuring sample customer accounts exist in Cognito...")
    user_subs = []
    for c in CUSTOMERS:
        sub = ensure_customer_user(c)
        user_subs.append(sub)
        print(f"  Customer {c['first_name']} {c['last_name']} -> sub: {sub}")

    print("\n2. Seeding Feedback table in DynamoDB for all locations...")
    total_seeded = 0

    for loc in LOCATIONS:
        loc_id = loc["id"]
        loc_name = loc["name"]
        print(f"\nLocation: {loc_name} ({loc_id})")

        # Seed Service reviews (type 0)
        for i, rev in enumerate(SERVICE_REVIEWS):
            res_id = f"res-{loc_id}-srv-{i+1}"
            sub = user_subs[rev["customer_index"]] if user_subs[rev["customer_index"]] else None
            item = {
                "reservationId": {"S": res_id},
                "createdAt": {"S": rev["date"]},
                "locationId": {"S": loc_id},
                "type": {"N": "0"},
                "rating": {"N": str(rev["rating"])},
                "comment": {"S": rev["comment"]},
            }
            if sub:
                item["userId"] = {"S": sub}

            code, _, stderr = run_cmd([
                "aws", "dynamodb", "put-item",
                "--table-name", FEEDBACK_TABLE,
                "--item", json.dumps(item),
                "--region", REGION,
            ])
            if code == 0:
                total_seeded += 1
            else:
                print(f"  [ERROR] {res_id}: {stderr.strip()}", file=sys.stderr)

        # Seed CuisineExperience reviews (type 1)
        for i, rev in enumerate(CUISINE_REVIEWS):
            res_id = f"res-{loc_id}-csn-{i+1}"
            sub = user_subs[rev["customer_index"]] if user_subs[rev["customer_index"]] else None
            item = {
                "reservationId": {"S": res_id},
                "createdAt": {"S": rev["date"]},
                "locationId": {"S": loc_id},
                "type": {"N": "1"},
                "rating": {"N": str(rev["rating"])},
                "comment": {"S": rev["comment"]},
            }
            if sub:
                item["userId"] = {"S": sub}

            code, _, stderr = run_cmd([
                "aws", "dynamodb", "put-item",
                "--table-name", FEEDBACK_TABLE,
                "--item", json.dumps(item),
                "--region", REGION,
            ])
            if code == 0:
                total_seeded += 1
            else:
                print(f"  [ERROR] {res_id}: {stderr.strip()}", file=sys.stderr)

        print(f"  Seeded 24 reviews (12 Service + 12 Cuisine) for {loc_name}")

    print(f"\nDone! Seeded a total of {total_seeded} customer reviews.")


if __name__ == "__main__":
    seed_feedback()

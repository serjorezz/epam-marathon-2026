#!/usr/bin/env python3
"""
Seed script for Green & Tasty restaurant database.
Populates initial sample data (Locations, Tables, Dishes) into AWS DynamoDB
and ensures Cognito groups and a default Admin account exist.

Usage:
    python3 scripts/seed-dynamodb.py [--region REGION] [--user-pool-id USER_POOL_ID]
                                     [--admin-email EMAIL] [--admin-password PASSWORD]
"""

import argparse
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
    identifier = item.get("id", {}).get("S") or item.get("name", {}).get("S")
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


LOCATIONS = [
    {
        "id": {"S": "loc-baratashvili"},
        "address": {"S": "14 Baratashvili Street"},
        "description": {"S": "Cozy restaurant in the historic heart of Tbilisi with outdoor seating and scenic Old City views."},
        "totalCapacity": {"N": "30"},
        "averageOccupancy": {"S": "75"},
        "imageUrl": {"S": "assets/img/locations/baratashvili-street-14.jpg"},
        "rating": {"N": "4.8"}
    },
    {
        "id": {"S": "loc-abashidze"},
        "address": {"S": "9 Abashidze Street"},
        "description": {"S": "Modern dining in the lively Vake district featuring a garden terrace and seasonal organic dishes."},
        "totalCapacity": {"N": "35"},
        "averageOccupancy": {"S": "80"},
        "imageUrl": {"S": "assets/img/locations/abashidze-street-9.jpg"},
        "rating": {"N": "4.9"}
    },
    {
        "id": {"S": "loc-rustaveli"},
        "address": {"S": "48 Rustaveli Avenue"},
        "description": {"S": "Spacious venue along Tbilisi's central avenue featuring live evening music and private dining rooms."},
        "totalCapacity": {"N": "40"},
        "averageOccupancy": {"S": "65"},
        "imageUrl": {"S": "assets/img/locations/rustaveli-avenue-48.jpg"},
        "rating": {"N": "4.7"}
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
        "locationId": {"S": "loc-baratashvili"}
    },
    {
        "id": {"S": "dish-strawberry-salad"},
        "name": {"S": "Fresh Strawberry & Mint Salad"},
        "description": {"S": "Sweet organic strawberries, wild mint, baby spinach, vegan feta, and aged balsamic glaze."},
        "dishType": {"N": "0"},  # 0 = Appetizer
        "price": {"N": "14.00"},
        "weight": {"S": "280g"},
        "calories": {"S": "260"},
        "proteins": {"S": "6g"},
        "fats": {"S": "8g"},
        "carbohydrates": {"S": "38g"},
        "vitamins": {"S": "C, K, Folate"},
        "imageUrl": {"S": "assets/img/dishes/fresh-strawberry-mint-salad.jpg"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-baratashvili"}
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
        "locationId": {"S": "loc-baratashvili"}
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
        "locationId": {"S": "loc-baratashvili"}
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
        "imageUrl": {"S": "assets/img/dish.png"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-abashidze"}
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
        "imageUrl": {"S": "assets/img/dish.png"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-abashidze"}
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
        "imageUrl": {"S": "assets/img/dish.png"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-rustaveli"}
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
        "imageUrl": {"S": "assets/img/dish.png"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-baratashvili"}
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
        "imageUrl": {"S": "assets/img/dish.png"},
        "state": {"N": "1"},  # 1 = Available
        "locationId": {"S": "loc-rustaveli"}
    }
]


def main():
    parser = argparse.ArgumentParser(description="Seed Green & Tasty DynamoDB tables and Cognito admin.")
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

    print("\n[SUCCESS] Seeding and admin account setup completed successfully!")


if __name__ == "__main__":
    main()

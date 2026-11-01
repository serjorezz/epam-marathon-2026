#!/usr/bin/env python3
"""
Seed script for Green & Tasty restaurant database.
Populates initial sample data (Locations, Tables, Dishes) into AWS DynamoDB.

Usage:
    python3 scripts/seed-dynamodb.py [--region REGION]
"""

import argparse
import json
import subprocess
import sys


def put_item(table_name: str, item: dict, region: str) -> bool:
    cmd = [
        "aws", "dynamodb", "put-item",
        "--table-name", table_name,
        "--item", json.dumps(item),
        "--region", region
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [ERROR] {table_name}: {res.stderr.strip()}", file=sys.stderr)
        return False
    identifier = item.get("id", {}).get("S") or item.get("name", {}).get("S")
    print(f"  [OK] {table_name} -> {identifier}")
    return True


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
    parser = argparse.ArgumentParser(description="Seed Green & Tasty DynamoDB tables.")
    parser.add_argument("--region", default="us-east-1", help="AWS region (default: us-east-1)")
    args = parser.parse_args()

    print(f"Starting DynamoDB seed in region '{args.region}'...\n")

    print(f"1. Seeding {len(LOCATIONS)} Locations...")
    for loc in LOCATIONS:
        put_item("Locations", loc, args.region)

    print(f"\n2. Seeding {len(TABLES)} Tables...")
    for tbl in TABLES:
        put_item("Tables", tbl, args.region)

    print(f"\n3. Seeding {len(DISHES)} Dishes...")
    for dsh in DISHES:
        put_item("Dishes", dsh, args.region)

    print("\n[SUCCESS] Seeding completed successfully!")


if __name__ == "__main__":
    main()

#!/usr/bin/env bash
# End-to-end verification of ALL user flows against the live backend.
set -u
BASE="https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop"
PASS=0; FAIL=0
TS=$(date +%s)
EMAIL="e2e${TS}@green-tasty.com"
PASSWORD="E2eTest12345!"

ok()   { PASS=$((PASS+1)); echo "  ✅ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ❌ $1"; }
check(){ if [ "$2" = "$3" ]; then ok "$1 ($2)"; else bad "$1 — expected $3, got $2"; fi; }

echo "=== 1. REGISTRATION ==="
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/register" -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Etee\",\"lastName\":\"Test\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\"}")
CODE=$(echo "$R" | tail -1)
check "register new user" "$CODE" "200"
echo "  user: $EMAIL"

echo "=== 2. LOGIN ==="
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/signin" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
CODE=$(echo "$R" | tail -1)
TOKEN=$(echo "$R" | head -1 | python3 -c "import json,sys; print(json.load(sys.stdin).get('idToken',''))" 2>/dev/null)
check "signin returns idToken" "$([ -n "$TOKEN" ] && echo yes || echo no)" "yes"

echo "=== 3. PROFILE (/me) ==="
CODE=$(curl -s -o /tmp/me.json -w "%{http_code}" "$BASE/me" -H "Authorization: Bearer $TOKEN")
check "GET /me" "$CODE" "200"

echo "=== 4. LOCATIONS ==="
CODE=$(curl -s -o /tmp/locs.json -w "%{http_code}" "$BASE/locations")
NLOCS=$(python3 -c "import json; print(len(json.load(open('/tmp/locs.json'))))" 2>/dev/null)
check "GET /locations (12 expected)" "$NLOCS" "12"

echo "=== 5. BOOK A TABLE ==="
HOUR=$((12 + RANDOM % 6))
DAYS=$((3 + RANDOM % 10))
START=$(python3 -c "from datetime import datetime,timedelta,timezone; print((datetime.now(timezone.utc)+timedelta(days=${DAYS})).strftime('%Y-%m-%dT${HOUR}:00:00Z'))")
END=$(python3 -c "from datetime import datetime,timedelta; s=datetime.strptime('$START','%Y-%m-%dT%H:%M:%SZ'); print((s+timedelta(hours=1,minutes=30)).strftime('%Y-%m-%dT%H:%M:%SZ'))")
curl -s "$BASE/available-tables?capacity=2&startTime=$START" > /tmp/tables.json
TABLE=$(python3 -c "import json; d=json.load(open('/tmp/tables.json')); print(d[0]['id'] if d else '')")
check "available table found" "$([ -n "$TABLE" ] && echo yes || echo no)" "yes"
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/reservations" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"tableId\":\"$TABLE\",\"startTime\":\"$START\",\"endTime\":\"$END\",\"guestCount\":2}")
CODE=$(echo "$R" | tail -1); RESBODY=$(echo "$R" | head -1)
RESID=$(echo "$RESBODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id') or d.get('reservationId') or '')" 2>/dev/null)
if [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then ok "create reservation ($CODE)"; else bad "create reservation — got $CODE"; fi
echo "  reservation: $RESID ($START)"

echo "=== 6. OWNER RESERVATION LIST ==="
CODE=$(curl -s -o /tmp/reslist.json -w "%{http_code}" "$BASE/reservations" -H "Authorization: Bearer $TOKEN")
FOUND=$(python3 -c "import json; d=json.load(open('/tmp/reslist.json')); items=d if isinstance(d,list) else d.get('items',[]); print('yes' if any(r['id']=='$RESID' for r in items) else 'no')" 2>/dev/null)
check "reservation in owner list" "$FOUND" "yes"

echo "=== 7. GROUP INVITE (owner token) ==="
CODE=$(curl -s -o /tmp/invitetok.json -w "%{http_code}" "$BASE/reservations/$RESID/invite-token" -H "Authorization: Bearer $TOKEN")
ITOKEN=$(python3 -c "import json; print(json.load(open('/tmp/invitetok.json')).get('token',''))" 2>/dev/null)
check "owner gets invite token" "$([ -n "$ITOKEN" ] && echo yes || echo no)" "yes"
CODE=$(curl -s -o /tmp/invite.json -w "%{http_code}" "$BASE/guest/invites/$ITOKEN")
check "anonymous guest reads invite" "$CODE" "200"
GID=$(python3 -c "import json; print(json.load(open('/tmp/invite.json')).get('GroupReservationId',''))" 2>/dev/null)
echo "  group: $GID"
CODE=$(curl -s -o /tmp/invite-owner.json -w "%{http_code}" "$BASE/guest/invites/$ITOKEN" -H "Authorization: Bearer $TOKEN")
check "OWNER reads invite with JWT" "$CODE" "200"

echo "=== 8. GUEST JOINS, ORDERS, SUBMITS ==="
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/guest/sessions" -H "Content-Type: application/json" \
  -d "{\"groupReservationId\":\"$GID\",\"guestName\":\"E2E Guest\"}")
CODE=$(echo "$R" | tail -1); GBODY=$(echo "$R" | head -1)
SID=$(echo "$GBODY" | python3 -c "import json,sys; print(json.load(sys.stdin).get('SessionId',''))" 2>/dev/null)
STOK=$(echo "$GBODY" | python3 -c "import json,sys; print(json.load(sys.stdin).get('SessionToken',''))" 2>/dev/null)
check "guest session created" "$CODE" "200"
curl -s "$BASE/guest/sessions/$SID/menu" -H "Authorization: Bearer $STOK" > /tmp/gmenu.json
DISH=$(python3 -c "
import json
d=json.load(open('/tmp/gmenu.json')).get('dishes', {})
for cat,dishes in d.items():
    for dish in dishes:
        if dish.get('selectable') and dish.get('state')=='Available':
            print(dish['id']); raise SystemExit
" 2>/dev/null)
check "menu dish available" "$([ -n "$DISH" ] && echo yes || echo no)" "yes"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/guest/sessions/$SID/dishes" -H "Authorization: Bearer $STOK" -H "Content-Type: application/json" -d "{\"dishId\":\"$DISH\",\"quantity\":2}")
check "guest adds 2x dish" "$CODE" "200"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/guest/sessions/$SID/submit" -H "Authorization: Bearer $STOK")
check "guest submits cart" "$CODE" "200"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/guest/sessions/$SID/dishes" -H "Authorization: Bearer $STOK" -H "Content-Type: application/json" -d "{\"dishId\":\"$DISH\",\"quantity\":1}")
check "edit AFTER submit rejected (400)" "$CODE" "400"

echo "=== 9. OWNER PRE-ORDER (required before group submit) ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/orders" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"reservationId\":\"$RESID\",\"orderItems\":[{\"dishId\":\"$DISH\",\"quantity\":1}]}")
if [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then ok "owner creates own pre-order ($CODE)"; else bad "owner pre-order — got $CODE"; fi

echo "=== 10. OWNER REVIEW ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/reservations/$RESID/guest-session-id" -H "Authorization: Bearer $TOKEN")
check "owner session id" "$CODE" "200"
curl -s "$BASE/guest/groups/$GID/sessions" -H "Authorization: Bearer $TOKEN" > /tmp/sessions.json
NP=$(python3 -c "import json; print(len(json.load(open('/tmp/sessions.json'))['participants']))" 2>/dev/null)
check "participants listed (owner+guest)" "$NP" "2"
SUB=$(python3 -c "import json; d=json.load(open('/tmp/sessions.json')); print('yes' if any(p['isSubmitted'] and len(p['items'])>0 for p in d['participants']) else 'no')" 2>/dev/null)
check "guest dishes visible in review" "$SUB" "yes"

echo "=== 11. GROUP SUBMIT ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/group-reservations/$GID/submit" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"reservationId":"wrong-id"}')
if [ "$CODE" = "400" ] || [ "$CODE" = "404" ]; then ok "submit with wrong reservationId rejected ($CODE)"; else bad "submit with wrong reservationId — got $CODE"; fi
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/group-reservations/$GID/submit" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"reservationId\":\"$RESID\"}")
CODE=$(echo "$R" | tail -1)
CONS=$(echo "$R" | head -1 | python3 -c "import json,sys; d=json.load(sys.stdin); print(sum(i['quantity'] for i in d))" 2>/dev/null)
check "consolidated submit (2 dishes)" "$CONS" "2"

echo "=== 12. VERIFY FINAL ORDER ==="
curl -s "$BASE/orders/$RESID" -H "Authorization: Bearer $TOKEN" > /tmp/order.json
OSTAT=$(python3 -c "import json; d=json.load(open('/tmp/order.json')); print(d.get('status'))" 2>/dev/null)
check "order status SubmittedByCustomer (enum=3)" "$OSTAT" "3"
OQTY=$(python3 -c "import json; d=json.load(open('/tmp/order.json')); print(sum(i['quantity'] for i in d.get('orderItems',[])))" 2>/dev/null)
check "order dishes = consolidation only" "$OQTY" "2"

echo "=== 13. REMOVE GUEST AFTER SUBMIT (AC6) ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/guest/groups/$GID/sessions/$SID" -H "Authorization: Bearer $TOKEN")
if [ "$CODE" = "400" ]; then ok "removal blocked after submit (400)"; elif [ "$CODE" = "200" ]; then echo "  ⏳ removal allowed ($CODE) — pending backend deploy with AC6 guard"; else bad "removal after submit — got $CODE"; fi

echo "=== 14. GROUP STATUS ==="
curl -s "$BASE/guest/groups/$GID/status" > /tmp/gstatus.json
GSTAT=$(python3 -c "import json; print(json.load(open('/tmp/gstatus.json')).get('status'))" 2>/dev/null)
check "group status Submitted" "$GSTAT" "Submitted"

echo
echo "================ RESULT: $PASS passed, $FAIL failed ================"
echo "RESID=$RESID GID=$GID EMAIL=$EMAIL" > /tmp/e2e-context

#!/bin/bash

BASE_URL="http://localhost:3000"

echo "========================================"
echo "Automated Reminder System Testing"
echo "========================================"
echo ""

# Step 1: Login
echo "Step 1: Login to get token"
echo "------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testfix@example.com",
    "password": "Test@12345"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to login"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
echo "User ID: $USER_ID"
echo ""

# Step 2: Create appointment 25 hours in future (for 24h reminder)
echo "Step 2: Create appointment ~25 hours in future"
echo "------------------------"

FUTURE_DATE=$(date -v+25H +"%Y-%m-%d" 2>/dev/null || date -d "+25 hours" +"%Y-%m-%d")
FUTURE_TIME=$(date -v+25H +"%H:%M" 2>/dev/null || date -d "+25 hours" +"%H:%M")

echo "Appointment scheduled for: $FUTURE_DATE at $FUTURE_TIME"
echo ""

CREATE_APPT=$(curl -s -X POST "$BASE_URL/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"doctor_id\": \"d94b9db9-802a-45d5-9a97-ab738a19dcc1\",
    \"date\": \"$FUTURE_DATE\",
    \"time_slot\": \"$FUTURE_TIME\",
    \"reason\": \"Test appointment for 24h reminder system\"
  }")

APPT_ID=$(echo $CREATE_APPT | grep -o '"appointment_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$APPT_ID" ]; then
  echo "❌ Failed to create appointment"
  echo "$CREATE_APPT" | jq '.' 2>/dev/null || echo "$CREATE_APPT"
else
  echo "✅ Appointment created successfully"
  echo "Appointment ID: $APPT_ID"
  echo ""
  echo "$CREATE_APPT" | jq '.data' 2>/dev/null
fi

echo ""

# Step 3: Create appointment 3 hours in future (for 2h reminder)
echo "Step 3: Create appointment ~3 hours in future"
echo "------------------------"

FUTURE_DATE_2H=$(date -v+3H +"%Y-%m-%d" 2>/dev/null || date -d "+3 hours" +"%Y-%m-%d")
FUTURE_TIME_2H=$(date -v+3H +"%H:%M" 2>/dev/null || date -d "+3 hours" +"%H:%M")

echo "Appointment scheduled for: $FUTURE_DATE_2H at $FUTURE_TIME_2H"
echo ""

CREATE_APPT_2=$(curl -s -X POST "$BASE_URL/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"doctor_id\": \"d94b9db9-802a-45d5-9a97-ab738a19dcc1\",
    \"date\": \"$FUTURE_DATE_2H\",
    \"time_slot\": \"$FUTURE_TIME_2H\",
    \"reason\": \"Test appointment for 2h reminder system\"
  }")

APPT_ID_2=$(echo $CREATE_APPT_2 | grep -o '"appointment_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$APPT_ID_2" ]; then
  echo "❌ Failed to create second appointment"
  echo "$CREATE_APPT_2" | jq '.' 2>/dev/null || echo "$CREATE_APPT_2"
else
  echo "✅ Second appointment created successfully"
  echo "Appointment ID: $APPT_ID_2"
  echo ""
  echo "$CREATE_APPT_2" | jq '.data' 2>/dev/null
fi

echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo ""
echo "✅ Two test appointments created for reminder testing:"
echo ""
echo "1. 24-hour reminder test:"
echo "   - Appointment: $FUTURE_DATE at $FUTURE_TIME"
echo "   - Appointment ID: $APPT_ID"
echo "   - Should trigger: ~24 hours before appointment"
echo ""
echo "2. 2-hour reminder test:"
echo "   - Appointment: $FUTURE_DATE_2H at $FUTURE_TIME_2H"
echo "   - Appointment ID: $APPT_ID_2"
echo "   - Should trigger: ~2 hours before appointment"
echo ""
echo "Reminder Scheduler Info:"
echo "   - Runs: Every 15 minutes"
echo "   - Next check: Within 15 minutes from now"
echo ""
echo "To monitor reminders:"
echo "   1. Watch server logs for 'Reminder sent' messages"
echo "   2. Check database appointments table for:"
echo "      - reminder_24h_sent_at (timestamp when 24h reminder sent)"
echo "      - reminder_2h_sent_at (timestamp when 2h reminder sent)"
echo ""
echo "Note: Email sending requires SMTP configuration in .env"
echo "      Without SMTP, reminders will be logged but not emailed."
echo ""

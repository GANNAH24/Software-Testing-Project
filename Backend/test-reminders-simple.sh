#!/bin/bash

BASE_URL="http://localhost:3000"

echo "================================"
echo "Reminder System Testing"
echo "================================"
echo ""

# Register a new test user
echo "Step 1: Register test user"
echo "------------------------"
EMAIL="reminder-test-$(date +%s)@example.com"
PASSWORD="Test@12345"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"fullName\": \"Reminder Test User\",
    \"role\": \"patient\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to register"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo "✅ User registered"
echo "Email: $EMAIL"
echo ""

# Create appointment 25 hours in future (should trigger 24h reminder)
echo "Step 2: Create appointment for 24h reminder test"
echo "------------------------"

# Use gdate if available (GNU date), otherwise fall back to date
if command -v gdate &> /dev/null; then
  FUTURE_DATE=$(gdate -d "+25 hours" +"%Y-%m-%d")
  FUTURE_TIME=$(gdate -d "+25 hours" +"%H:%M")
else
  FUTURE_DATE=$(date -v+25H +"%Y-%m-%d" 2>/dev/null || date -d "+25 hours" +"%Y-%m-%d")
  FUTURE_TIME=$(date -v+25H +"%H:%M" 2>/dev/null || date -d "+25 hours" +"%H:%M")
fi

echo "Appointment Date: $FUTURE_DATE"
echo "Appointment Time: $FUTURE_TIME"
echo ""

CREATE_APPT=$(curl -s -X POST "$BASE_URL/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"doctor_id\": \"d94b9db9-802a-45d5-9a97-ab738a19dcc1\",
    \"date\": \"$FUTURE_DATE\",
    \"time_slot\": \"$FUTURE_TIME\",
    \"reason\": \"Test appointment for 24h reminder\"
  }")

echo "$CREATE_APPT" | grep -q "success"
if [ $? -eq 0 ]; then
  echo "✅ Appointment created successfully"
  echo "$CREATE_APPT"
else
  echo "❌ Failed to create appointment"
  echo "$CREATE_APPT"
fi

echo ""
echo "================================"
echo "Reminder Testing Setup Complete"
echo "================================"
echo ""
echo "Monitor server logs to see reminder processing."
echo "Reminders run every 15 minutes."
echo ""

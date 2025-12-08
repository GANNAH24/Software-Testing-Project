#!/bin/bash

# Test script for automated reminder functionality

BASE_URL="http://localhost:3000"

echo "================================"
echo "Reminder System Testing"
echo "================================"
echo ""

# Get token by logging in
echo "Step 1: Login to get token"
echo "------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "Test@12345"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token obtained"
echo ""

# Create an appointment 25 hours in future (should trigger 24h reminder)
echo "Step 2: Create test appointment for 24h reminder"
echo "------------------------"

# Calculate date/time 25 hours from now
FUTURE_DATE=$(date -u -v+25H +"%Y-%m-%d")
FUTURE_TIME=$(date -u -v+25H +"%H:%M")

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

APPT_ID=$(echo $CREATE_APPT | grep -o '"appointment_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$APPT_ID" ]; then
  echo "❌ Failed to create appointment"
  echo "$CREATE_APPT"
else
  echo "✅ Appointment created"
  echo "Appointment ID: $APPT_ID"
  echo ""
fi

# Create an appointment 2.5 hours in future (should trigger 2h reminder)
echo "Step 3: Create test appointment for 2h reminder"
echo "------------------------"

FUTURE_DATE_2H=$(date -u -v+3H +"%Y-%m-%d")
FUTURE_TIME_2H=$(date -u -v+3H +"%H:%M")

echo "Appointment Date: $FUTURE_DATE_2H"
echo "Appointment Time: $FUTURE_TIME_2H"
echo ""

CREATE_APPT_2=$(curl -s -X POST "$BASE_URL/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"doctor_id\": \"d94b9db9-802a-45d5-9a97-ab738a19dcc1\",
    \"date\": \"$FUTURE_DATE_2H\",
    \"time_slot\": \"$FUTURE_TIME_2H\",
    \"reason\": \"Test appointment for 2h reminder\"
  }")

APPT_ID_2=$(echo $CREATE_APPT_2 | grep -o '"appointment_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$APPT_ID_2" ]; then
  echo "❌ Failed to create second appointment"
  echo "$CREATE_APPT_2"
else
  echo "✅ Second appointment created"
  echo "Appointment ID: $APPT_ID_2"
  echo ""
fi

echo "Step 4: Verify appointments were created"
echo "------------------------"

GET_APPTS=$(curl -s "$BASE_URL/api/v1/appointments" \
  -H "Authorization: Bearer $TOKEN")

echo "$GET_APPTS" | grep -q "$APPT_ID"
if [ $? -eq 0 ]; then
  echo "✅ First appointment found in list"
else
  echo "❌ First appointment not found"
fi

echo "$GET_APPTS" | grep -q "$APPT_ID_2"
if [ $? -eq 0 ]; then
  echo "✅ Second appointment found in list"
else
  echo "❌ Second appointment not found"
fi

echo ""
echo "================================"
echo "Reminder Testing Summary"
echo "================================"
echo ""
echo "Two test appointments have been created:"
echo "1. Appointment ~25 hours in the future (should trigger 24h reminder)"
echo "2. Appointment ~3 hours in the future (should trigger 2h reminder)"
echo ""
echo "The reminder scheduler runs every 15 minutes."
echo "Check the server logs to see when reminders are sent."
echo ""
echo "To monitor reminders:"
echo "  - Watch server logs for 'Reminder sent' messages"
echo "  - Check database for updated reminder_24h_sent_at and reminder_2h_sent_at columns"
echo ""
echo "Note: Email sending requires proper SMTP configuration in .env"
echo "If email is not configured, reminders will be logged but not sent."
echo ""

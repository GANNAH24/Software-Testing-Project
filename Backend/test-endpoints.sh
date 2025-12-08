#!/bin/bash

echo "================================"
echo "Backend Endpoint Testing Script"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Health Check
echo "Test 1: Health Endpoint"
echo "------------------------"
curl -s "$BASE_URL/health" | python3 -m json.tool
echo -e "\n"

# Test 2: API Root
echo "Test 2: API Root"
echo "------------------------"
curl -s "$BASE_URL/api/v1" | python3 -m json.tool
echo -e "\n"

# Test 3: Password Requirements
echo "Test 3: Password Requirements"
echo "------------------------"
curl -s "$BASE_URL/api/v1/auth/password-requirements" | python3 -m json.tool
echo -e "\n"

# Test 4: Get All Doctors (public endpoint)
echo "Test 4: Get All Doctors"
echo "------------------------"
curl -s "$BASE_URL/api/v1/doctors" | python3 -m json.tool | head -50
echo -e "\n"

# Test 5: Register a test patient
echo "Test 5: Register Test Patient"
echo "------------------------"
PATIENT_DATA='{
  "email": "test-'$(date +%s)'@example.com",
  "password": "TestPass@123!",
  "role": "patient",
  "fullName": "Test Patient",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "phone": "+1234567890"
}'
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "$PATIENT_DATA")
echo "$REGISTER_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
echo -e "\n"

# Test 6: Login
echo "Test 6: Login with Test Patient"
echo "------------------------"
LOGIN_DATA='{
  "email": "patient@test.com",
  "password": "Patient@123!"
}'
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")
echo "$LOGIN_RESPONSE" | python3 -m json.tool
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)
echo -e "\n"

# Test 7: Get Current User (Protected)
if [ -n "$LOGIN_TOKEN" ]; then
  echo "Test 7: Get Current User (Protected)"
  echo "------------------------"
  curl -s "$BASE_URL/api/v1/auth/me" \
    -H "Authorization: Bearer $LOGIN_TOKEN" | python3 -m json.tool
  echo -e "\n"
fi

# Test 8: Get Appointments (if authenticated)
if [ -n "$LOGIN_TOKEN" ]; then
  echo "Test 8: Get User Appointments"
  echo "------------------------"
  curl -s "$BASE_URL/api/v1/appointments" \
    -H "Authorization: Bearer $LOGIN_TOKEN" | python3 -m json.tool | head -50
  echo -e "\n"
fi

echo "================================"
echo "Testing Complete!"
echo "================================"

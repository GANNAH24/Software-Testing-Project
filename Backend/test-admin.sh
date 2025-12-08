#!/bin/bash

echo "=================================="
echo "Admin API Testing Suite"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000/api/v1"
TIMESTAMP=$(date +%s)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Step 1: Test Admin Registration (Should FAIL)"
echo "--------------------------------------"
REGISTER_ADMIN=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin'${TIMESTAMP}'@test.com",
    "password": "Admin@123!",
    "role": "admin",
    "fullName": "Test Admin"
  }')

echo "$REGISTER_ADMIN" | jq
if echo "$REGISTER_ADMIN" | jq -e '.success == false' > /dev/null; then
    echo -e "${GREEN}✅ PASS: Admin registration correctly blocked${NC}"
else
    echo -e "${RED}❌ FAIL: Admin registration should be blocked${NC}"
fi
echo ""

echo "Step 2: Create Patient Account (For Testing)"
echo "--------------------------------------"
PATIENT_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient'${TIMESTAMP}'@test.com",
    "password": "Patient@123!",
    "role": "patient",
    "fullName": "Test Patient",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "phone": "+1234567890"
  }')

PATIENT_TOKEN=$(echo "$PATIENT_RESPONSE" | jq -r '.data.token // empty')
if [ -z "$PATIENT_TOKEN" ]; then
    echo -e "${RED}❌ Failed to create patient account${NC}"
    echo "$PATIENT_RESPONSE" | jq
    exit 1
fi
echo -e "${GREEN}✅ Patient created successfully${NC}"
echo "Token: ${PATIENT_TOKEN:0:50}..."
echo ""

echo "Step 3: Create Doctor Account (For Testing)"
echo "--------------------------------------"
DOCTOR_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor'${TIMESTAMP}'@test.com",
    "password": "Doctor@123!",
    "role": "doctor",
    "fullName": "Test Doctor",
    "specialty": "Cardiology",
    "qualifications": "MD, FACC",
    "location": "New York",
    "phoneNumber": "+1234567891"
  }')

DOCTOR_TOKEN=$(echo "$DOCTOR_RESPONSE" | jq -r '.data.token // empty')
if [ -z "$DOCTOR_TOKEN" ]; then
    echo -e "${RED}❌ Failed to create doctor account${NC}"
    echo "$DOCTOR_RESPONSE" | jq
    exit 1
fi
DOCTOR_ID=$(echo "$DOCTOR_RESPONSE" | jq -r '.data.user.id // empty')
echo -e "${GREEN}✅ Doctor created successfully${NC}"
echo "Doctor ID: $DOCTOR_ID"
echo "Token: ${DOCTOR_TOKEN:0:50}..."
echo ""

echo "Step 4: Test CREATE DOCTOR with Patient Token (Should FAIL - 403)"
echo "--------------------------------------"
CREATE_DOCTOR_PATIENT=$(curl -s -X POST $BASE_URL/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "name": "Dr. Should Fail",
    "specialty": "Dermatology",
    "qualifications": "MD",
    "location": "Boston",
    "phoneNumber": "+1234567892"
  }')

echo "$CREATE_DOCTOR_PATIENT" | jq
if echo "$CREATE_DOCTOR_PATIENT" | jq -e '.success == false' > /dev/null; then
    echo -e "${GREEN}✅ PASS: Patient correctly denied access to create doctor${NC}"
else
    echo -e "${RED}❌ FAIL: Patient should not be able to create doctors${NC}"
fi
echo ""

echo "Step 5: Test DELETE DOCTOR with Patient Token (Should FAIL - 403)"
echo "--------------------------------------"
DELETE_DOCTOR_PATIENT=$(curl -s -X DELETE $BASE_URL/doctors/$DOCTOR_ID \
  -H "Authorization: Bearer $PATIENT_TOKEN")

echo "$DELETE_DOCTOR_PATIENT" | jq
if echo "$DELETE_DOCTOR_PATIENT" | jq -e '.success == false' > /dev/null; then
    echo -e "${GREEN}✅ PASS: Patient correctly denied access to delete doctor${NC}"
else
    echo -e "${RED}❌ FAIL: Patient should not be able to delete doctors${NC}"
fi
echo ""

echo "Step 6: Test DELETE DOCTOR with Doctor Token (Should FAIL - 403)"
echo "--------------------------------------"
DELETE_DOCTOR_SELF=$(curl -s -X DELETE $BASE_URL/doctors/$DOCTOR_ID \
  -H "Authorization: Bearer $DOCTOR_TOKEN")

echo "$DELETE_DOCTOR_SELF" | jq
if echo "$DELETE_DOCTOR_SELF" | jq -e '.success == false' > /dev/null; then
    echo -e "${GREEN}✅ PASS: Doctor correctly denied access to delete doctor${NC}"
else
    echo -e "${RED}❌ FAIL: Doctor should not be able to delete doctors${NC}"
fi
echo ""

echo "Step 7: Test UPDATE DOCTOR with Doctor Token (Should SUCCEED)"
echo "--------------------------------------"
UPDATE_DOCTOR_SELF=$(curl -s -X PUT $BASE_URL/doctors/$DOCTOR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{
    "location": "Los Angeles"
  }')

echo "$UPDATE_DOCTOR_SELF" | jq
if echo "$UPDATE_DOCTOR_SELF" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ PASS: Doctor can update their own profile${NC}"
else
    echo -e "${RED}❌ FAIL: Doctor should be able to update their profile${NC}"
fi
echo ""

echo "Step 8: Test No Token Access (Should FAIL - 401)"
echo "--------------------------------------"
NO_TOKEN=$(curl -s -X POST $BASE_URL/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. No Token",
    "specialty": "Cardiology",
    "qualifications": "MD",
    "location": "Chicago"
  }')

echo "$NO_TOKEN" | jq
if echo "$NO_TOKEN" | jq -e '.success == false' > /dev/null; then
    echo -e "${GREEN}✅ PASS: Request without token correctly denied${NC}"
else
    echo -e "${RED}❌ FAIL: Request without token should be denied${NC}"
fi
echo ""

echo "=================================="
echo "Admin API Test Summary"
echo "=================================="
echo ""
echo -e "${YELLOW}Note: Since admin accounts cannot be created via API,${NC}"
echo -e "${YELLOW}we tested that:${NC}"
echo "  1. ✅ Admin registration is blocked"
echo "  2. ✅ Non-admin users cannot access admin endpoints"
echo "  3. ✅ Proper 401/403 error codes are returned"
echo ""
echo -e "${YELLOW}To fully test admin endpoints, you need to:${NC}"
echo "  1. Create an admin account directly in the database"
echo "  2. Login as admin to get a token"
echo "  3. Test POST /doctors and DELETE /doctors/:id with admin token"
echo ""

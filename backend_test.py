#!/usr/bin/env python3
"""
Backend API Test Suite for Contact Form
Tests the /api/contact endpoints (POST and GET) and /api/root sanity check
"""

import requests
import json
import os
from datetime import datetime

# Read base URL from environment
BASE_URL = "https://ai-engineer-3d-5.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def print_test_header(test_name):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(passed, message):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")

def test_root_endpoint():
    """Sanity check: GET /api/root should return {message: 'Hello World'}"""
    print_test_header("GET /api/root - Sanity Check")
    
    try:
        response = requests.get(f"{API_BASE}/root", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print_result(True, "Root endpoint returns correct message")
                return True
            else:
                print_result(False, f"Expected message 'Hello World', got: {data}")
                return False
        else:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False

def test_post_contact_valid():
    """Test POST /api/contact with valid data"""
    print_test_header("POST /api/contact - Valid Data")
    
    # Use realistic data
    payload = {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@techcorp.com",
        "message": "Hi Lokesh, I'm impressed by your portfolio! I'd love to discuss a potential collaboration on a WebGL project for our company."
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/contact",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return False, None
        
        data = response.json()
        
        # Check for success field
        if not data.get("success"):
            print_result(False, "Response missing 'success: true'")
            return False, None
        
        # Check for contact object
        contact = data.get("contact")
        if not contact:
            print_result(False, "Response missing 'contact' object")
            return False, None
        
        # Verify contact has required fields
        required_fields = ["id", "name", "email", "message", "created_at"]
        missing_fields = [f for f in required_fields if f not in contact]
        if missing_fields:
            print_result(False, f"Contact missing fields: {missing_fields}")
            return False, None
        
        # Verify no _id field (MongoDB ObjectID should be stripped)
        if "_id" in contact:
            print_result(False, "Contact contains MongoDB _id field (should be stripped)")
            return False, None
        
        # Verify id is a UUID format (basic check)
        contact_id = contact.get("id")
        if not contact_id or len(contact_id) < 32:
            print_result(False, f"Contact id doesn't look like a UUID: {contact_id}")
            return False, None
        
        # Verify data matches
        if contact["name"] != payload["name"]:
            print_result(False, f"Name mismatch: expected {payload['name']}, got {contact['name']}")
            return False, None
        
        if contact["email"] != payload["email"]:
            print_result(False, f"Email mismatch: expected {payload['email']}, got {contact['email']}")
            return False, None
        
        if contact["message"] != payload["message"]:
            print_result(False, f"Message mismatch: expected {payload['message']}, got {contact['message']}")
            return False, None
        
        print_result(True, f"Contact created successfully with UUID: {contact_id}")
        return True, contact
        
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False, None

def test_post_contact_missing_fields():
    """Test POST /api/contact with missing fields (should return 400)"""
    print_test_header("POST /api/contact - Missing Fields")
    
    # Test with missing 'message' field
    payload = {
        "name": "John Doe",
        "email": "john@example.com"
        # message is missing
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/contact",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 400:
            print_result(False, f"Expected status 400, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check for error field
        if "error" not in data:
            print_result(False, "Response missing 'error' field")
            return False
        
        print_result(True, f"Correctly returned 400 with error: {data['error']}")
        return True
        
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False

def test_get_contacts(expected_contact):
    """Test GET /api/contact - should return array with created contact"""
    print_test_header("GET /api/contact - Retrieve Contacts")
    
    try:
        response = requests.get(f"{API_BASE}/contact", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check it's an array
        if not isinstance(data, list):
            print_result(False, f"Expected array, got {type(data)}")
            return False
        
        if len(data) == 0:
            print_result(False, "No contacts returned (expected at least one)")
            return False
        
        # Check that no contact has _id field
        contacts_with_id = [c for c in data if "_id" in c]
        if contacts_with_id:
            print_result(False, f"Found {len(contacts_with_id)} contacts with _id field (should be stripped)")
            return False
        
        # If we have an expected contact, verify it's in the list
        if expected_contact:
            found = False
            for contact in data:
                if contact.get("id") == expected_contact.get("id"):
                    found = True
                    print(f"Found expected contact: {contact['name']} ({contact['email']})")
                    break
            
            if not found:
                print_result(False, f"Expected contact with id {expected_contact.get('id')} not found in list")
                return False
            
            # Verify sorting (newest first) - first item should be our contact or newer
            first_contact = data[0]
            if first_contact.get("id") == expected_contact.get("id"):
                print_result(True, "Contact is first in list (newest)")
            else:
                # Check if first contact is actually newer
                first_time = first_contact.get("created_at", "")
                expected_time = expected_contact.get("created_at", "")
                if first_time >= expected_time:
                    print_result(True, f"Contacts sorted correctly (newest first)")
                else:
                    print_result(False, "Contacts not sorted by created_at desc")
                    return False
        
        print_result(True, f"Retrieved {len(data)} contacts, no _id fields present")
        return True
        
    except Exception as e:
        print_result(False, f"Exception occurred: {str(e)}")
        return False

def main():
    print(f"\n{'#'*80}")
    print(f"# Backend API Test Suite - Contact Form")
    print(f"# Base URL: {BASE_URL}")
    print(f"# API Base: {API_BASE}")
    print(f"# Timestamp: {datetime.now().isoformat()}")
    print(f"{'#'*80}")
    
    results = {}
    
    # Test 1: Sanity check
    results["root_endpoint"] = test_root_endpoint()
    
    # Test 2: POST with valid data
    post_valid_result, created_contact = test_post_contact_valid()
    results["post_valid"] = post_valid_result
    
    # Test 3: POST with missing fields
    results["post_missing_fields"] = test_post_contact_missing_fields()
    
    # Test 4: GET contacts
    results["get_contacts"] = test_get_contacts(created_contact)
    
    # Summary
    print(f"\n{'='*80}")
    print("TEST SUMMARY")
    print(f"{'='*80}")
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())

# Banco GYT Tests Documentation

## Overview

This document describes the test cases defined in `banco_gyt_tests.xml` for the Banco GYT Continental integration with the Colecturía Regional Web Service.

## File Structure

The test file contains a collection of XML test cases that simulate various scenarios for payment processing integration between Banco GYT Continental and the Regional Collector API.

## Test Cases

### TC001: Successful Payment Query
**Purpose:** Validates a successful payment information retrieval.

**Scenario:** Banco GYT sends a valid payment query request with proper customer identification.

**Expected Result:** System returns payment details including amount, currency, due date, and description.

**Response Code:** 200 SUCCESS

---

### TC002: Payment Confirmation
**Purpose:** Validates successful payment confirmation processing.

**Scenario:** Banco GYT confirms a payment has been received from a customer.

**Expected Result:** System confirms the payment and returns a confirmation number.

**Response Code:** 201 SUCCESS

---

### TC003: Invalid Customer Identification
**Purpose:** Tests error handling for invalid customer ID format.

**Scenario:** Payment query is submitted with an improperly formatted customer identification number.

**Expected Result:** System returns an error indicating invalid customer identification.

**Response Code:** 400 ERROR

**Error Code:** ERR_INVALID_CUSTOMER

---

### TC004: Payment Not Found
**Purpose:** Tests behavior when querying for a non-existent payment reference.

**Scenario:** Query submitted for a payment reference that doesn't exist in the system.

**Expected Result:** System returns a not found error.

**Response Code:** 404 ERROR

**Error Code:** ERR_PAYMENT_NOT_FOUND

---

### TC005: Duplicate Payment Attempt
**Purpose:** Validates detection and prevention of duplicate payment confirmations.

**Scenario:** Attempt to confirm a payment that has already been confirmed.

**Expected Result:** System rejects the duplicate and returns the existing confirmation number.

**Response Code:** 409 ERROR

**Error Code:** ERR_DUPLICATE_PAYMENT

---

### TC006: Insufficient Payment Amount
**Purpose:** Tests validation of payment amounts.

**Scenario:** Payment confirmation with an amount less than what is required.

**Expected Result:** System rejects the payment and indicates the shortfall.

**Response Code:** 400 ERROR

**Error Code:** ERR_INSUFFICIENT_AMOUNT

---

### TC007: Multiple Services Payment Query
**Purpose:** Tests retrieval of multiple pending payments for a single customer.

**Scenario:** Customer has multiple pending payments (current and overdue).

**Expected Result:** System returns all pending payments with appropriate details including penalties for overdue payments.

**Response Code:** 200 SUCCESS

---

### TC008: System Error Handling
**Purpose:** Tests system error response handling.

**Scenario:** Simulates an internal system error scenario.

**Expected Result:** System returns appropriate error response with support reference.

**Response Code:** 500 ERROR

**Error Code:** ERR_SYSTEM_ERROR

---

### TC009: Missing Required Fields
**Purpose:** Tests validation of required fields.

**Scenario:** Request submitted with missing required fields.

**Expected Result:** System returns error listing all missing required fields.

**Response Code:** 400 ERROR

**Error Code:** ERR_MISSING_REQUIRED_FIELDS

---

### TC010: Authentication Failure
**Purpose:** Tests authentication and authorization.

**Scenario:** Request submitted with invalid bank credentials.

**Expected Result:** System rejects the request due to authentication failure.

**Response Code:** 401 ERROR

**Error Code:** ERR_AUTHENTICATION_FAILED

---

## XML Schema Structure

### Request Types

1. **PaymentQuery**: Used to query payment information
   - Header: Transaction metadata (ID, timestamp, bank code, branch)
   - QueryData: Customer identification and service type

2. **PaymentConfirmation**: Used to confirm payment receipt
   - Header: Transaction metadata
   - PaymentData: Payment details including amount, date, and receipt number

### Response Types

1. **PaymentResponse**: Successful payment query response
   - Status, ResponseCode, Message
   - PaymentDetails or PaymentList

2. **ConfirmationResponse**: Successful payment confirmation
   - Status, ResponseCode, Message
   - ConfirmationNumber

3. **ErrorResponse**: Error responses
   - Status, ResponseCode, ErrorCode, Message
   - Additional error details as needed

## Customer Identification Types

- **NIT**: Tax Identification Number (Número de Identificación Tributaria)
- Format: XXXXXXXX-X (8 digits, hyphen, 1 check digit)

## Currency

- **GTQ**: Guatemalan Quetzal

## Usage

These test cases should be used to:

1. Validate the web service implementation
2. Test XML parsing and conversion to JSON
3. Test JSON response conversion back to XML
4. Verify error handling and validation
5. Ensure proper integration with Akros API
6. Validate OAuth 2.0 authentication flow

## Integration Flow

```
Banco GYT (XML) → Web Service (Port 443/HTTPS)
                ↓
         Parse XML → Convert to JSON
                ↓
         Call Akros API (OAuth 2.0)
                ↓
         Receive JSON Response
                ↓
         Convert to XML → Return to Banco GYT
```

## Testing Recommendations

1. **Unit Testing**: Test each test case individually
2. **Integration Testing**: Test the complete flow including Akros API integration
3. **Error Scenarios**: Ensure all error codes are properly handled
4. **Performance Testing**: Test with multiple concurrent requests
5. **Security Testing**: Validate HTTPS and OAuth 2.0 implementation

## Maintenance

When updating test cases:

1. Maintain XML schema consistency
2. Document any new test cases
3. Update version number in metadata
4. Validate XML well-formedness
5. Ensure backward compatibility

## Support

For questions or issues related to these test cases, please contact the development team or refer to the main project documentation.

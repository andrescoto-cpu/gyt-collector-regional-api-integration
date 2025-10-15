# Usage Examples for Banco GYT Test Cases

This document provides practical examples of how to use the test cases defined in `banco_gyt_tests.xml`.

## Quick Start

### 1. Validate the Test File

```bash
python3 validate_tests.py
```

This will:
- Parse the XML file
- Validate the structure
- Display a summary of all test cases
- Export the first test case to JSON

### 2. Extract Individual Test Cases

You can extract specific test cases using Python:

```python
from validate_tests import parse_test_file, extract_test_cases

# Parse the test file
tree = parse_test_file('banco_gyt_tests.xml')

# Extract all test cases
test_cases = extract_test_cases(tree)

# Get a specific test case by ID
tc001 = next(tc for tc in test_cases if tc['id'] == 'TC001')
print(tc001['name'])  # Output: Successful Payment Query
```

### 3. Use Test Cases for API Testing

Example using the requests library:

```python
import requests
import xml.etree.ElementTree as ET
from validate_tests import parse_test_file

# Parse test cases
tree = parse_test_file('banco_gyt_tests.xml')
root = tree.getroot()

# Get first test case
test_case = root.find('.//TestCase[@id="TC001"]')
request_elem = test_case.find('Request/PaymentQuery')

# Convert to XML string
request_xml = ET.tostring(request_elem, encoding='unicode')

# Send to web service
response = requests.post(
    'https://localhost:443/api/banco-gyt',
    data=request_xml,
    headers={'Content-Type': 'application/xml'}
)

print(f"Response Status: {response.status_code}")
print(f"Response Body: {response.text}")
```

## Integration Testing Example

### Testing with pytest

Create a test file `test_banco_gyt_integration.py`:

```python
import pytest
import xml.etree.ElementTree as ET
from validate_tests import parse_test_file, extract_test_cases


@pytest.fixture
def test_cases():
    """Load all test cases from XML file."""
    tree = parse_test_file('banco_gyt_tests.xml')
    return extract_test_cases(tree)


def test_successful_payment_query(test_cases):
    """Test TC001: Successful Payment Query."""
    tc = next(tc for tc in test_cases if tc['id'] == 'TC001')
    
    # Your test implementation here
    # Example: Send request to your API and validate response
    request = tc['request']
    expected = tc['expected_response']
    
    # Assert expected response code
    assert expected['PaymentResponse']['ResponseCode'] == '200'
    assert expected['PaymentResponse']['Status'] == 'SUCCESS'


def test_invalid_customer_id(test_cases):
    """Test TC003: Invalid Customer Identification."""
    tc = next(tc for tc in test_cases if tc['id'] == 'TC003')
    
    expected = tc['expected_response']
    
    # Assert error response
    assert expected['ErrorResponse']['ResponseCode'] == '400'
    assert expected['ErrorResponse']['ErrorCode'] == 'ERR_INVALID_CUSTOMER'


@pytest.mark.parametrize("test_id,expected_code", [
    ('TC001', '200'),
    ('TC002', '201'),
    ('TC003', '400'),
    ('TC004', '404'),
    ('TC005', '409'),
])
def test_response_codes(test_cases, test_id, expected_code):
    """Parametrized test for response codes."""
    tc = next(tc for tc in test_cases if tc['id'] == test_id)
    
    # Extract response code from expected response
    expected = tc['expected_response']
    
    # Navigate to ResponseCode in either PaymentResponse or ErrorResponse
    for key in expected:
        if 'Response' in key:
            actual_code = expected[key].get('ResponseCode')
            assert actual_code == expected_code
            break
```

Run tests:
```bash
pytest test_banco_gyt_integration.py -v
```

## Manual Testing Workflow

### Step 1: Select Test Case

```bash
# View all test cases
python3 validate_tests.py

# Or use grep to find specific tests
grep -A2 'TestCase id=' banco_gyt_tests.xml
```

### Step 2: Extract Request XML

```python
import xml.etree.ElementTree as ET

tree = ET.parse('banco_gyt_tests.xml')
root = tree.getroot()

# Get TC001 request
tc001 = root.find('.//TestCase[@id="TC001"]')
request = tc001.find('Request/PaymentQuery')

# Convert to string
request_xml = ET.tostring(request, encoding='unicode')
print(request_xml)
```

### Step 3: Send to API

Using curl:
```bash
curl -X POST https://localhost:443/api/banco-gyt \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><PaymentQuery>...</PaymentQuery>'
```

Or using Postman:
1. Set method to POST
2. URL: `https://localhost:443/api/banco-gyt`
3. Headers: `Content-Type: application/xml`
4. Body: Raw XML from test case

### Step 4: Validate Response

Compare the actual response with the `ExpectedResponse` in the test case.

## Test Case Categories

### Success Cases (2xx)
- TC001: Successful Payment Query (200)
- TC002: Payment Confirmation (201)
- TC007: Multiple Services Payment Query (200)

### Client Errors (4xx)
- TC003: Invalid Customer Identification (400)
- TC004: Payment Not Found (404)
- TC005: Duplicate Payment Attempt (409)
- TC006: Insufficient Payment Amount (400)
- TC009: Missing Required Fields (400)
- TC010: Authentication Failure (401)

### Server Errors (5xx)
- TC008: System Error Handling (500)

## Converting XML to JSON

For JSON-based testing:

```python
from validate_tests import extract_test_cases, export_test_case_to_json

# Extract all test cases
tree = parse_test_file('banco_gyt_tests.xml')
test_cases = extract_test_cases(tree)

# Export each test case to JSON
for tc in test_cases:
    filename = f"test_case_{tc['id']}.json"
    export_test_case_to_json(tc, filename)
    print(f"Exported {filename}")
```

## Load Testing

Example using locust for load testing:

```python
from locust import HttpUser, task, between
import xml.etree.ElementTree as ET
from validate_tests import parse_test_file

class BancoGYTUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Load test cases on start."""
        tree = parse_test_file('banco_gyt_tests.xml')
        self.root = tree.getroot()
    
    @task(10)
    def payment_query(self):
        """Simulate payment query (TC001)."""
        tc = self.root.find('.//TestCase[@id="TC001"]')
        request = tc.find('Request/PaymentQuery')
        xml_data = ET.tostring(request, encoding='unicode')
        
        self.client.post(
            "/api/banco-gyt/query",
            data=xml_data,
            headers={'Content-Type': 'application/xml'}
        )
    
    @task(5)
    def payment_confirmation(self):
        """Simulate payment confirmation (TC002)."""
        tc = self.root.find('.//TestCase[@id="TC002"]')
        request = tc.find('Request/PaymentConfirmation')
        xml_data = ET.tostring(request, encoding='unicode')
        
        self.client.post(
            "/api/banco-gyt/confirm",
            data=xml_data,
            headers={'Content-Type': 'application/xml'}
        )
```

Run load test:
```bash
locust -f locustfile.py --host=https://localhost:443
```

## Best Practices

1. **Start with Success Cases**: Test TC001 and TC002 first to ensure basic functionality works.

2. **Test Error Handling**: Verify that each error test case returns the expected error code and message.

3. **Validate XML Schema**: Ensure your API accepts the XML format defined in the test cases.

4. **Test Authentication**: TC010 validates authentication - implement proper OAuth 2.0 flow.

5. **Monitor Performance**: Use TC001-TC002 for performance benchmarks.

6. **Test Edge Cases**: TC005-TC009 cover important edge cases - don't skip them.

## Troubleshooting

### Issue: XML Parsing Errors

```python
# Validate XML before sending
import xml.etree.ElementTree as ET

try:
    ET.fromstring(xml_string)
    print("Valid XML")
except ET.ParseError as e:
    print(f"Invalid XML: {e}")
```

### Issue: Unexpected Response

```python
# Compare expected vs actual
expected = test_case['expected_response']
actual = parse_response(api_response)

# Use deep comparison
import json
print("Expected:", json.dumps(expected, indent=2))
print("Actual:", json.dumps(actual, indent=2))
```

## Additional Resources

- See `BANCO_GYT_TESTS_README.md` for detailed test case descriptions
- Run `python3 validate_tests.py` for XML validation
- Check the main `README.md` for project overview

## Support

For issues or questions about using these test cases, please refer to the project documentation or contact the development team.

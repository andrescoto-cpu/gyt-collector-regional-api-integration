#!/usr/bin/env python3
"""
Banco GYT Test Parser and Validator

This script parses the banco_gyt_tests.xml file and provides utilities
to extract and validate test cases.
"""

import xml.etree.ElementTree as ET
import json
from typing import Dict, List, Any
import sys


def parse_test_file(xml_file: str) -> ET.ElementTree:
    """Parse the XML test file and return the tree."""
    try:
        tree = ET.parse(xml_file)
        return tree
    except ET.ParseError as e:
        print(f"Error parsing XML: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print(f"File not found: {xml_file}")
        sys.exit(1)


def extract_test_cases(tree: ET.ElementTree) -> List[Dict[str, Any]]:
    """Extract all test cases from the XML tree."""
    root = tree.getroot()
    test_cases = []
    
    for test_case in root.findall('.//TestCase'):
        tc_id = test_case.get('id')
        tc_name = test_case.get('name')
        description = test_case.find('Description')
        
        test_data = {
            'id': tc_id,
            'name': tc_name,
            'description': description.text if description is not None else '',
            'request': element_to_dict(test_case.find('Request')),
            'expected_response': element_to_dict(test_case.find('ExpectedResponse'))
        }
        
        test_cases.append(test_data)
    
    return test_cases


def element_to_dict(element: ET.Element) -> Dict[str, Any]:
    """Convert an XML element to a dictionary."""
    if element is None:
        return {}
    
    result = {}
    
    # Add element attributes
    if element.attrib:
        result['@attributes'] = element.attrib
    
    # Add element text if present
    if element.text and element.text.strip():
        if len(element) == 0:  # Leaf node
            return element.text.strip()
        result['#text'] = element.text.strip()
    
    # Process child elements
    for child in element:
        child_data = element_to_dict(child)
        
        if child.tag in result:
            # Handle multiple elements with same tag
            if not isinstance(result[child.tag], list):
                result[child.tag] = [result[child.tag]]
            result[child.tag].append(child_data)
        else:
            result[child.tag] = child_data
    
    return result


def print_test_summary(test_cases: List[Dict[str, Any]]) -> None:
    """Print a summary of all test cases."""
    print("=" * 80)
    print("BANCO GYT TEST CASES SUMMARY")
    print("=" * 80)
    print(f"\nTotal Test Cases: {len(test_cases)}\n")
    
    for tc in test_cases:
        print(f"[{tc['id']}] {tc['name']}")
        print(f"    Description: {tc['description']}")
        
        # Extract response code if available
        expected = tc.get('expected_response', {})
        for key in expected:
            if 'Response' in key:
                response = expected[key]
                if isinstance(response, dict):
                    code = response.get('ResponseCode', 'N/A')
                    status = response.get('Status', 'N/A')
                    print(f"    Expected: {status} ({code})")
                    break
        print()


def export_test_case_to_json(test_case: Dict[str, Any], output_file: str) -> None:
    """Export a single test case to JSON format."""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(test_case, f, indent=2, ensure_ascii=False)
    print(f"Test case exported to: {output_file}")


def validate_xml_structure(tree: ET.ElementTree) -> bool:
    """Validate the XML structure contains required elements."""
    root = tree.getroot()
    
    print("Validating XML structure...")
    
    # Check root element
    if root.tag != 'TestSuite':
        print("✗ Root element should be 'TestSuite'")
        return False
    print("✓ Root element is 'TestSuite'")
    
    # Check metadata
    metadata = root.find('Metadata')
    if metadata is None:
        print("✗ Missing 'Metadata' element")
        return False
    print("✓ Metadata element found")
    
    # Check test cases
    test_cases = root.findall('.//TestCase')
    if not test_cases:
        print("✗ No test cases found")
        return False
    print(f"✓ Found {len(test_cases)} test cases")
    
    # Validate each test case structure
    for tc in test_cases:
        tc_id = tc.get('id')
        if not tc_id:
            print(f"✗ Test case missing 'id' attribute")
            return False
        
        if tc.find('Request') is None:
            print(f"✗ Test case {tc_id} missing 'Request' element")
            return False
        
        if tc.find('ExpectedResponse') is None:
            print(f"✗ Test case {tc_id} missing 'ExpectedResponse' element")
            return False
    
    print(f"✓ All {len(test_cases)} test cases have required structure")
    
    return True


def main():
    """Main function to demonstrate usage."""
    xml_file = 'banco_gyt_tests.xml'
    
    print("Banco GYT Test Parser")
    print("=" * 80)
    print()
    
    # Parse the XML file
    tree = parse_test_file(xml_file)
    print(f"✓ Successfully parsed {xml_file}\n")
    
    # Validate structure
    if not validate_xml_structure(tree):
        print("\n✗ XML validation failed!")
        sys.exit(1)
    
    print("\n✓ XML validation passed!\n")
    
    # Extract and display test cases
    test_cases = extract_test_cases(tree)
    print_test_summary(test_cases)
    
    # Example: Export first test case to JSON
    if test_cases:
        print("\nExporting first test case to JSON...")
        export_test_case_to_json(test_cases[0], 'test_case_TC001.json')
    
    print("\n" + "=" * 80)
    print("All operations completed successfully!")
    print("=" * 80)


if __name__ == '__main__':
    main()

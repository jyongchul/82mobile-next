#!/usr/bin/env python3
"""Test Redis availability on Gabia hosting."""

import ftplib
import requests
import json
import sys

# FTP credentials
FTP_HOST = "82mobile.com"
FTP_USER = "adam82mob0105"
FTP_PASS = "ssh82mobile2026!"

def upload_test_script():
    """Upload test script to WordPress root."""
    print("Uploading Redis test script via FTP...")

    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)

        # Upload to WordPress root (/)
        with open('/mnt/c/82Mobile/82mobile-next/scripts/test_redis_connection.php', 'rb') as f:
            ftp.storbinary('STOR test_redis_connection.php', f)

        print("✓ Test script uploaded successfully")
        ftp.quit()
        return True
    except Exception as e:
        print(f"✗ FTP upload failed: {e}")
        return False

def execute_test():
    """Execute test script via HTTP."""
    print("\nExecuting Redis test via HTTP...")

    try:
        response = requests.get('http://82mobile.com/test_redis_connection.php', timeout=10)

        print(f"HTTP Status: {response.status_code}")
        print(f"Response:\n{response.text}\n")

        # Try to parse JSON from end of response
        try:
            # Find JSON in response (might have echo output before it)
            json_start = response.text.rfind('{')
            if json_start >= 0:
                json_text = response.text[json_start:]
                result = json.loads(json_text)
                return result
        except json.JSONDecodeError:
            print("Could not parse JSON from response")

        return None
    except Exception as e:
        print(f"✗ HTTP request failed: {e}")
        return None

def cleanup_test_script():
    """Delete test script from server."""
    print("\nCleaning up test script...")

    try:
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)

        # Delete test file
        ftp.delete('test_redis_connection.php')

        print("✓ Test script removed")
        ftp.quit()
    except Exception as e:
        print(f"✗ Cleanup failed: {e}")

def main():
    """Run Redis availability test."""
    print("="*60)
    print("Gabia Redis Availability Test")
    print("="*60)

    # Step 1: Upload test script
    if not upload_test_script():
        sys.exit(1)

    # Step 2: Execute test
    result = execute_test()

    # Step 3: Cleanup
    cleanup_test_script()

    # Step 4: Report results
    print("\n" + "="*60)
    print("TEST RESULTS")
    print("="*60)

    if result:
        if result.get('available'):
            print("✅ Redis IS AVAILABLE on Gabia hosting")
            print(f"   Tested: {result.get('timestamp')}")
            return 0
        else:
            print("❌ Redis NOT AVAILABLE on Gabia hosting")
            print(f"   Error: {result.get('error', 'Unknown error')}")
            print(f"   Tested: {result.get('timestamp')}")
            return 2
    else:
        print("⚠️  Test execution failed - results inconclusive")
        return 1

if __name__ == '__main__':
    sys.exit(main())

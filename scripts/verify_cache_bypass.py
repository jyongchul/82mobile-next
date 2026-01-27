#!/usr/bin/env python3
"""
Cache Bypass Verification Script

Tests Gabia cache bypass for /wp-json/* API endpoints using:
1. HTTP header verification (Cache-Control, Pragma headers)
2. Timestamp freshness test (update detection)

Usage:
    python3 verify_cache_bypass.py --interval 0h
    python3 verify_cache_bypass.py --interval 24h --report report.md --silent
"""

import requests
import time
import json
import argparse
import sys
from datetime import datetime
from typing import Dict, Tuple

# WooCommerce API credentials
WC_BASE_URL = "http://82mobile.com/wp-json/wc/v3"
WC_CONSUMER_KEY = "ck_f5aa0c24e5ea775ac6d8a0e5bef1ee77e79e0f7e"
WC_CONSUMER_SECRET = "cs_54dfefd4b5e2816e59db00d5a5f3d2dacc58b86c"


def verify_cache_headers() -> Dict[str, any]:
    """
    Method 1: HTTP Header Verification

    Check if API responses contain cache bypass headers.

    Returns:
        dict: Test results with header checks and pass/fail status
    """
    try:
        url = f"{WC_BASE_URL}/products"
        response = requests.get(
            url,
            auth=(WC_CONSUMER_KEY, WC_CONSUMER_SECRET),
            timeout=10
        )

        # Get cache-related headers
        cache_control = response.headers.get('Cache-Control', '').lower()
        pragma = response.headers.get('Pragma', '').lower()
        expires = response.headers.get('Expires', '')

        # Check for cache bypass indicators
        checks = {
            'no-cache in Cache-Control': 'no-cache' in cache_control,
            'no-store in Cache-Control': 'no-store' in cache_control,
            'must-revalidate in Cache-Control': 'must-revalidate' in cache_control,
            'max-age=0 in Cache-Control': 'max-age=0' in cache_control,
            'Pragma: no-cache': pragma == 'no-cache',
            'Expires: 0 or past': expires == '0' or expires == '-1'
        }

        # All checks should pass for proper cache bypass
        all_passed = all(checks.values())

        return {
            'method': 'HTTP Headers',
            'status': 'PASS' if all_passed else 'FAIL',
            'checks': checks,
            'headers': {
                'Cache-Control': response.headers.get('Cache-Control', 'MISSING'),
                'Pragma': response.headers.get('Pragma', 'MISSING'),
                'Expires': response.headers.get('Expires', 'MISSING')
            },
            'http_status': response.status_code
        }

    except Exception as e:
        return {
            'method': 'HTTP Headers',
            'status': 'ERROR',
            'error': str(e)
        }


def verify_timestamp_freshness() -> Dict[str, any]:
    """
    Method 2: Timestamp Freshness Test

    Update a product and immediately query to see if changes reflect.
    If cached, the timestamp won't update.

    Returns:
        dict: Test results with timestamp comparison and pass/fail status
    """
    try:
        url = f"{WC_BASE_URL}/products"
        auth = (WC_CONSUMER_KEY, WC_CONSUMER_SECRET)

        # Step 1: Get first product
        response1 = requests.get(url, auth=auth, timeout=10)
        if response1.status_code != 200:
            return {
                'method': 'Timestamp Freshness',
                'status': 'ERROR',
                'error': f'Failed to fetch products: HTTP {response1.status_code}'
            }

        products = response1.json()
        if not products:
            return {
                'method': 'Timestamp Freshness',
                'status': 'ERROR',
                'error': 'No products found for testing'
            }

        product = products[0]
        product_id = product['id']
        original_modified = product['date_modified']

        # Step 2: Update product description with timestamp
        time.sleep(1)  # Ensure timestamp difference
        update_timestamp = datetime.utcnow().isoformat()
        update_response = requests.put(
            f"{url}/{product_id}",
            auth=auth,
            json={
                'description': f'Cache test update at {update_timestamp}'
            },
            timeout=10
        )

        if update_response.status_code not in [200, 201]:
            return {
                'method': 'Timestamp Freshness',
                'status': 'ERROR',
                'error': f'Failed to update product: HTTP {update_response.status_code}'
            }

        # Step 3: Query again immediately
        time.sleep(0.5)
        response2 = requests.get(url, auth=auth, timeout=10)
        products_updated = response2.json()
        product_updated = next((p for p in products_updated if p['id'] == product_id), None)

        if not product_updated:
            return {
                'method': 'Timestamp Freshness',
                'status': 'ERROR',
                'error': 'Product not found after update'
            }

        new_modified = product_updated['date_modified']

        # Step 4: Compare timestamps
        # If cache is active, timestamps will be identical
        # If cache bypass works, new_modified > original_modified
        timestamp_changed = new_modified != original_modified

        return {
            'method': 'Timestamp Freshness',
            'status': 'PASS' if timestamp_changed else 'FAIL',
            'product_id': product_id,
            'original_modified': original_modified,
            'new_modified': new_modified,
            'timestamp_changed': timestamp_changed,
            'update_timestamp': update_timestamp
        }

    except Exception as e:
        return {
            'method': 'Timestamp Freshness',
            'status': 'ERROR',
            'error': str(e)
        }


def run_verification(interval: str, silent: bool = False) -> Dict[str, any]:
    """
    Run both verification methods and aggregate results.

    Args:
        interval: Test interval (0h, 1h, 6h, 24h, 48h)
        silent: Suppress console output

    Returns:
        dict: Complete verification results
    """
    timestamp = datetime.utcnow().isoformat() + 'Z'

    if not silent:
        print(f"\n{'='*60}")
        print(f"Cache Bypass Verification - Interval: {interval}")
        print(f"Timestamp: {timestamp}")
        print(f"{'='*60}\n")

    # Run both verification methods
    header_result = verify_cache_headers()
    freshness_result = verify_timestamp_freshness()

    # Overall status: PASS if both methods pass
    overall_status = 'PASS' if (
        header_result.get('status') == 'PASS' and
        freshness_result.get('status') == 'PASS'
    ) else 'FAIL'

    results = {
        'timestamp': timestamp,
        'interval': interval,
        'overall_status': overall_status,
        'header_verification': header_result,
        'freshness_verification': freshness_result
    }

    if not silent:
        print(f"\n{'='*60}")
        print(f"OVERALL STATUS: {overall_status}")
        print(f"{'='*60}\n")

        # Print header verification results
        print("Method 1: HTTP Header Verification")
        print(f"  Status: {header_result.get('status')}")
        if 'headers' in header_result:
            print("  Headers received:")
            for key, val in header_result['headers'].items():
                print(f"    {key}: {val}")

        # Print freshness verification results
        print("\nMethod 2: Timestamp Freshness Test")
        print(f"  Status: {freshness_result.get('status')}")
        if 'timestamp_changed' in freshness_result:
            print(f"  Timestamp changed: {freshness_result['timestamp_changed']}")
            print(f"  Original: {freshness_result['original_modified']}")
            print(f"  New: {freshness_result['new_modified']}")

        if 'error' in header_result:
            print(f"\n  Header test error: {header_result['error']}")
        if 'error' in freshness_result:
            print(f"  Freshness test error: {freshness_result['error']}")

    return results


def append_to_report(results: Dict[str, any], report_path: str):
    """
    Append verification results to cumulative report file.

    Args:
        results: Verification results dictionary
        report_path: Path to report markdown file
    """
    import os

    # Create report if it doesn't exist
    if not os.path.exists(report_path):
        with open(report_path, 'w') as f:
            f.write("# Cache Verification Report\n\n")
            f.write("Automated monitoring of Gabia cache bypass effectiveness for `/wp-json/*` API endpoints.\n\n")
            f.write("## Test Schedule\n\n")
            f.write("- **0h**: Baseline test (initial verification)\n")
            f.write("- **1h**: Early propagation check\n")
            f.write("- **6h**: Mid-propagation check\n")
            f.write("- **24h**: Late propagation check\n")
            f.write("- **48h**: Final verification (Gabia cache TTL: 24-48h)\n\n")
            f.write("## Test Results\n\n")

    # Append test results
    with open(report_path, 'a') as f:
        f.write(f"### Interval: {results['interval']}\n\n")
        f.write(f"**Timestamp**: {results['timestamp']}  \n")
        f.write(f"**Overall Status**: **{results['overall_status']}**\n\n")

        # Header verification
        header = results['header_verification']
        f.write(f"#### Method 1: HTTP Header Verification\n\n")
        f.write(f"**Status**: {header.get('status')}\n\n")

        if 'headers' in header:
            f.write("Headers received:\n```\n")
            for key, val in header['headers'].items():
                f.write(f"{key}: {val}\n")
            f.write("```\n\n")

        if 'checks' in header:
            f.write("Checks:\n")
            for check, passed in header['checks'].items():
                icon = '✓' if passed else '✗'
                f.write(f"- {icon} {check}\n")
            f.write("\n")

        if 'error' in header:
            f.write(f"**Error**: {header['error']}\n\n")

        # Freshness verification
        freshness = results['freshness_verification']
        f.write(f"#### Method 2: Timestamp Freshness Test\n\n")
        f.write(f"**Status**: {freshness.get('status')}\n\n")

        if 'timestamp_changed' in freshness:
            f.write(f"- Product ID: {freshness['product_id']}\n")
            f.write(f"- Original timestamp: `{freshness['original_modified']}`\n")
            f.write(f"- New timestamp: `{freshness['new_modified']}`\n")
            f.write(f"- Timestamp changed: **{freshness['timestamp_changed']}**\n\n")

        if 'error' in freshness:
            f.write(f"**Error**: {freshness['error']}\n\n")

        f.write("---\n\n")


def main():
    parser = argparse.ArgumentParser(
        description='Verify cache bypass for 82mobile.com /wp-json/* endpoints'
    )
    parser.add_argument(
        '--interval',
        required=True,
        choices=['0h', '1h', '6h', '24h', '48h'],
        help='Test interval (0h=baseline, 48h=final)'
    )
    parser.add_argument(
        '--report',
        type=str,
        help='Path to cumulative report file (appends results)'
    )
    parser.add_argument(
        '--silent',
        action='store_true',
        help='Suppress console output (for cron jobs)'
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results as JSON'
    )

    args = parser.parse_args()

    # Run verification
    results = run_verification(args.interval, args.silent)

    # Output JSON if requested
    if args.json:
        print(json.dumps(results, indent=2))

    # Append to report if specified
    if args.report:
        append_to_report(results, args.report)
        if not args.silent:
            print(f"\nResults appended to: {args.report}")

    # Exit with appropriate status code
    sys.exit(0 if results['overall_status'] == 'PASS' else 1)


if __name__ == '__main__':
    main()

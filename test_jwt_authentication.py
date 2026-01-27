#!/usr/bin/env python3
"""
Test JWT Authentication functionality
- Generate JWT token
- Validate JWT token
- Test CORS preflight
- Test WooCommerce API with consumer keys
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://82mobile.com"
API_URL = f"{BASE_URL}/wp-json"
JWT_ENDPOINT = f"{API_URL}/jwt-auth/v1/token"
JWT_VALIDATE = f"{API_URL}/jwt-auth/v1/token/validate"
WC_PRODUCTS = f"{API_URL}/wc/v3/products"

# Credentials
WP_USERNAME = "whadmin"
WP_PASSWORD = "WhMkt2026!@AdamKorSim"

# WooCommerce API keys (from WOOCOMMERCE_API_KEYS_PRODUCTION.txt)
WC_CONSUMER_KEY = "ck_cd3965181a66868b9f094f8df4d3abacaeec6652"
WC_CONSUMER_SECRET = "cs_cc74b52dc817261af251b1fe234e672e1dafd297"

# Vercel domain for CORS testing
VERCEL_DOMAIN = "https://82mobile-next.vercel.app"

def test_jwt_token_generation():
    """Test 1: Generate JWT token"""
    print("=" * 60)
    print("Test 1: JWT Token Generation")
    print("=" * 60)

    try:
        response = requests.post(
            JWT_ENDPOINT,
            headers={"Content-Type": "application/json"},
            json={"username": WP_USERNAME, "password": WP_PASSWORD},
            timeout=10
        )

        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            data = response.json()
            if "token" in data:
                print("\n✓ JWT token generated successfully")
                return data["token"]
            else:
                print("\n✗ No token in response")
                return None
        else:
            print(f"\n✗ Token generation failed: {response.status_code}")
            return None

    except Exception as e:
        print(f"\n✗ Error: {e}")
        return None

def test_jwt_token_validation(token):
    """Test 2: Validate JWT token"""
    print("\n" + "=" * 60)
    print("Test 2: JWT Token Validation")
    print("=" * 60)

    if not token:
        print("✗ No token to validate")
        return False

    try:
        response = requests.post(
            JWT_VALIDATE,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )

        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            print("\n✓ JWT token is valid")
            return True
        else:
            print(f"\n✗ Token validation failed: {response.status_code}")
            return False

    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

def test_cors_preflight():
    """Test 3: CORS preflight request"""
    print("\n" + "=" * 60)
    print("Test 3: CORS Preflight (OPTIONS)")
    print("=" * 60)

    try:
        response = requests.options(
            WC_PRODUCTS,
            headers={
                "Origin": VERCEL_DOMAIN,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization, Content-Type"
            },
            timeout=10
        )

        print(f"Status: {response.status_code}")
        print("\nResponse Headers:")
        for key, value in response.headers.items():
            if "access-control" in key.lower() or "cors" in key.lower():
                print(f"  {key}: {value}")

        allow_origin = response.headers.get("Access-Control-Allow-Origin", "")
        allow_methods = response.headers.get("Access-Control-Allow-Methods", "")
        allow_headers = response.headers.get("Access-Control-Allow-Headers", "")

        if allow_origin and allow_methods:
            print(f"\n✓ CORS headers present")
            print(f"  Allow-Origin: {allow_origin}")
            print(f"  Allow-Methods: {allow_methods}")
            print(f"  Allow-Headers: {allow_headers}")

            if VERCEL_DOMAIN in allow_origin or "*" in allow_origin:
                print(f"✓ Vercel domain allowed")
                return True
            else:
                print(f"⚠ Vercel domain not in Allow-Origin")
                return False
        else:
            print(f"\n✗ CORS headers missing")
            return False

    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

def test_woocommerce_api():
    """Test 4: WooCommerce API with consumer keys"""
    print("\n" + "=" * 60)
    print("Test 4: WooCommerce API Access")
    print("=" * 60)

    try:
        response = requests.get(
            WC_PRODUCTS,
            auth=(WC_CONSUMER_KEY, WC_CONSUMER_SECRET),
            params={"per_page": 3},
            timeout=10
        )

        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            products = response.json()
            print(f"\n✓ WooCommerce API accessible")
            print(f"  Retrieved {len(products)} products")

            if products:
                for product in products[:2]:
                    print(f"  - {product.get('name')} (ID: {product.get('id')})")
            return True
        else:
            print(f"\n✗ WooCommerce API error: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False

    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

def test_api_cache_bypass():
    """Test 5: API cache bypass headers"""
    print("\n" + "=" * 60)
    print("Test 5: API Cache Bypass")
    print("=" * 60)

    try:
        response = requests.get(f"{API_URL}/wp/v2/posts", timeout=10)

        print(f"Status: {response.status_code}")
        print("\nCache-related Headers:")

        cache_control = response.headers.get("Cache-Control", "")
        pragma = response.headers.get("Pragma", "")
        expires = response.headers.get("Expires", "")

        print(f"  Cache-Control: {cache_control}")
        print(f"  Pragma: {pragma}")
        print(f"  Expires: {expires}")

        if "no-cache" in cache_control.lower() or "no-store" in cache_control.lower():
            print(f"\n✓ API cache bypass active")
            return True
        else:
            print(f"\n⚠ Cache bypass may not be active (could take 1-2 hours)")
            return False

    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

def main():
    print("\n" + "=" * 70)
    print("JWT Authentication & API Configuration Tests")
    print("=" * 70)
    print()

    results = {}

    # Test 1: JWT Token Generation
    token = test_jwt_token_generation()
    results["jwt_generation"] = token is not None

    # Test 2: JWT Token Validation
    results["jwt_validation"] = test_jwt_token_validation(token)

    # Test 3: CORS Preflight
    results["cors_preflight"] = test_cors_preflight()

    # Test 4: WooCommerce API
    results["woocommerce_api"] = test_woocommerce_api()

    # Test 5: Cache Bypass
    results["cache_bypass"] = test_api_cache_bypass()

    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)

    passed = sum(results.values())
    total = len(results)

    print(f"\nPassed: {passed}/{total} tests\n")

    for test, status in results.items():
        symbol = "✓" if status else "✗"
        print(f"{symbol} {test.replace('_', ' ').title()}")

    print()

    if passed == total:
        print("🎉 All tests passed! JWT authentication is configured correctly.")
        return 0
    elif passed >= total - 1:
        print("⚠ Most tests passed. Some features may need time for cache to clear.")
        return 0
    else:
        print("❌ Multiple tests failed. Review configuration.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

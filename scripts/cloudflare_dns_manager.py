#!/usr/bin/env python3
"""
Cloudflare DNS Manager for 82mobile.com DNS Cutover

Manages DNS records for immediate cutover to Vercel and rollback to Gabia.

Usage:
    python3 cloudflare_dns_manager.py --cutover      # Execute DNS cutover to Vercel
    python3 cloudflare_dns_manager.py --rollback     # Rollback DNS to Gabia
    python3 cloudflare_dns_manager.py --lower-ttl    # Lower TTL to 300s (72 hours before cutover)
    python3 cloudflare_dns_manager.py --dry-run --cutover  # Dry-run mode (print changes without executing)

Environment variables required:
    CLOUDFLARE_API_TOKEN - Cloudflare API token with Zone:DNS:Edit permissions
"""

import os
import sys
import argparse
from typing import Optional, Dict, Any

try:
    from CloudFlare import CloudFlare
except ImportError:
    print("Error: CloudFlare SDK not installed. Run: pip install cloudflare")
    sys.exit(1)

# DNS Targets
GABIA_IP = "182.162.142.102"  # Current Gabia hosting IP (resolved 2026-01-27)
VERCEL_IP = "76.76.21.21"     # Vercel edge network IP
VERCEL_CNAME = "cname.vercel-dns.com"  # Vercel CNAME target

# Cloudflare credentials (from environment)
CF_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')
ZONE_NAME = "82mobile.com"

# Dry-run mode flag
DRY_RUN = False


def log(message: str, level: str = "info"):
    """Log message with emoji prefix"""
    prefixes = {
        "info": "ℹ️ ",
        "success": "✅",
        "error": "❌",
        "warning": "⚠️ ",
        "progress": "🔄",
        "rocket": "🚀"
    }
    prefix = prefixes.get(level, "")
    print(f"{prefix} {message}")


def get_zone_id(cf: CloudFlare, zone_name: str) -> str:
    """Get Cloudflare zone ID for domain"""
    try:
        zones = cf.zones.get(params={'name': zone_name})
        if not zones:
            raise Exception(f"Zone {zone_name} not found in Cloudflare account")
        return zones[0]['id']
    except Exception as e:
        log(f"Failed to get zone ID: {e}", "error")
        raise


def get_dns_record(cf: CloudFlare, zone_id: str, record_name: str, record_type: str) -> Optional[Dict[str, Any]]:
    """Get existing DNS record"""
    try:
        records = cf.zones.dns_records.get(
            zone_id,
            params={'name': record_name, 'type': record_type}
        )
        return records[0] if records else None
    except Exception as e:
        log(f"Failed to get DNS record {record_name} ({record_type}): {e}", "error")
        return None


def update_dns_record(cf: CloudFlare, zone_id: str, record_id: str, record_type: str,
                     name: str, content: str, ttl: int = 300):
    """Update DNS record content and TTL"""
    if DRY_RUN:
        log(f"[DRY-RUN] Would update {record_type} record: {name} → {content} (TTL: {ttl}s)", "info")
        return

    try:
        cf.zones.dns_records.put(
            zone_id,
            record_id,
            data={
                'type': record_type,
                'name': name,
                'content': content,
                'ttl': ttl,
                'proxied': False  # CRITICAL: Must be False for Vercel SSL to work
            }
        )
        log(f"Updated {record_type} record: {name} → {content} (TTL: {ttl}s)", "success")
    except Exception as e:
        log(f"Failed to update DNS record: {e}", "error")
        raise


def cutover_to_vercel():
    """Execute DNS cutover to Vercel"""
    log("Starting DNS cutover to Vercel...", "rocket")

    if DRY_RUN:
        log("Running in DRY-RUN mode - no changes will be made", "warning")

    cf = CloudFlare(token=CF_API_TOKEN)
    zone_id = get_zone_id(cf, ZONE_NAME)

    # Update A record: 82mobile.com → Vercel IP
    log(f"Updating A record: {ZONE_NAME} → {VERCEL_IP}", "progress")
    a_record = get_dns_record(cf, zone_id, ZONE_NAME, 'A')
    if a_record:
        update_dns_record(cf, zone_id, a_record['id'], 'A', ZONE_NAME, VERCEL_IP, ttl=300)
    else:
        log(f"A record not found for {ZONE_NAME}", "error")

    # Update CNAME: www.82mobile.com → Vercel CNAME
    log(f"Updating CNAME: www.{ZONE_NAME} → {VERCEL_CNAME}", "progress")
    cname_record = get_dns_record(cf, zone_id, f"www.{ZONE_NAME}", 'CNAME')
    if cname_record:
        update_dns_record(cf, zone_id, cname_record['id'], 'CNAME', f"www.{ZONE_NAME}", VERCEL_CNAME, ttl=300)
    else:
        log(f"CNAME record not found for www.{ZONE_NAME}", "error")

    if not DRY_RUN:
        log("DNS cutover complete!", "success")
        log(f"   Propagation time: ~5-10 minutes (TTL: 300s)", "info")
        log(f"   Verify: python3 -c \"import socket; print(socket.gethostbyname('{ZONE_NAME}'))\"", "info")
        log(f"   Expected result: {VERCEL_IP}", "info")
    else:
        log("DRY-RUN complete - no changes made", "info")


def rollback_to_gabia():
    """Rollback DNS to Gabia hosting"""
    log("Rolling back DNS to Gabia...", "progress")

    if DRY_RUN:
        log("Running in DRY-RUN mode - no changes will be made", "warning")

    cf = CloudFlare(token=CF_API_TOKEN)
    zone_id = get_zone_id(cf, ZONE_NAME)

    # Revert A record: 82mobile.com → Gabia IP
    log(f"Reverting A record: {ZONE_NAME} → {GABIA_IP}", "progress")
    a_record = get_dns_record(cf, zone_id, ZONE_NAME, 'A')
    if a_record:
        update_dns_record(cf, zone_id, a_record['id'], 'A', ZONE_NAME, GABIA_IP, ttl=300)
    else:
        log(f"A record not found for {ZONE_NAME}", "error")

    # Revert CNAME: www.82mobile.com → 82mobile.com
    log(f"Reverting CNAME: www.{ZONE_NAME} → {ZONE_NAME}", "progress")
    cname_record = get_dns_record(cf, zone_id, f"www.{ZONE_NAME}", 'CNAME')
    if cname_record:
        update_dns_record(cf, zone_id, cname_record['id'], 'CNAME', f"www.{ZONE_NAME}", ZONE_NAME, ttl=300)
    else:
        log(f"CNAME record not found for www.{ZONE_NAME}", "error")

    if not DRY_RUN:
        log("DNS rollback complete!", "success")
        log(f"   Propagation time: ~5-10 minutes (TTL: 300s)", "info")
        log(f"   Verify: python3 -c \"import socket; print(socket.gethostbyname('{ZONE_NAME}'))\"", "info")
        log(f"   Expected result: {GABIA_IP}", "info")
    else:
        log("DRY-RUN complete - no changes made", "info")


def lower_ttl():
    """Lower DNS TTL to 300s (72 hours before cutover)"""
    log("Lowering DNS TTL to 300s...", "progress")

    if DRY_RUN:
        log("Running in DRY-RUN mode - no changes will be made", "warning")

    cf = CloudFlare(token=CF_API_TOKEN)
    zone_id = get_zone_id(cf, ZONE_NAME)

    # Lower A record TTL
    a_record = get_dns_record(cf, zone_id, ZONE_NAME, 'A')
    if a_record:
        current_content = a_record['content']
        current_ttl = a_record['ttl']
        log(f"Current A record TTL: {current_ttl}s", "info")
        update_dns_record(cf, zone_id, a_record['id'], 'A', ZONE_NAME, current_content, ttl=300)

    # Lower CNAME TTL
    cname_record = get_dns_record(cf, zone_id, f"www.{ZONE_NAME}", 'CNAME')
    if cname_record:
        current_content = cname_record['content']
        current_ttl = cname_record['ttl']
        log(f"Current CNAME TTL: {current_ttl}s", "info")
        update_dns_record(cf, zone_id, cname_record['id'], 'CNAME', f"www.{ZONE_NAME}", current_content, ttl=300)

    if not DRY_RUN:
        log("TTL lowered to 300s!", "success")
        log("   Run cutover 72 hours from now for TTL propagation", "info")
        log("   This ensures fast rollback capability during cutover", "info")
    else:
        log("DRY-RUN complete - no changes made", "info")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Cloudflare DNS Manager for 82mobile.com cutover',
        epilog='Example: python3 cloudflare_dns_manager.py --dry-run --cutover'
    )
    parser.add_argument('--cutover', action='store_true', help='Execute DNS cutover to Vercel')
    parser.add_argument('--rollback', action='store_true', help='Rollback DNS to Gabia')
    parser.add_argument('--lower-ttl', action='store_true', help='Lower TTL to 300s (run 72h before cutover)')
    parser.add_argument('--dry-run', action='store_true', help='Dry-run mode: print changes without executing')

    args = parser.parse_args()

    if not CF_API_TOKEN:
        log("CLOUDFLARE_API_TOKEN environment variable not set", "error")
        log("Export your API token: export CLOUDFLARE_API_TOKEN='your-token-here'", "info")
        sys.exit(1)

    # Set dry-run flag
    DRY_RUN = args.dry_run

    # Execute requested action
    if args.cutover:
        cutover_to_vercel()
    elif args.rollback:
        rollback_to_gabia()
    elif args.lower_ttl:
        lower_ttl()
    else:
        parser.print_help()
        sys.exit(1)

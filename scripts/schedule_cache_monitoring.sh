#!/bin/bash
#
# Cache Monitoring Scheduler
#
# Runs cache verification tests at intervals: 1h, 6h, 24h, 48h
# after initial baseline test.
#
# Usage: nohup bash scripts/schedule_cache_monitoring.sh > /tmp/cache_monitor.log 2>&1 &
#

SCRIPT_DIR="/mnt/c/82Mobile/82mobile-next"
REPORT="$SCRIPT_DIR/.planning/phases/02-infrastructure-caching/CACHE-VERIFICATION-REPORT.md"
PYTHON_SCRIPT="$SCRIPT_DIR/scripts/verify_cache_bypass.py"

echo "=========================================="
echo "Cache Monitoring Started"
echo "Start Time: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
echo "=========================================="

# 1 hour interval
echo ""
echo "Waiting 1 hour for next test..."
sleep 3600

echo ""
echo "Running 1h verification..."
python3 "$PYTHON_SCRIPT" --interval 1h --report "$REPORT" --silent
echo "1h test complete at $(date -u +'%Y-%m-%d %H:%M:%S UTC')"

# 6 hours interval (5 more hours from 1h mark)
echo ""
echo "Waiting 5 hours for next test (6h mark)..."
sleep 18000

echo ""
echo "Running 6h verification..."
python3 "$PYTHON_SCRIPT" --interval 6h --report "$REPORT" --silent
echo "6h test complete at $(date -u +'%Y-%m-%d %H:%M:%S UTC')"

# 24 hours interval (18 more hours from 6h mark)
echo ""
echo "Waiting 18 hours for next test (24h mark)..."
sleep 64800

echo ""
echo "Running 24h verification..."
python3 "$PYTHON_SCRIPT" --interval 24h --report "$REPORT" --silent
echo "24h test complete at $(date -u +'%Y-%m-%d %H:%M:%S UTC')"

# 48 hours interval (24 more hours from 24h mark)
echo ""
echo "Waiting 24 hours for next test (48h mark)..."
sleep 86400

echo ""
echo "Running 48h verification..."
python3 "$PYTHON_SCRIPT" --interval 48h --report "$REPORT" --silent
echo "48h test complete at $(date -u +'%Y-%m-%d %H:%M:%S UTC')"

echo ""
echo "=========================================="
echo "Cache Monitoring Complete"
echo "End Time: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
echo "=========================================="
echo ""
echo "View results: cat $REPORT"

#!/bin/bash

# FestPanel Schedule Manager
# This script is intended to be run by cron

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE="schedule.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Starting Scheduled Tasks ==="

# 1. Run Crawler (basic mode)
log "Running Crawler..."
./manage.sh crawler run basic

# 2. Run Tests
log "Running Crawler Tests..."
(cd crawler && source venv/bin/activate && python3 tests/run_all.py) >> "$LOG_FILE" 2>&1
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
  log "Tests PASSED"
else
  log "Tests FAILED"
fi

# 3. Optional: Restart Watcher if not running
log "Checking Watcher status..."
./manage.sh watcher status | grep -q "running"
if [ $? -ne 0 ]; then
  log "Watcher not running, starting..."
  ./manage.sh watcher start
fi

log "=== Scheduled Tasks Completed ==="

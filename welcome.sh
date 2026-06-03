#!/bin/bash

echo "=== FestPanel Repository Information ==="
echo "Branch: $(git branch --show-current)"
echo "Last Commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
echo "Remote:"
git remote -v
echo ""

echo "=== Searching for examples in the repository ==="
find . -type f -name "*example*"
echo ""

echo "=== System Environment Summary ==="
echo "Node version: $(node -v)"
echo "App PID: $([ -f festpanel.pid ] && cat festpanel.pid || echo 'Not running')"

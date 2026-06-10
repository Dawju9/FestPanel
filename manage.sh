#!/bin/bash

# FestPanel App Manager
APP_NAME="festpanel"
PID_FILE="festpanel.pid"

build() {
  echo "Building..."
  notify_event_discord "Build Started" "Application build process has begun." "16776960" # Orange
  if npm run build; then
    notify_event_discord "Build Succeeded" "Application was built successfully." "3066993" # Green
  else
    notify_event_discord "Build Failed" "Application build failed. Check logs for details." "15158332" # Red
    return 1
  fi
}

clean() {
  echo "Cleaning..."
  notify_event_discord "Clean Started" "Application clean process has begun." "16776960" # Orange
  if rm -rf .next && rm -rf node_modules && npm install; then
    notify_event_discord "Clean Succeeded" "Clean process completed and dependencies reinstalled." "3066993" # Green
  else
    notify_event_discord "Clean Failed" "Clean process or dependency reinstallation failed." "15158332" # Red
    return 1
  fi
}

start() {
  if [ -f "$PID_FILE" ]; then
    local CURRENT_PID=$(cat "$PID_FILE")
    echo "Application is already running (PID: $CURRENT_PID)."
    notify_event_discord "App Start Skipped" "Application is already running (PID: ${CURRENT_PID})." "16776960" # Orange
  else
    echo "Starting..."
    notify_event_discord "App Start Initiated" "Attempting to start the application." "16776960" # Orange
    # Launch in background, save PID
    npm run start > app.log 2>&1 &
    local NEW_PID=$!
    echo "$NEW_PID" > "$PID_FILE"
    echo "Started (PID: $NEW_PID). Check app.log for output."
    notify_event_discord "App Started" "Application started successfully with PID: ${NEW_PID}." "3066993" # Green
  fi
}

stop() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    echo "Stopping (PID: $PID)..."
    notify_event_discord "App Stop Initiated" "Attempting to stop application with PID: ${PID}." "16776960" # Orange
    kill "$PID"
    rm "$PID_FILE"
    echo "Stopped."
    notify_event_discord "App Stopped" "Application with PID: ${PID} has been stopped." "3066993" # Green
  else
    echo "Application is not running."
    notify_event_discord "App Stop Skipped" "Application was not running, no process to stop." "16776960" # Orange
  fi
}

restart() {
  echo "Restarting application..."
  notify_event_discord "App Restart Initiated" "Attempting to restart the application." "16776960" # Orange
  stop
  sleep 2
  start
  notify_event_discord "App Restart Completed" "Application restart process finished." "3066993" # Green
}

send_discord_notification() {
  WEBHOOK_URL="$1"
  MESSAGE_JSON="$2"
  if [ -z "$WEBHOOK_URL" ]; then
    echo "Warning: DISCORD_WEBHOOK environment variable is not set. Skipping Discord notification."
    return
  fi
  curl -H "Content-Type: application/json" -X POST -d "$MESSAGE_JSON" "$WEBHOOK_URL" > /dev/null 2>&1
}

notify_event_discord() {
  local EVENT_TYPE="$1"
  local MESSAGE="$2"
  local COLOR="$3" # Hex color code or decimal
  local WEBHOOK_URL="$(grep DISCORD_WEBHOOK .env | cut -d '=' -f2-)"
  if [ -z "$WEBHOOK_URL" ]; then
    WEBHOOK_URL="$DISCORD_WEBHOOK" # Fallback to env var
  fi

  if [ -z "$WEBHOOK_URL" ]; then
    return # No webhook configured
  fi

  local TIMESTAMP=$(date -u +%FT%TZ) # ISO 8601 format

  local JSON_PAYLOAD="{\"embeds\":[{\"title\":\"🤖 FestPanel Event: $EVENT_TYPE\",\"description\":\"${MESSAGE}\",\"color\":${COLOR},\"timestamp\":\"${TIMESTAMP}\"}]}"
  send_discord_notification "$WEBHOOK_URL" "$JSON_PAYLOAD"
}


update_changelog() {
  COMMIT_MSG="$1"
  DIFF_SUMMARY="$2"
  CHANGELOG_FILE="CHANGELOG.md"
  DATE=$(date +"%Y-%m-%d")

  echo -e "\n## Unreleased\n" >> "$CHANGELOG_FILE"
  echo -e "### Added/Changed/Fixed on $DATE\n" >> "$CHANGELOG_FILE"
  echo -e "  - $COMMIT_MSG\n" >> "$CHANGELOG_FILE"
  if [ -n "$DIFF_SUMMARY" ]; then
    echo -e "$DIFF_SUMMARY\n" >> "$CHANGELOG_FILE"
  fi
}

commit_and_notify() {
  if [ -z "$2" ]; then
    echo "Usage: $0 commit <message>"
    return 1
  fi
  
  local COMMIT_MESSAGE="$2"
  # Fetch DISCORD_WEBHOOK from .env or environment
  local DISCORD_WEBHOOK_URL=$(grep DISCORD_WEBHOOK .env | cut -d '=' -f2-)
  if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    DISCORD_WEBHOOK_URL="$DISCORD_WEBHOOK" # Fallback to env var
  fi


  echo "Staging all changes..."
  git add .

  echo "Committing with message: $COMMIT_MESSAGE"
  git commit -m "$COMMIT_MESSAGE"
  
  if [ $? -ne 0 ]; then
    echo "Git commit failed. Aborting notification and changelog update."
    return 1
  fi

  local COMMIT_HASH=$(git log -1 --pretty=format:'%h')
  local COMMIT_AUTHOR=$(git log -1 --pretty=format:'%an')
  local COMMIT_DATE=$(git log -1 --pretty=format:'%ad' --date=iso-strict)

  echo "Getting diff summary..."
  local DIFF_RAW=$(git diff --name-status HEAD~1 HEAD)
  local DIFF_SUMMARY_MD=""

  while IFS= read -r line; do
    ACTION=$(echo "$line" | awk '{print $1}')
    FILE=$(echo "$line" | awk '{print $2}')
    case "$ACTION" in
      A) DIFF_SUMMARY_MD+="  - \`+ $FILE\` (dodano)\n" ;;
      M) DIFF_SUMMARY_MD+="  - \`~ $FILE\` (zmodyfikowano)\n" ;;
      D) DIFF_SUMMARY_MD+="  - \`- $FILE\` (usunięto)\n" ;;
      *) DIFF_SUMMARY_MD+="  - \`? $FILE\` ($ACTION)\n" ;;
    esac
  done <<< "$DIFF_RAW"

  echo "Updating CHANGELOG.md..."
  update_changelog "$COMMIT_MESSAGE" "$DIFF_SUMMARY_MD"

  echo "Commit complete."
}

deploy() {
  echo "Deploying application..."
  notify_event_discord "App Deploy Initiated" "Starting deployment process (stop, clean, build, start)." "16776960" # Orange
  stop
  clean
  if [ $? -ne 0 ]; then
    notify_event_discord "App Deploy Failed" "Deployment failed during clean/build phase." "15158332" # Red
    return 1
  fi
  build
  if [ $? -ne 0 ]; then
    notify_event_discord "App Deploy Failed" "Deployment failed during build phase." "15158332" # Red
    return 1
  fi
  start
  if [ $? -ne 0 ]; then
    notify_event_discord "App Deploy Failed" "Deployment failed during start phase." "15158332" # Red
    return 1
  fi
  notify_event_discord "App Deploy Succeeded" "Deployment process completed successfully." "3066993" # Green
}




_crawler_python() {
  (cd "$1" && source venv/bin/activate && python3 $2)
}

_crawler_python_nohup() {
  (cd "$1" && source venv/bin/activate && nohup python3 $2 > /dev/null 2>&1 &)
}

_crawler_python_plain() {
  (cd "$1" && python3 $2)
}

crawler() {
  CRAWLER_DIR="crawler"
  CRAWLER_SCRIPT="main.py"
  # Fallback to old monolithic script if new main.py doesn't exist
  [ ! -f "$CRAWLER_DIR/$CRAWLER_SCRIPT" ] && CRAWLER_SCRIPT="floor_crawler_discord.py"
  case "$2" in
    stop)
      echo "Stopping crawler..."
      notify_event_discord "Crawler Stop Initiated" "Attempting to stop the crawler." "16776960" # Orange
      if _crawler_python_plain "$CRAWLER_DIR" "$CRAWLER_SCRIPT --stop"; then
        notify_event_discord "Crawler Stopped" "Crawler process has been stopped." "3066993" # Green
      else
        notify_event_discord "Crawler Stop Failed" "Failed to stop crawler." "15158332" # Red
      fi
      ;;
    status)
      _crawler_python_plain "$CRAWLER_DIR" "$CRAWLER_SCRIPT --status"
      ;;
    run)
      MODE="${3:-basic}"
      echo "Running crawler (mode $MODE)..."
      notify_event_discord "Crawler Run Initiated" "Running crawler in ${MODE} mode." "16776960" # Orange
      if _crawler_python "$CRAWLER_DIR" "$CRAWLER_SCRIPT --mode $MODE"; then
        notify_event_discord "Crawler Run Completed" "Crawler run in ${MODE} mode completed." "3066993" # Green
      else
        notify_event_discord "Crawler Run Failed" "Crawler run in ${MODE} mode failed." "15158332" # Red
      fi
      ;;
    start)
      MODE="${3:-basic}"
      echo "Starting crawler daemon (mode $MODE)..."
      notify_event_discord "Crawler Daemon Start Initiated" "Attempting to start crawler daemon in ${MODE} mode." "16776960" # Orange
      _crawler_python_nohup "$CRAWLER_DIR" "$CRAWLER_SCRIPT --daemon --mode $MODE"
      sleep 1
      if [ -f "$CRAWLER_DIR/crawler.pid" ]; then
        PID=$(cat "$CRAWLER_DIR/crawler.pid")
        echo "Crawler started (PID: $PID)"
        notify_event_discord "Crawler Daemon Started" "Crawler daemon started with PID: ${PID} in ${MODE} mode." "3066993" # Green
      else
        echo "Crawler start failed"
        notify_event_discord "Crawler Daemon Start Failed" "Failed to start crawler daemon in ${MODE} mode." "15158332" # Red
      fi
      ;;
    *)
      echo "Usage: $0 crawler {start|stop|status|run} [basic|agent]"
      ;;
  esac
}

watcher() {
  CRAWLER_DIR="crawler"
  WATCHER_SCRIPT="modules/watcher.py"
  case "$2" in
    stop)
      echo "Stopping watcher..."
      notify_event_discord "Watcher Stop Initiated" "Attempting to stop the watcher." "16776960" # Orange
      if _crawler_python_plain "$CRAWLER_DIR" "$WATCHER_SCRIPT --stop"; then
        notify_event_discord "Watcher Stopped" "Watcher process has been stopped." "3066993" # Green
      else
        notify_event_discord "Watcher Stop Failed" "Failed to stop watcher." "15158332" # Red
      fi
      ;;
    status)
      _crawler_python_plain "$CRAWLER_DIR" "$WATCHER_SCRIPT --status"
      ;;
    run)
      echo "Running watcher..."
      notify_event_discord "Watcher Run Initiated" "Running watcher process." "16776960" # Orange
      if _crawler_python "$CRAWLER_DIR" "$WATCHER_SCRIPT"; then
        notify_event_discord "Watcher Run Completed" "Watcher run process completed." "3066993" # Green
      else
        notify_event_discord "Watcher Run Failed" "Watcher run process failed." "15158332" # Red
      fi
      ;;
    start)
      echo "Starting watcher daemon..."
      notify_event_discord "Watcher Daemon Start Initiated" "Attempting to start watcher daemon." "16776960" # Orange
      _crawler_python_nohup "$CRAWLER_DIR" "$WATCHER_SCRIPT --daemon"
      sleep 1
      if [ -f "$CRAWLER_DIR/watcher.pid" ]; then
        PID=$(cat "$CRAWLER_DIR/watcher.pid")
        echo "Watcher started (PID: $PID)"
        notify_event_discord "Watcher Daemon Started" "Watcher daemon started with PID: ${PID}." "3066993" # Green
      else
        echo "Watcher start failed"
        notify_event_discord "Watcher Daemon Start Failed" "Failed to start watcher daemon." "15158332" # Red
      fi
      ;;
    *)
      echo "Usage: $0 watcher {start|stop|status|run}"
      ;;
  esac
}

status() {
  echo "=== FestPanel Status ==="
  echo "Node version: $(node -v)"
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo "App: running (PID: $PID)"
    else
      echo "App: not running (stale PID file)"
    fi
  else
    echo "App: not running"
  fi
  CRAWLER_DIR="crawler"
  for svc in crawler watcher; do
    PIDF="$CRAWLER_DIR/$svc.pid"
    if [ -f "$PIDF" ]; then
      CPID=$(cat "$PIDF")
      if kill -0 "$CPID" 2>/dev/null; then
        echo "$svc: running (PID: $CPID)"
      else
        echo "$svc: stopped (stale pid)"
      fi
    else
      echo "$svc: not running"
    fi
  done
}

case "$1" in
  build) build ;;
  clean) clean ;;
  start) start ;;
  stop) stop ;;
  restart) restart ;;
  status) status ;;
  deploy) deploy ;;
  commit) commit_and_notify "$@" ;;
  crawler) crawler "$@" ;;
  watcher) watcher "$@" ;;
  *) echo "Usage: $0 {build|clean|start|stop|restart|status|deploy|commit <message>|crawler|watcher}" ;;
esac

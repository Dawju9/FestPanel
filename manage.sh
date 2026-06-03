#!/bin/bash

# FestPanel App Manager
APP_NAME="festpanel"
PID_FILE="festpanel.pid"

build() {
  echo "Building..."
  npm run build
}

clean() {
  echo "Cleaning..."
  rm -rf .next
  rm -rf node_modules
  npm install
}

start() {
  if [ -f "$PID_FILE" ]; then
    echo "Application is already running (PID: $(cat $PID_FILE))."
  else
    echo "Starting..."
    # Launch in background, save PID
    npm run start > app.log 2>&1 &
    echo $! > $PID_FILE
    echo "Started (PID: $!). Check app.log for output."
  fi
}

stop() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    echo "Stopping (PID: $PID)..."
    kill $PID
    rm $PID_FILE
    echo "Stopped."
  else
    echo "Application is not running."
  fi
}

restart() {
  stop
  sleep 2
  start
}

deploy() {
  stop
  clean
  build
  start
}

case "$1" in
  build) build ;;
  clean) clean ;;
  start) start ;;
  stop) stop ;;
  restart) restart ;;
  deploy) deploy ;;
  *) deploy ;; # Default to deploy
esac

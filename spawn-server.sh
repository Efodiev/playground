#!/bin/bash
# This script spawns the server in a way that survives parent shell exit
(
  cd /home/z/my-project
  rm -rf .next
  while true; do
    node node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
    echo "=== Restart at $(date) ===" >> /home/z/my-project/dev.log
    sleep 3
  done
) &
echo $! > /home/z/my-project/server.pid

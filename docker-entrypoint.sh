#!/bin/bash
set -e

PORT=4000 node dist/index.js & NODE_PID=$!

for i in $(seq 1 30); do
  if wget -q -O- http://127.0.0.1:4000/health >/dev/null 2>&1; then
    echo "Node is up, starting Nginx."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Node did not become healthy in time, exiting."
    kill "$NODE_PID" 2>/dev/null || true
    exit 1
  fi
  sleep 0.5
done

nginx -g "daemon off;" & NGINX_PID=$!

wait -n "$NODE_PID" "$NGINX_PID"
exit $?

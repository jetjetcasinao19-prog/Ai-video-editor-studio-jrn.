#!/usr/bin/env bash
# One-time setup for code-animated shorts. Safe to run again.
set -e
cd "$(dirname "$0")"
need() { command -v "$1" >/dev/null 2>&1 || { echo "missing: $1 — $2"; exit 1; }; }
need node   "install Node.js 22+ (https://nodejs.org)"
need ffmpeg "install FFmpeg (apt-get install -y ffmpeg / brew install ffmpeg)"
need python3 "install Python 3"
node -e 'process.exit(+process.versions.node.split(".")[0] >= 22 ? 0 : 1)' || { echo "Node 22+ needed (found $(node -v))"; exit 1; }
python3 -c 'import numpy' 2>/dev/null || python3 -m pip install --quiet numpy
[ -d node_modules/@napi-rs/canvas ] || npm install --no-audit --no-fund
node -e "require('@napi-rs/canvas').createCanvas(8,8)" && echo "canvas ok"
python3 -c 'import numpy; print("numpy", numpy.__version__)'
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx264 && echo "ffmpeg + libx264 ok" || { echo "ffmpeg has no libx264"; exit 1; }
echo "ready: node render.mjs projects/<name>"

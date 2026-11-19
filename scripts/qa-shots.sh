#!/usr/bin/env bash
# Visual QA screenshots. Usage: scripts/qa-shots.sh [baseUrl]
BASE="${1:-http://localhost:5174}"
OUT="docs/qa"
mkdir -p "$OUT"
b64() { printf '%s' "$1" | base64 -w0 | tr '+/' '-_' | tr -d '='; }

shot() { # name width height url
  brave-browser --headless=new --enable-webgl --ignore-gpu-blocklist --use-gl=angle \
    --use-angle=swiftshader --enable-unsafe-swiftshader --window-size="$2,$3" \
    --virtual-time-budget=9000 --screenshot="$OUT/$1.png" "$4" >/dev/null 2>&1
  echo "captured $1"
}

POLO=$(b64 '{"sport":"rugby","cut":"women","collar":"polo","sleeve":"short","pattern":"hoops","fabric":"pique"}')
YOUTH=$(b64 '{"sport":"baseball","cut":"youth","collar":"henley-2","sleeve":"raglan","pattern":"raglan-classic"}')
LONG=$(b64 '{"sport":"soccer","cut":"men","collar":"crew","sleeve":"long","pattern":"gradient"}')

shot back-baseball 1440 900 "$BASE/?view=back#/sport/baseball/cut/men/color/maroon/"
shot polo-women-front 1440 900 "$BASE/#/sport/rugby/cut/women/color/maroon/$POLO"
shot polo-women-back 1440 900 "$BASE/?view=back#/sport/rugby/cut/women/color/maroon/$POLO"
shot youth-raglan 1440 900 "$BASE/#/sport/baseball/cut/youth/color/maroon/$YOUTH"
shot long-crew 1440 900 "$BASE/#/sport/soccer/cut/men/color/maroon/$LONG"
shot roster-modal 1440 900 "$BASE/?quote=1"
shot mobile 420 860 "$BASE/"

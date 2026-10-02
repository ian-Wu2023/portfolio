#!/bin/bash
# Installs what the tests and the CSS build need, so a Claude Code cloud
# session can run `npm test`, `npm run build:css` and the Pong tests right away.
# Java (for the calculator tests) is already in the cloud image.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Tailwind CLI for `npm run build:css`. `npm install` (not `npm ci`) keeps the
# cached node_modules from the previous session.
npm install --no-audit --no-fund

# Pygame for `python -m unittest test_pong` in projects/pong.
python3 -m pip install --quiet --disable-pip-version-check -r projects/pong/requirements.txt

# Pygame needs these to run without a display or sound card.
echo 'export SDL_VIDEODRIVER=dummy' >> "$CLAUDE_ENV_FILE"
echo 'export SDL_AUDIODRIVER=dummy' >> "$CLAUDE_ENV_FILE"

#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /home/domyn/vIVSR/landline-server
exec npx wrangler dev --port 8787 < /dev/null

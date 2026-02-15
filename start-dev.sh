#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /Users/willsair/dev/teleprompter
nvm use 20
npm run dev &
sleep 2
open http://localhost:5173/
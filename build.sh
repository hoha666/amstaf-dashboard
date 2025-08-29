#!/usr/bin/env sh
set -eu

IMAGE_NAME="amstaf-dashboard:latest"

# 1. Install deps
npm install --legacy-peer-deps

# 2. Run lint
npm run lint

# 3. Run tests (if defined in package.json)
if npm run | grep -q "test"; then
  npm test
fi

# 4. Build Next.js app (output goes to ./out)
npm run build

# 5. Build docker image
docker build -t $IMAGE_NAME .

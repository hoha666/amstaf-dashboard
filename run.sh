#!/usr/bin/env sh
set -eu

IMAGE_NAME="amstaf-dashboard:latest"
CONTAINER_NAME="amstaf-dashboard"

# Stop and remove container if exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Stopping and removing existing container: $CONTAINER_NAME"
  docker stop $CONTAINER_NAME || true
  docker rm $CONTAINER_NAME || true
fi

# Run container
echo "Starting container $CONTAINER_NAME on port 3000..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 3000:3000 \
  $IMAGE_NAME

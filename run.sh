#!/bin/bash
set -e

DOCKER_FILE='./docker-compose.yml'
DOCKER_FILE_PROD='./docker-compose.dev.test.yml'

echo
echo "=== Building and starting containers ==="

docker compose -f "${DOCKER_FILE}" -f "${DOCKER_FILE_PROD}" up -d --build

echo
echo "=== Removing unused images ==="
# docker image prune -f

echo
echo "=== Running containers ==="

docker compose -f "${DOCKER_FILE}" -f "${DOCKER_FILE_PROD}" ps
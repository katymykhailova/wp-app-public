#!/bin/bash
set -e

DOCKER_FILE='./docker-compose.yml'
DOCKER_FILE_TEST='./docker-compose.test.yml'
DOCKER_FILE_PUBLIC='./docker-compose.public.yml'


echo
echo "=== Building and starting containers ==="

docker compose -f "${DOCKER_FILE}" -f "${DOCKER_FILE_TEST}" -f "${DOCKER_FILE_PUBLIC}" up -d --build

echo
echo "=== Removing unused images ==="
# docker image prune -f

echo
echo "=== Running containers ==="

docker compose -f "${DOCKER_FILE}" -f "${DOCKER_FILE_TEST}" -f "${DOCKER_FILE_PUBLIC}" ps
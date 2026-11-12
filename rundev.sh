#!/bin/bash
set -e

cd "$(dirname "$0")"

DOCKER_FILE='./docker-compose.yml'
DOCKER_FILE_DEV='./docker-compose.dev.yml'
DOCKER_FILE_TEST='./docker-compose.test.yml'


docker compose -f "${DOCKER_FILE}" -f "${DOCKER_FILE_DEV}" -f "${DOCKER_FILE_TEST}" up --build
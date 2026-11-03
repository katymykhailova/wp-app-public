#!/bin/bash
set -e

DOCKER_FILE='./docker-compose.yml'
DOCKER_FILE_DEV='./docker-compose.dev.yml'
DOCKER_FILE_DEV_TEST='./docker-compose.dev.test.yml'


docker compose -f "${DOCKER_FILE}" -f "${DOCKER_FILE_DEV}" -f "${DOCKER_FILE_DEV_TEST}" up --build
#!/bin/sh

docker_run="docker run -d -p 6379:6379 redis:$INPUT_REDIS_VERSION redis-server"

sh -c "$docker_run"

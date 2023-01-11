#!/bin/sh

REDIS_VERSION=$1

docker run --name redis-server --publish 6379:6379 --detach redis:$REDIS_VERSION

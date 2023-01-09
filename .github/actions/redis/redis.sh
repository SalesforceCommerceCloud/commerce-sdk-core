#!/bin/sh

sh -c "docker run --name redis-server --publish 6379:6379 --detach redis:$INPUT_REDIS_VERSION"

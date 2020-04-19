#!/bin/sh

docker run --rm -i -v $(pwd):$(pwd):rw -w=$(pwd) -u $(id -u) herloct/phpcs "$@"
exit $?
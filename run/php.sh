#!/bin/sh

#docker run --rm -i --network=host -v $(pwd):$(pwd):rw -w=$(pwd) -u $(id -u) besogon1/cltv  php "$@"
docker exec -i -u $(id -u) cltv_web_master php "$@"

exit $?

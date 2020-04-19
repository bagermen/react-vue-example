#!/bin/sh

# Generate new image for cltv
export $(grep -v '^#' .env | xargs -0)

docker run --rm -ti -v $CLTV_ASSET:$CLTV_ASSET:rw -w=$CLTV_ASSET -u $(id -u) node:8-jessie npm "$@"
exit $?

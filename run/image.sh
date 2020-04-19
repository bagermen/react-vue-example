#!/bin/bash

# Generate new image for cltv
export $(grep -v '^#' .env | xargs -0)

if [[ -z $1 ]];
then
    echo "Point out image version"
    exit
fi

docker build --rm --build-arg DOCUMENTROOT=$DOCUMENTROOT --build-arg TIMEZONE=$TIMEZONE -t besogon1/cltv:$1 -t besogon1/cltv:latest -f ./containers/web/Dockerfile ./containers/web

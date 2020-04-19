#!/bin/sh

docker exec -i -u $(id -u) cltv_web_master composer --working-dir=./application/external-libraries/composer "$@"

exit $?

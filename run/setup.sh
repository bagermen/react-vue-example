#!/bin/sh
docker-compose build
sh ./composer.sh install
sh ./migrate.sh

echo 'DONE'

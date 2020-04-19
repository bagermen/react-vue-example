#!/bin/sh

service memcached start

exec /usr/local/bin/apache2-foreground

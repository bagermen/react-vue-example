#!/bin/bash
ROOT_PSW=$1
mysql -uroot -p${ROOT_PSW} -e "show databases;" | awk '!/\*|schema$|mysql$|sys$|Database$/ { print "drop database `" $1 "`;" }' | mysql -uroot -p${ROOT_PSW}
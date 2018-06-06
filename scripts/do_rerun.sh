#!/bin/bash

if [ "$1" == "test:chrome:old:install:greasyfork" ] || [ "$1" == "test:chrome:old:install:openuserjs" ] || [ "$1" == "test:chrome:old:install:userscriptsorg" ] || [ "$1" == "test:chrome:old:install:userstylesorg" ] ; then
	yarn run $TEST || yarn run $TEST
fi
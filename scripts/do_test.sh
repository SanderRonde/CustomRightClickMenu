#!/bin/bash

script_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )


# Only run the test if it's not a pull request or if it is, 
# only run ones that don't require browserstack
run_test=0
$script_path/is_eq.sh "$TRAVIS_PULL_REQUEST" "false" && run_test=1
$script_path/is_eq.sh "$1" "test-build" && run_test=1
$script_path/is_eq.sh "$1" "test-local" && run_test=1

# Retry the install tests
do_retry=0
$script_path/is_eq.sh "$1" "test:chrome:old:install:greasyfork" && do_retry=1
$script_path/is_eq.sh "$1" "test:chrome:old:install:openuserjs" && do_retry=1
$script_path/is_eq.sh "$1" "test:chrome:old:install:userscriptsorg" && do_retry=1
$script_path/is_eq.sh "$1" "test:chrome:old:install:userstylesorg" && do_retry=1

if ((run_test)); then
	if ((do_retry)); then
		yarn run $1 || yarn run $1
	else
		yarn run $1
	fi
else
	echo "Skipping test because this is a pull request"
fi
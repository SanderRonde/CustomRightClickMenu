#!/bin/bash

script_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

export ATTEMPTS=1

# Only run the test if it's not a pull request or if it is, 
# only run ones that don't require browserstack
run_test=0
$script_path/is_eq.sh "$TRAVIS_PULL_REQUEST" "false" && run_test=1
$script_path/is_eq.sh "$1" "test-build" && run_test=1
$script_path/is_eq.sh "$1" "test-local" && run_test=1

do_retry_once=0
$script_path/is_eq.sh "$1" "test:chrome:old:page:pre-stylesheet" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:chrome:old:extension:pre-stylesheet" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:chrome:latest:page:pre-stylesheet" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:chrome:latest:extension::pre-stylesheet" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:chrome:old:extension:post-stylesheet" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:chrome:latest:page:post-stylesheet" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:firefox:quantum" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:firefox:latest" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:edge:16" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:edge:latest" && do_retry_once=1

do_retry_twice=0
$script_path/is_eq.sh "$1" "test:chrome:old:install:greasyfork" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test:chrome:old:install:openuserjs" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test:chrome:old:install:userscriptsorg" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test:chrome:old:install:userstylesorg" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.12" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.13" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.14" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.15" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.16" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.17" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.18" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test-migration:2.0.19" && do_retry_twice=1

do_retry_trice=0
$script_path/is_eq.sh "$1" "test:chrome:old:page:stylesheet" && do_retry_trice=1
$script_path/is_eq.sh "$1" "test:chrome:old:extension:stylesheet" && do_retry_trice=1
$script_path/is_eq.sh "$1" "test:chrome:latest:page:stylesheet" && do_retry_trice=1
$script_path/is_eq.sh "$1" "test:chrome:latest:extension:stylesheet" && do_retry_trice=1
$script_path/is_eq.sh "$1" "test:chrome:latest:install:openusercss" && do_retry_trice=1

do_retry_a_lot=0
$script_path/is_eq.sh "$1" "test:chrome:old:page:post-stylesheet" && do_retry_a_lot=1
$script_path/is_eq.sh "$1" "test:chrome:latest:extension:post-stylesheet" && do_retry_a_lot=1

is_chrome_latest=0

if [[ $1 == test:chrome:latest* ]]; then
	is_chrome_latest=1
fi

test_to_run=$1
function run_cmd() {
	if [ $is_chrome_latest -eq 1 ]; then
		(export SELENIUM_SERVER=$SELENIUM_SERVER && export REMOTE_PW=$SELENIUM_PW && yarn run $test_to_run)
	else
		yarn run $test_to_run
	fi
}

if ((run_test)); then
	if ((do_retry_a_lot)); then
		run_cmd || export ATTEMPTS=2 && run_cmd || export ATTEMPTS=3 && run_cmd || export ATTEMPTS=4 && run_cmd || export ATTEMPTS=5 && run_cmd || export ATTEMPTS=6 && run_cmd || export ATTEMPTS=7 && run_cmd || export ATTEMPTS=8 && run_cmd || export ATTEMPTS=9 && run_cmd || export ATTEMPTS=10 && run_cmd || export ATTEMPTS=11 && run_cmd || export ATTEMPTS=12 && run_cmd
	elif ((do_retry_trice)); then
		run_cmd || export ATTEMPTS=2 && run_cmd || export ATTEMPTS=3 && run_cmd || export ATTEMPTS=4 && run_cmd
	elif ((do_retry_twice)); then
		run_cmd || export ATTEMPTS=2 && run_cmd || export ATTEMPTS=3 && run_cmd
	elif ((do_retry_once)); then
		run_cmd || export ATTEMPTS=2 && run_cmd
	else
		run_cmd
	fi
else
	echo "Skipping test because this is a pull request"
fi
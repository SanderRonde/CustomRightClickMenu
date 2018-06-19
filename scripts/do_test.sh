#!/bin/bash

script_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )


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
$script_path/is_eq.sh "$1" "test:firefox:quantum" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:firefox:latest" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:edge:16" && do_retry_once=1
$script_path/is_eq.sh "$1" "test:edge:latest" && do_retry_once=1

# Retry some tests
do_retry_twice=0
$script_path/is_eq.sh "$1" "test:chrome:old:page:post-stylesheet" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test:chrome:old:extension:post-stylesheet" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test:chrome:latest:page:post-stylesheet" && do_retry_twice=1
$script_path/is_eq.sh "$1" "test:chrome:latest:extension:post-stylesheet" && do_retry_twice=1
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

if ((run_test)); then
	if ((do_retry_twice)); then
		yarn run $1 || yarn run $1 || yarn run $1
	elif ((do_retry_once)); then
		yarn run $1 || yarn run $1
	else
		yarn run $1
	fi
else
	echo "Skipping test because this is a pull request"
fi
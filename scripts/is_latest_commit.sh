#!/bin/bash

script_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

latest_commit=`git ls-remote git://github.com/SanderRonde/CustomRightClickMenu.git | grep HEAD | grep -oP "^[A-Za-z0-9]*"`
current_commit="$TRAVIS_COMMIT"

is_same=`$script_path/is_eq.sh $latest_commit $current_commit`

exit is_same
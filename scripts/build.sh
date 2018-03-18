#!/bin/bash
set -e

http-server -p 1250 . -s &

echo "Testing if it can build" && echo -en "travis_fold:start:build_tests\\r"
gulp testBuild
echo -en "travis_fold:end:build_tests\\r"

echo "Building for tests" && echo -en "travis_fold:start:build\\r"
yarn pretest
echo -en "travis_fold:end:build\\r"

echo "Unit tests" && echo -en "travis_fold:start:unit_tests\\r"
yarn test:global
echo -en "travis_fold:end:unit_tests\\r"
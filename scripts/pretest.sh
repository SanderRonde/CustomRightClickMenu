#!/bin/bash
set -e

npm install gulp -g
yarn

http-server -p 1250 . -s &

gulp stashBrowser
gulp browserChrome
gulp buildTest
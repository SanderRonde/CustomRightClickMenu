#!/bin/bash
set -e

http-server -p 1250 . -s &

gulp stashBrowser
gulp browserChrome
gulp buildTest
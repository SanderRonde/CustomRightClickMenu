#!/bin/bash
set -e

http-server -p 1250 . -s &

gulp testBuild
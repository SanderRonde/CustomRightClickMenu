#!/bin/bash
set -e

echo "Starting grunt tests";
grunt testBuild
echo "Finished grunt tests";

echo "Starting unit tests";
npm test
echo "Finished unit tests";
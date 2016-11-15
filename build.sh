#!/bin/bash
set -e

http-server -p 1234 . -s &

echo "Starting build tests";
grunt testBuild
echo "Finished build tests";

echo "Starting unit tests";
mocha test/test.js
echo "Finished unit tests";

echo "Starting UI tests in parallel";
node test/parallelTest.js
echo "Finished UI tests in parallel";

if [ "$TRAVIS_BRANCH" = "master" ]; then
  echo "Changing branches";
  grunt website

  git config user.name "Travis CI"
  git config user.email "awsdfgvhbjn@gmail.com"
  git config --global push.default simple

  git remote set-branches --add origin gh-pages
  git fetch

  git reset --hard
  git checkout -b gh-pages
  echo "Changed branches";

  npm install

  grunt moveWebsite

  set +e
  git diff-index --quiet HEAD

  echo "Committing changes";
  git add -A .
  git commit -m "Deploy to Github Pages" --quiet
  echo "Committed changes";

  echo "Pushing changes";
  if [ $? -ne 0 ] ; then #Something went wrong committing, don't push
    echo "Faulty commit, abort push";
    exit 0;
  fi

  git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" --force --quiet
  echo "Pushed github pages to branch";
fi
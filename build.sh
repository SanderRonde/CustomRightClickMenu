#!/bin/bash
set -e

http-server -p 1250 . -s &

npm install -g typescript@latest

echo "Typescript Compiling App" && echo -en "travis_fold:start:ts_app\\r"
tsc
echo -en "travis_fold:end:ts_app\\r"
cd test
echo "Typescript Compiling Test" && echo -en "travis_fold:start:ts_test\\r"
tsc
echo -en "travis_fold:end:ts_test\\r"
cd ../

echo "Testing if it can build" && echo -en "travis_fold:start:build_tests\\r"
yarn run build
echo -en "travis_fold:end:build_tests\\r"

echo "Building for tests" && echo -en "travis_fold:start:build\\r"
yarn run pretest
echo -en "travis_fold:end:build\\r"

echo "Unit tests" && echo -en "travis_fold:start:unit_tests\\r"
yarn run test:global
echo -en "travis_fold:end:unit_tests\\r"

echo "UI Tests for chrome" && echo -en "travis_fold:start:chrome\\r"
echo "UI Tests for chrome 26" && echo -en "travis_fold:start:chrome.1\\r"
yarn run test:chrome:26
echo -en "travis_fold:end:chrome.1\\r"

echo "UI Tests for chrome 30" && echo -en "travis_fold:start:chrome.2\\r"
yarn run test:chrome:30
echo -en "travis_fold:end:chrome.2\\r"

echo "UI Tests for latest chrome" && echo -en "travis_fold:start:chrome.3\\r"
yarn run test:chrome:latest
echo -en "travis_fold:end:chrome.3\\r"
echo -en "travis_fold:end:chrome\\r"

echo "UI Tests for firefox" && echo -en "travis_fold:start:firefox\\r"
echo "UI Tests for firefox quantum" && echo -en "travis_fold:start:firefox.1\\r"
yarn run test:firefox:quantum
echo -en "travis_fold:end:firefox.1\\r"

echo "UI Tests for latest firefox" && echo -en "travis_fold:start:firefox.2\\r"
yarn run test:firefox:latest
echo -en "travis_fold:end:firefox.2\\r"
echo -en "travis_fold:end:firefox\\r"

echo "UI Tests for edge" && echo -en "travis_fold:start:edge\\r"
echo "UI Tests for edge 16" && echo -en "travis_fold:start:edge.1\\r"
yarn run test:edge:16
echo -en "travis_fold:end:edge.1\\r"

echo "UI Tests for latest edge" && echo -en "travis_fold:start:edge.2\\r"
yarn run test:edge:latest
echo -en "travis_fold:end:edge.2\\r"
echo -en "travis_fold:end:edge\\r"

echo "UI Tests for opera" && echo -en "travis_fold:start:opera\\r"
echo "UI Tests for opera 51" && echo -en "travis_fold:start:opera.1\\r"
yarn run test:opera:51
echo -en "travis_fold:end:opera.1\\r"

echo "UI Tests for latest opera" && echo -en "travis_fold:start:opera.2\\r"
yarn run test:opera:latest
echo -en "travis_fold:end:opera.2\\r"
echo -en "travis_fold:end:opera\\r"

if [ "$TRAVIS_BRANCH" = "master" ]; then
  echo "Changing branches"

  echo "Pushing to gh-pages" && echo -en "travis_fold:start:gh_pages\\r"
  grunt documentationWebsite
  grunt moveFavicon
  grunt demoWebsite
  grunt compile
  grunt changeGitIgnore

  git config user.name "Travis CI"
  git config user.email "builds@travis-ci.org"
  git config --global push.default simple

  git remote set-branches --add origin gh-pages
  git fetch

  git reset --hard
  git checkout -b gh-pages
  echo "Changed branches"

  npm install

  grunt moveDocumentationWebsite
  grunt compile
  grunt changeGitIgnore

  set +e
  git diff-index --quiet HEAD

  echo "Committing changes"
  git add -A .
  git commit -m "Deploy to Github Pages" --quiet
  echo "Committed changes"

  echo "Pushing changes"
  if [ $? -ne 0 ] ; then #Something went wrong committing, don't push
    echo "Faulty commit, abort push"
    exit 0
  fi

  git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" --force --quiet
  echo "Pushed github pages to branch"
  echo -en "travis_fold:end:gh_pages\\r"
fi
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

echo "Build tests" && echo -en "travis_fold:start:build_tests\\r"
grunt testBuild
echo -en "travis_fold:end:build_tests\\r"

echo "Building for tests" && echo -en "travis_fold:start:build\\r"
grunt build
echo -en "travis_fold:end:build\\r"

echo "Unit tests" && echo -en "travis_fold:start:unit_tests\\r"
mocha test/test.js
echo -en "travis_fold:end:unit_tests\\r"

echo "UI Tests for new browser" && echo -en "travis_fold:start:ui_tests.1\\r"
mocha test/UITest.js --remote --latest-chrome
echo -en "travis_fold:end:ui_tests.1\\r"

echo "UI Tests for chrome 30" && echo -en "travis_fold:start:ui_tests.2\\r"
mocha test/UITest.js --remote --chrome-30
echo -en "travis_fold:end:ui_tests.2\\r"

echo "UI Tests for chrome 26" && echo -en "travis_fold:start:ui_tests.3\\r"
mocha test/UITest.js --remote --chrome-26
echo -en "travis_fold:end:ui_tests.3\\r"

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
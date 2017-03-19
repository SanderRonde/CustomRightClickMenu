#!/bin/bash
set -e

http-server -p 1234 . -s &

tsc
cd test
tsc
cd ../

echo "Build tests" && echo -en "travis_fold:start:build_tests\\r"
grunt testBuild
echo -en "travis_fold:end:build_tests\\r"

echo "Unit tests" && echo -en "travis_fold:start:unit_tests\\r"
mocha test/test.js
echo -en "travis_fold:end:unit_tests\\r"

echo "UI Tests for old browser" && echo -en "travis_fold:start:ui_tests.1\\r"
mocha test/UITest.js
echo -en "travis_fold:end:ui_tests.1\\r"

echo "UI Tests for new browser" && echo -en "travis_fold:start:ui_tests.2\\r"
cp test/UITest.js test/UITest-1.js
mocha test/UITest-1.js
rm test/UITest-1.js
echo -en "travis_fold:end:ui_tests.2\\r"

if [ "$TRAVIS_BRANCH" = "master" ]; then
  echo "Changing branches"

  echo "Pushing to gh-pages" && echo -en "travis_fold:start:gh_pages\\r"
  grunt documentationWebsite
  grunt demoWebsite
  grunt changeGitIgnore

  git config user.name "Travis CI"
  git config user.email "awsdfgvhbjn@gmail.com"
  git config --global push.default simple

  git remote set-branches --add origin gh-pages
  git fetch

  git reset --hard
  git checkout -b gh-pages
  echo "Changed branches"

  npm install

  grunt moveDocumentationWebsite

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
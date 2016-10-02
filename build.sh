#!/bin/bash
set -e

echo "Starting grunt tests";
grunt testBuild
echo "Finished grunt tests";

echo "Starting unit tests";
npm test
echo "Finished unit tests";

if [ "$TRAVIS_BRANCH" = "master" ]; then
  echo "Changing branches";
  grunt website

  git config user.name "Travis CI"
  git config user.email "awsdfgvhbjn@gmail.com"
  git config --global push.default simple

  git remote set-branches --add origin gh-pages
  git fetch

  git reset --hard
  git checkout -b gh-pages --track origin/gh-pages
  echo "Changed branches";

  npm install

  ls

  grunt moveWebsite

  set +e
  git diff-index --quiet HEAD

  changes=$?;
  if [ $changes -eq 0 ] ; then #No changes
    echo "No changes to the website were made";
    exit 0;
  else
    echo "Changes occurred";
    git diff;
  fi

  echo "Committing changes";
  git add . &> /dev/null
  git commit -m "Deploy to Github Pages" --quiet 
  echo "Committed changes";

  echo "Pushing changes";
  if [ $? -ne 0 ] ; then #Something went wrong committing, don't push
    echo "Faulty commit, abort push";
    exit 0;
  fi

  git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" --quiet 
  echo "Pushed github pages to branch";
fi
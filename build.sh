#!/bin/bash
set -e

http-server -p 1234 . -s &

echo "Making sure all typescript files have been compiled";
ls app test -R | grep -G '\.ts$' | grep -v -G '\.d\.ts$' | while read line
do
  #Find file's full path
  FILE=$(echo "$line" | find app test -name $line)

  #Get compile target
  FIRSTLINE=$(head -n 1 $FILE)
  COMPILE_TARGET=$(echo $FIRSTLINE | grep -o -G '=[a-zA-Z0-9]*')
  COMPILE_TARGET=$(echo $COMPILE_TARGET | rev | cut -c 2- | rev)

  COMPILE_TARGET_LENGTH=$(echo COMPILE_TARGET | wc --chars)
  if [ COMPILE_TARGET_LENGTH = 1 ]; then
    # default to ES3
    COMPILE_TARGET="ES3"
  fi

  #Compile
  echo "Compiling target $COMPILE_TARGET"
  tsc --target $COMPILE_TARGET $FILE
done

CHANGED_FILES=$(git status | grep 'modified:' | wc -l)
if [ CHANGED_FILES > 0 ] || [ "$TRAVIS_BRANCH" = "master" ]; then
  git config user.name "Travis CI"
  git config user.email "awsdfgvhbjn@gmail.com"
  git config --global push.default simple

  set +e
  git diff-index --quiet HEAD

  echo "Committing changes";
  git add -A .
  git commit -m "Compile typescript files" --quiet
  echo "Committed changes";

  echo "Pushing changes";
  if [ $? -ne 0 ] ; then #Something went wrong committing, don't push
    echo "Faulty commit, abort push";
    exit 0;
  fi

  git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" --force --quiet
  echo "Pushed compiled typescript"

  set -e
fi

echo "Starting build tests";
grunt testBuild
echo "Finished build tests";

echo "Starting unit tests";
mocha test/test.js
echo "Finished unit tests";

echo "Starting UI tests";
mocha test/UITest.js
echo "Finished UI tests";

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
#!/bin/bash
function logStart {
  echo -e "\e[1m \e[34m $1";
}

function logSuccess {
  echo -e "\e[1m \e[32m $1";
}

function logLog {
  echo -e "\e[1m \e[33m $1";
}

set -e

cd "Custom Right-Click Menu"

logStart "Starting grunt tests";
grunt test
logSuccess "Finished grunt tests";

logStart "Changing branches";
grunt website

git config user.name "Travis CI"
git config user.email "awsdfgvhbjn@gmail.com"
git config --global push.default simple

git remote set-branches --add origin gh-pages
git fetch

git reset --hard
git checkout -b gh-pages --track origin/gh-pages
logSuccess "Changed branches";

npm install

grunt moveWebsite
cd ../

set +e
git diff-index --quiet HEAD

changes=$?;
if [ $changes -eq 0 ] ; then #No changes
  logLog "No changes to the website were made";
  exit 0;
else
  logLog "Changes occurred";
  git diff;
fi

logStart "Committing changes";
git add . --quiet
git commit -m "Deploy to Github Pages" --quiet
logSuccess "Committed changes";

logStart "Pushing changes";
if [ $? -ne 0 ] ; then #Something went wrong committing, don't push
  logLog "Faulty commit, abort push";
  exit 0;
fi

git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" --quiet 
logSuccess "Pushed github pages to branch";
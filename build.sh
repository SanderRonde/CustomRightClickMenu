set -e

cd "Custom Right-Click Menu"

printf "\e[1m \e[34mStarting grunt tests\n";
grunt test
printf "\e[1m \e[32mFinished grunt tests\n";

logStart "Changing branches";
grunt website

git config user.name "Travis CI"
git config user.email "awsdfgvhbjn@gmail.com"
git config --global push.default simple

git remote set-branches --add origin gh-pages
git fetch

git reset --hard
git checkout -b gh-pages --track origin/gh-pages
printf "\e[1m \e[32mChanged branches\n";

npm install

grunt moveWebsite
cd ../

set +e
git diff-index --quiet HEAD

changes=$?;
if [ $changes -eq 0 ] ; then #No changes
  printf "\e[1m \e[33mNo changes to the website were made\n";
  exit 0;
else
  printf "\e[1m \e[33mChanges occurred\n";
  git diff;
fi

printf "\e[1m \e[34mCommitting changes\n";
git add . --quiet
git commit -m "Deploy to Github Pages" --quiet
printf "\e[1m \e[32mCommitted changes\n";

printf "\e[1m \e[34mPushing changes\n";
if [ $? -ne 0 ] ; then #Something went wrong committing, don't push
  printf "\e[1m \e[33mFaulty commit, abort push\n";
  exit 0;
fi

git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" --quiet 
printf "\e[1m \e[32mPushed github pages to branch\n";
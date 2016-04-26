set -e

cd "Custom Right-Click Menu"

grunt test
grunt website

git config user.name "Travis CI"
git config user.email "awsdfgvhbjn@gmail.com"

git remote set-branches --add origin gh-pages
git fetch

git reset --hard
git checkout -b gh-pages --track origin/gh-pages

npm install

grunt moveWebsite
cd ../

set +e
git diff-index --quiet HEAD

changes=$?;
echo $changes;
if [ $changes -eq 0 ] ; then #No changes
  echo "No changes to the website were made";
  exit 0;
else
  echo "Changes occurred";
fi

git add .
git commit -m "Deploy to Github Pages"

echo "Git commit exit code:";
echo $?;
if [ $? -ne 0 ] ; then #Something went wrong committing, don't push
  echo "Faulty commit, abort push";
  exit 0;
fi

git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" 
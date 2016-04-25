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

ls
npm install

grunt moveWebsite
cd ../

set +e
git diff-index --quiet HEAD

echo "Status code";
echo $?;
changes=$?;
echo $changes;
if [ $changes ]; then
  echo "true";
else
  echo "false";
fi
if [ $changes == 0 ] || [ "$changes" == 0 ] || [ $changes == "0" ] || [ "$changes" == "0" ] ; then #No changes
  echo "No changes to the website were made";
  exit 0;
else
  echo "Changes occurred";
fi

set -e;

git add .
git commit -m "Deploy to Github Pages"
git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" 

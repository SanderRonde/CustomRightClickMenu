yarn build

echo "Changing branches"

echo "Pushing to gh-pages" && echo -en "travis_fold:start:gh_pages\\r"
gulp documentationWebsite
gulp moveFavicon
gulp demoWebsite
gulp changeGitIgnore

git config user.name "Travis CI"
git config user.email "builds@travis-ci.org"
git config --global push.default simple

git remote set-branches --add origin gh-pages
git fetch

git reset --hard
git checkout -b gh-pages
echo "Changed branches"

yarn install

gulp compile
gulp removeBowerComponents
gulp copyJeckyllConfig
gulp changeGitIgnore

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
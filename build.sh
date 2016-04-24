set -e

cd "Custom Right-Click Menu"

grunt build
grunt cleanBuild
grunt extractDefs
grunt cleanBuild
grunt website

git config user.name "Travis CI"
git config user.email "awsdfgvhbjn@gmail.com"

git remote set-branches --add origin gh-pages
git fetch
git checkout -b gh-pages --track origin/gh-pages

npm install

grunt moveWebsite
cd ../
ls

git add .
git commit -m "Deploy to Github Pages"

git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" 
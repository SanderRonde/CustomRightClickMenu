set -e

git config user.name "Travis CI"
git config user.email "awsdfgvhbjn@gmail.com"

git checkout githubPages origin/githubPages

npm install

grunt copyWebsite

git add .
git commit -m "Deploy to Github Pages'

git push "https://${GITHUB_ACCESS_TOKEN}@github.com/SanderRonde/CustomRightClickMenu.git" 
echo "Running build" &&
grunt build &&
grunt cleanBuild &&
grunt extractDefs &&
grunt cleanBuild &&
grunt website &&
git checkout gh-pages &&
grunt moveWebsite &&
git commit -m "Updated documentation website" &&
push origin/gh-pages &&
git checkout master
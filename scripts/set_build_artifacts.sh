#!/bin/sh

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
	# Not set, skip this step
	echo "Skipping setting of build artifacts"
	exit 0
fi

# Check if the enviroment variables are defined
if [ -z "$ARTIFACT_STORE" ]; then
	# Not set, skip this step
	echo "Skipping setting of build artifacts"
	exit 0
fi

if [ -z "$ARTIFACT_PW" ]; then
	# Not set, skip this step
	echo "Skipping setting of build artifacts"
	exit 0
fi

echo "Creating zip files"
gulp zipArtifacts

REMOTE_PATH="~/artifacts/crm/$TRAVIS_COMMIT"

echo "Creating current commit's directory"
sshpass -p "$ARTIFACT_PW" ssh $ARTIFACT_STORE "mkdir -p $REMOTE_PATH"

echo "Copying build.zip file"
sshpass -p "$ARTIFACT_PW" scp ./artifacts.build.zip $ARTIFACT_STORE:$REMOTE_PATH/artifacts.build.zip
echo "Copying dist.zip file"
sshpass -p "$ARTIFACT_PW" scp ./artifacts.dist.zip $ARTIFACT_STORE:$REMOTE_PATH/artifacts.dist.zip

echo "Successfully uploaded build artifacts"
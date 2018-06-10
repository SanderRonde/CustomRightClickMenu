#!/bin/sh

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
	# Not set, skip this step
	echo "Skipping setting of build artifacts"
	exit 1
fi

# Check if the enviroment variables are defined
if [ -z "$ARTIFACT_STORE" ]; then
	# Not set, skip this step
	echo "Skipping setting of build artifacts"
	exit 1
fi

# Check if the enviroment variables are defined
if [ -z "$ARTIFACT_SERVER" ]; then
	# Not set, skip this step
	echo "Skipping setting of build artifacts"
	exit 1
fi

echo "Creating zip files"
gulp zipArtifacts || exit $?

REMOTE_PATH="~/artifacts/crm/$TRAVIS_COMMIT"

echo "Adding to known hosts"
ssh-keyscan -t rsa -H $ARTIFACT_SERVER >> ~/.ssh/known_hosts || exit $?

echo "Creating current commit's directory ($REMOTE_PATH)"
ssh -i scripts/id_rsa $ARTIFACT_STORE "mkdir -p $REMOTE_PATH" || exit $?

echo "Copying build.zip file to $REMOTE_PATH/artifacts.build.zip"
scp -i scripts/id_rsa ./artifacts.build.zip $ARTIFACT_STORE:$REMOTE_PATH/artifacts.build.zip || exit $?
echo "Copying dist.zip file to $REMOTE_PATH/artifacts.dist.zip"
scp -i scripts/id_rsa ./artifacts.dist.zip $ARTIFACT_STORE:$REMOTE_PATH/artifacts.dist.zip || exit $?

echo "Successfully uploaded build artifacts"
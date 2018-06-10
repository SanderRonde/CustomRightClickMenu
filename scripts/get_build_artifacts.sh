#!/bin/sh

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
	# Not set, skip this step
	echo "Skipping getting of build artifacts"
	exit 1
fi

# Check if the enviroment variables are defined
if [ -z "$ARTIFACT_STORE" ]; then
	# Not set, skip this step
	echo "Skipping getting of build artifacts"
	exit 1
fi

# Check if the enviroment variables are defined
if [ -z "$ARTIFACT_SERVER" ]; then
	# Not set, skip this step
	echo "Skipping setting of build artifacts"
	exit 1
fi

REMOTE_PATH="~/artifacts/crm/$TRAVIS_COMMIT"

echo "Adding to known hosts"
ssh-keyscan -t rsa -H $ARTIFACT_SERVER >> ~/.ssh/known_hosts || exit $?

echo "Changing permissions"
chmod 700 scripts/id_rsa || exit $?

echo "Adding IP to known hosts"
ssh -q -i scripts/id_rsa $ARTIFACT_STORE "echo done" > /dev/null || exit $?

echo "Downloading build.zip file from $REMOTE_PATH/artifacts.build.zip"
scp -i scripts/id_rsa $ARTIFACT_STORE:$REMOTE_PATH/artifacts.build.zip ./artifacts.build.zip || exit $?
echo "Downloading dist.zip file from $REMOTE_PATH/artifacts.dist.zip"
scp -i scripts/id_rsa $ARTIFACT_STORE:$REMOTE_PATH/artifacts.dist.zip ./artifacts.dist.zip || exit $?

echo "Unzipping files"
gulp unzipArtifacts || exit $?

echo "Successfully downloaded build artifacts"
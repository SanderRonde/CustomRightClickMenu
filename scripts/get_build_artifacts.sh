#!/bin/sh

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
	# Not set, skip this step
	echo "Skipping getting of build artifacts"
	exit 0
fi

# Check if the enviroment variables are defined
if [ -z "$ARTIFACT_STORE" ]; then
	# Not set, skip this step
	echo "Skipping getting of build artifacts"
	exit 1
fi

if [ -z "$ARTIFACT_PW" ]; then
	# Not set, skip this step
	echo "Skipping getting of build artifacts"
	exit 1
fi

REMOTE_PATH="~/artifacts/crm/$TRAVIS_COMMIT"

echo "Downloading build.zip file"
sshpass -p "$ARTIFACT_PW" scp $ARTIFACT_STORE:$REMOTE_PATH/artifacts.build.zip ./artifacts.build.zip || exit $?
echo "Downloading dist.zip file"
sshpass -p "$ARTIFACT_PW" scp $ARTIFACT_STORE:$REMOTE_PATH/artifacts.dist.zip ./artifacts.dist.zip || exit $?

echo "Unzipping files"
gulp unzipArtifacts || exit $?

echo "Successfully downloaded build artifacts"
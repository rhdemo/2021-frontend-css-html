#!/usr/bin/env bash
printf "\n\n######## game-ui build ########\n"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

IMAGE_REPOSITORY=${GAME_UI_IMAGE_REPOSITORY:-quay.io/redhatdemo/2021-game-ui:latest}
SOURCE_REPOSITORY_URL=${SOURCE_REPOSITORY_URL:-git@github.com:rhdemo/2021-frontend-css-html.git}
SOURCE_REPOSITORY_REF=${SOURCE_REPOSITORY_REF:-master}

echo "Building ${GAME_UI_IMAGE_REPOSITORY}/game-ui from ${SOURCE_REPOSITORY_URL} on ${SOURCE_REPOSITORY_REF}"

cd ${DIR}/..
rm -rf build
yarn install
yarn build

# Use the local build/ folder as the source
s2i build ./build registry.access.redhat.com/ubi8/nginx-118 ${IMAGE_REPOSITORY}

#!/usr/bin/env bash
printf "\n\n######## game-ui push ########\n"

IMAGE_REPOSITORY=${GAME_UI_IMAGE_REPOSITORY:-quay.io/redhatdemo/2021-game-ui:latest}

echo "Pushing ${IMAGE_REPOSITORY}"
docker push ${IMAGE_REPOSITORY}




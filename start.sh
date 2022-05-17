#!/bin/bash

if [ -z "$1" ]; then
	screen -L -Logfile logs/$(date +%Y%m%d-%H:%M).log -dmS ttt-discord-mute -- "$0" xxx
else
	node server/index.js
fi

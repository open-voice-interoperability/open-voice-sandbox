#!/bin/bash

osascript -e 'tell application "Terminal"
    set background color of first window to {65280, 41472, 19200, 0} -- Set background color to blue (RGB values: 0, 0, 65535)
end tell'

cd -- "$(dirname "$BASH_SOURCE")"
python samLLM.py


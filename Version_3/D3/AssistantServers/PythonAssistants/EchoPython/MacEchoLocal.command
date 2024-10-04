#!/bin/bash
osascript -e 'tell application "Terminal"
    set background color of first window to {65025, 65025, 38375, 0} -- Set background color to yellow (RGB values: 0, 0, 65535)
end tell'
cd -- "$(dirname "$BASH_SOURCE")"
python3 local.py


#!/bin/bash
osascript -e 'tell application "Terminal"
    set background color of first window to {18432, 55040, 32512, 0} -- Set background color to blue (RGB values: 0, 0, 65535)
end tell'
cd -- "$(dirname "$BASH_SOURCE")"
python3 sam.py


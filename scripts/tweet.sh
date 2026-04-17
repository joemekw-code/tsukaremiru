#!/bin/bash
# Tweet via browser automation (no API key needed)
# Uses the default browser's existing X/Twitter session
# Posts via x.com/intent/tweet URL + AppleScript keyboard simulation

TWEET_TEXT="$1"

if [ -z "$TWEET_TEXT" ]; then
  echo "Usage: ./tweet.sh 'tweet text'"
  exit 1
fi

# URL-encode the text
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$TWEET_TEXT'''))")

# Open the tweet intent URL
open "https://x.com/intent/post?text=${ENCODED}"

# Wait for page to load
sleep 4

# Press Cmd+Enter to submit the tweet (X's keyboard shortcut)
osascript -e '
tell application "System Events"
  keystroke return using command down
end tell
'

echo "Tweet posted (or compose window opened)"

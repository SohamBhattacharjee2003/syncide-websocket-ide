#!/bin/bash

# Script to test video call on same device
# Opens two Chrome windows with different profiles

echo "🚀 Starting SyncIDE Video Call Test..."
echo ""

# Get the room ID or generate one
ROOM_ID=${1:-"TEST123"}
URL="http://localhost:5173/editor/$ROOM_ID"

echo "📍 Room ID: $ROOM_ID"
echo "🔗 URL: $URL"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ Dev server is not running!"
    echo "Please run: npm run dev"
    exit 1
fi

echo "✅ Dev server is running"
echo ""

# Open first window (normal Chrome)
echo "🌐 Opening Window 1 (Chrome - Normal Profile)..."
open -na "Google Chrome" --args --new-window "$URL"
sleep 2

# Open second window (Chrome Incognito)
echo "🌐 Opening Window 2 (Chrome - Incognito)..."
open -na "Google Chrome" --args --incognito "$URL"

echo ""
echo "✅ Both windows opened!"
echo ""
echo "📝 Next steps:"
echo "  1. Window 1: Join as 'Temp'"
echo "  2. Window 2: Join as 'Pics'"
echo "  3. Both should see each other in video call"
echo ""
echo "🔄 To test again: ./test-video-call.sh $ROOM_ID"

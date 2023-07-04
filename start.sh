#!/bin/bash -l

cd /home/bago/runebaseinfo-ui
/usr/bin/screen -X -S ui quit
/usr/bin/screen -dmS ui
/usr/bin/screen -S ui -p 0 -X stuff "bash $(printf \\r)"
sleep 10
/usr/bin/screen -S ui -p 0 -X stuff "nvm use 12 $(printf \\r)"
sleep 10
/usr/bin/screen -S ui -p 0 -X stuff "npm start $(printf \\r)"

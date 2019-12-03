#!/bin/sh
unameOut="$(uname)"
echo $unameOut
if [ $unameOut == "Darwin" ]; then
    $(pwd)/app/static/assets/./perseusMac simtop $(pwd)/app/static/assets/grad.txt $(pwd)/app/static/assets/grad
elif [ $unameOut == "Linux" ]; then
    $(pwd)/app/static/assets/./perseusLin simtop $(pwd)/app/static/assets/grad.txt $(pwd)/app/static/assets/grad
fi

#! /bin/sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 <command to execute>"
    exit 1
fi

for dir in ./*; do (cd "$dir" && echo "$1 $line"|sh); done
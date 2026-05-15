#!/bin/bash
trap "" SIGHUP SIGTERM
cd /home/z/my-project
exec npx next dev -p 3000

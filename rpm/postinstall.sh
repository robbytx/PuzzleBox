#!/bin/sh
if [ $1 -eq 1 ]; then
  HOME=$(getent passwd "puzzlebox" | awk -v FS=: '{print $6}')
  sudo -u "puzzlebox" bash -c "cd ${HOME}; npm install"

  /sbin/chkconfig --add puzzlebox
fi
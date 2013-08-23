#!/bin/sh
if [ $1 -eq 1 ]; then
  HOME=$(getent passwd "puzzlebox" | awk -v FS=: '{print $6}')
  su -c "/bin/bash -c 'cd ${HOME}; npm install'" puzzlebox

  /sbin/chkconfig --add puzzlebox
fi
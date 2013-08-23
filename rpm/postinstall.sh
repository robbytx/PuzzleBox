#!/bin/sh
if [ $1 -eq 1 ]; then
  cd $(getent passwd "puzzlebox" | awk -v FS=: '{print $6}')
  npm install
  chown -R puzzlebox:puzzlebox node_modules

  /sbin/chkconfig --add puzzlebox
fi
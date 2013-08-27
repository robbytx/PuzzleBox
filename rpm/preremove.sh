#!/bin/sh
if [ $1 -eq 0 ]; then
  /sbin/service puzzlebox stop >/dev/null 2>&1
  /sbin/chkconfig --del puzzlebox
fi
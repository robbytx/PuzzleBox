#!/bin/sh
getent group puzzlebox >/dev/null || groupadd -r puzzlebox
getent passwd puzzlebox >/dev/null || useradd -r -g puzzlebox -d /usr/lib/puzzlebox -s /sbin/nologin puzzlebox
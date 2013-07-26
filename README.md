PuzzleBox
=========

Coding puzzles for public enjoyment

Prereqs
-------

* Node 0.8+
* Redis
* Mongodb
* Foreman (Install via [Heroku Toolbelt](https://toolbelt.heroku.com/) or [Standalone](https://github.com/ddollar/foreman))
* Get .env file emailed to you from Mikey

Installation & Running
--------

1. Install requirements with `npm install`
2. Startup mongodb with `mongod --config mongod.conf`
3. Startup redis with `redis-server redis.conf`
4. Startup app with `foreman start -f DevProcfile`

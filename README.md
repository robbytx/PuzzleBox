# PuzzleBox
Coding puzzles for public enjoyment


## Installation & Running

### Option 1, running inside of a Vagrant virtual machine:

#### Requirements
* Vagrant 1.2+

#### Instructions
1. Run ./dev-server
2. When finished hit `ctrl-c` twice
3. Run `vagrant destroy` to clean up the VM


### Option 2, running in a node environment local to your mac:

#### Requirements
* Node 0.8+
* Mongodb
* Foreman ([GitHub](https://github.com/ddollar/foreman), [Heroku Toolbelt](https://toolbelt.heroku.com/))

#### Instructions
1. Install requirements with `npm install`
2. Startup mongodb with `mongod --config mongod.conf`
3. Specify necessary environment variables
4. Startup app with `foreman start -f DevProcfile`


## Environment Variables
<table>
  <tr>
    <td>NODE_ENV</td>
    <td>development or production</td>
    <td>The environment that you're running in</td>
  </tr>
  <tr>
    <td>HOST_PORT</td>
    <td>url</td>
    <td>The URL that the application is running on (for email links)</td>
  </tr>
  <tr>
    <td>HASH_SECRET</td>
    <td>some string</td>
    <td>Salt used for session tokens and user ids</td>
  </tr>
</table>

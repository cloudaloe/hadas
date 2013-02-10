# Hadas - an anti-IDE 

Takes care of your project reloading, once you change your code. Be agile. <br/>
It recycles both the application server side and any browser windows connected to it, every once your project changes (e.g. when you save or move a file).
An html user interface governs enabling and disabling this automatic recycling, while also serving its stdout/err all in one place. To round it up you may also recycle your project by the click of a button on the [user interface]
(https://github.com/cloudaloe/hadas/blob/master/screenshots/hadas5.png).

## Setup effort summary:
Setting up isn't that hard, but for you being able to assess the effort upfront... here it goes: <br/>

Installation of prerequisite:   	2 <br/>
Configuration parameters to set:    2 - 5 <br/>
Moving around files:      		   2 (for your application's browser side code, if you have any) <br/>
Code change to your project:     1 (for your application's browser side code, if you have any) <br/>

## Setup

1. Download this repo, extract and locate to it
2. [Configure](https://github.com/cloudaloe/hadas/wiki/config.json) `config/config.json` to monitor your project 
3. Make sure you have [node.js] (http://nodejs.org/) installed
4. Install the prerequisite node modules by running: `install.bat`
5. In your project's client-side code directory, <br/> 
   copy the following files into a subdirectory named /lib:
   `hadasClientListener.js`
   `socket.io.js`
6. In your project's html, add the following line, after jquery <br/>
   `<script type='text/javascript' src='./lib/hadasClientListener.js'></script>` <br/>
   It assumes your html first loads jquery

## Usage after setup

Start Hadas by locating to the root directory and running: `node server.js` (or on Windows, run `server.bat`), <br/>
then access the UI by opening the shown address. 

## Stability status

This is work in progress. If you run into issues, or wish to have a modification, file an issue on the issues tab.

## Welcome contributions

This is a user experience centric tool, any contribution should maintain or improve a cool UI and configurability coolness. <br/>
Post your ideas in the Wiki or fork / take away pieces.

## Inspiration and acknowledgements

This was inspired by a general disenchantment with how IDE's are designed. <br/>
I found no existing project doing this, so I made it. Lightly inspired by [Light Table] (http://www.chris-granger.com/2012/04/12/light-table---a-new-ide-concept/). <br/> The code was partly inspired by [Andrew Davey's vogue code] (https://github.com/andrewdavey/vogue). 

Under the hood:
* Node.js
* jQuery
* jQuery UI
* Knockout.js
* Node.js nconf module
* Node.js optimist module
* Node.js node-static module
* Node.js socket.io module

## License

[Licensed under the MIT License] (http://opensource.org/licenses/mit-license.php).

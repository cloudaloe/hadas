# Hadas - the anti-IDE 

Takes care of your project reloading, once you change your code. Be agile.
It recycles both the node side and your open browser side, once your project changes (e.g. when you save or move a file).
An html user interface governs the enabling and disabling of this automatic recycling, as well as showing whether the project 
is running and serving its node console.

## Setup

1. Download the code
2. Configure config/config.json to monitor your project 
3. In your project's client-side code directory, <br/> 
   copy the following files into /lib:
   `hadasClientListener.js`
   `socket.io.js`
4. In your project's html, add the following line, after jquery
   `<script type='text/javascript' src='./lib/hadasClientListener.js'></script>` <br/>
   It assumes your html first loads jquery

#### Current setup effort summary:
Configuration parameters to set: 	2 - 5 <br/>
Moving around files:				2 <br/>
Code change to your project:		1 

## Usage

Start Hadas by locating to the root directory and run: <br/> 
`node hadas.js` (or on Windows, run hadas.bat) <br/>
The UI will then become available

## License

Distributed under the Eclipse Public License 1.0
Copyright © 2012 Matan Safriel.

## Stability status

This is work in progress

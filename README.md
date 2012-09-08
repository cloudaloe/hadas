# Hadas - the anti-IDE 

Takes care of your project reloading, once you change your code. Be agile.
It recycles both the node side and your open browser side, once your project changes (e.g. when you save or move a file).
An html user interface governs the enabling and disabling of this automatic recycling, as well as showing whether the project 
is running and serving its node console.

## Setup

1. Download the code
2. Configure config/config.json to monitor your project 
3. In your project's client-side code directory, copy the following files into /lib:
   <code>hadasClientListener.js</code>
   <code>socket.io.js</code>
4. In your project's html, add the following line, after jquery.
   <code><script type='text/javascript' src='./lib/hadasClientListener.js'></script></code>
   It assumes your html first loads jquery.

#### Setup effort summary:
Configuration parameters to set: 	2 - 5
Moving around files:				2
Code change to your project:		1

## Usage

Start Hadas by locating to the root directory and run: <code>node hadas.js</code> (or on Windows, run hadas.bat).
The UI will then become available.

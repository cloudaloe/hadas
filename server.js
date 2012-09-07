//var watch = require('./watch.js');

var argv = require('optimist').argv;
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;		
var tests = new Object();
tests.outPath = 'tests\\out\\';
tests.inPath = 'tests\\in\\';
var files;
var runner = null;
var watchActive = false;

var nconf = require('nconf'); 
nconf.file({ file: 'config/config.json'});
var agentIntervalSeconds = nconf.get('agentIntervalSeconds');
var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
io.set('log level', 2); 
var invocationLoop;

//
// setup configuration retreival and tests inits.
// 
function _tests()
{	
	// set the tests to run on a constant input project root included in this project.
	console.log('running in test mode...');
	projectRoot = 'tests\\in\\source';
	if (!(tests.watch = fs.openSync(tests.outPath + 'watch.out','w')))
		console.log('failed opening test output file ' + tests.outPath);
}

nconf.argv()
     .env()
     .file({ file: 'config/config.json' });

var projectRoot 	= 	nconf.get('projectRoot');
var doNotWatchDirs 	= 	nconf.get('doNotWatchDirs');
var run 			= 	nconf.get('run');	
	
if (argv.test) 
	_tests();
else
	console.log('running in regular mode...');
	
if (watchActive)
	console.log('watch active');
else
	console.log('watch inactive');

	
//var cipher = crypto.createCipher('aes256', 'my-password');
var static = require('node-static'); 
staticContentServer = new static.Server('./client', { cache: false });

//
// Must add thorough error handling here
//
var port = nconf.get('server:port');
app.listen(port);

io.sockets.on('connection', function (socket) {
	socket.emit('agentStatus', (runner != null));
	socket.emit('watchStatus', watchActive);	
	socket.on('runNow', function (clientObject) {
		if (runner) 
		{ 
			console.log('Run request received from UI, but the node side is already running.') 
		}
		else
		{
			console.log("Run request received from UI. Params: " + clientObject.runParams + ".");
			spawnPlus();
		}
	});
	
	socket.on('pause', function (clientObject) {
		console.log('Request to pause the recycle watch received from the UI.');
		console.log('Pausing the recycle watch.');
		watchActive = false;
	});
	socket.on('resume', function (clientObject) {
		console.log('Request to enable the recycle watch received from the UI.');
		console.log('Enabling the recycle watch.');		
		watchActive = true;		
	});
});

//try later to incorporate this library
//var nodetime = require('nodetime');
//nodetime.profile();

console.log('Hadas started - watch its UI on http://localhost:' + port + '.');
		
function handler(request, response) {
	console.log('Received request - method: ' + request.method + ' url: ' + request.url);
	if (request.method == 'GET') 
		switch(request.url)
		{
			//
			// Consider adding: nice error page for not-found files.
			// 					currently returns status 404 and a blank page for not-found files
			//
			case '/': 
				// serves the main html page to the browser
				request.url += 'clientPage.html';
				staticContentServer.serve(request, response);
				break;
			default:
				// this is for when the html page causes the browser to locally load css and js libraries
				staticContentServer.serve(request, response);
			/*
			default:
				response.writeHead(200, {'Content-Type': 'text/plain'});	
				response.end('Oops, the requested page was not found....');	
			*/
		}	
}

function spawnPlus()
{
	console.log('starting the node side...');
	runner = spawn('node',[run.server], { cwd: projectRoot});
	runner.stdout.on('data', function (data) { io.sockets.emit('agentStdout', String(data)) });	
	runner.stderr.on('data', function (data) { io.sockets.emit('agentStderr', String(data)) });	
	io.sockets.emit('agentStatus', true);
	
	console.log('...started node, pid is ' + runner.pid);
	runner.on('exit', function(code, signal) {
		// the kill signal brings us here assuming it caused the spawned process to exit
		console.log('...node side stopped (pid = ' + this.pid + ', exit code = ' + code, ', signal = ' + signal +')');
		io.sockets.emit('agentStatus', false);
		spawnPlus();
	})
}

	
function recycle()
{
	console.log('stopping the node side...');	
	if (runner)
		runner.kill();
	else
		spawnPlus();
}
	
function changeDetected(event, filename)
{
	console.log('fs.watch event: ' + event + ' on file ' + (filename || 'unknown. Probably a watched file has been deleted.'));
	if (watchActive) 
	{
		console.log('recycling the node side');	
		recycle();
	}
	else 
		console.log('watch paused - no action taken.');		
}
	
function watch(directory)
{
			var fullPath = directory;
			
			var _type = fs.statSync(directory);
			if (_type.isDirectory())
			{
				if (doNotWatchDirs.indexOf(path.basename(directory)) == -1)
				{
					fs.watch(directory, {persistent: true, interval: 100}, changeDetected);
					if (argv.test) 
						fs.writeSync(tests.watch, 'watching directory: ' + directory + '\n');																
					containedEntities = fs.readdirSync(directory)
					containedEntities.forEach(function(element, index, array) {
						array[index] = path.join(directory, array[index]);
					});					
					
					//
					// as long as relying on fs.watch for watching changes:
					// fs.watch will only watch files in the root dir provided to it, 
					// and subdirectories as a whole. it will not however watch changes 
					// inside files included in subdirectories. 
					// hence we need to recursively add all subdirectories for full watching.
					//
					containedEntities.forEach(watch);
				}
				else
					if (argv.test) 
					fs.writeSync(tests.watch, 'not watching directory: ' + fullPath + '\n');	
			}
			else if (_type.isFile())
			{
				/*if (fullPath.substr(-3) == '.js')
				{
					var sourceFile = new Object();
					sourceFile.file = fullPath;
					
					//data = readFile(fullPath);
					if (argv.test)
						fs.writeSync(tests.watch, fullPath + '\n');					
				}
				else
					console.log('info: ' + fullPath + ' contents ignored');*/
			}
			else
			{
				throw "Object not detected as directory nor file";
			}
}

watch(projectRoot);
//var watch = require('./watch.js');
var argv = require('optimist').argv;
var configFile = 'config/config.json';
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;		
var tests = new Object();
tests.outPath = 'tests\\out\\';
tests.inPath = 'tests\\in\\';
var files;
var runner = null;
var watchActive = { nodeSide: true,
					clientSide: true }
var projectClients = new Array();

var nconf = require('nconf'); 
nconf.file({ file: configFile});
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

//nconf.file({ file: 'config/config.json' });

var projectRoot 	= 	nconf.get('projectRoot');
var doNotWatchDirs 	= 	nconf.get('doNotWatchDirs');
var run 			= 	nconf.get('run');	
	
if (argv.test) 
	_tests();
else
	console.log('running in regular mode...');
	
if (watchActive.nodeSide)
	console.log('watch active');
else
	console.log('watch inactive');

console.log('configuration is taken from ' + path.join(__dirname, configFile));
	
var static = require('node-static'); 
staticContentServer = new static.Server('./UI', { cache: false });

//
// Should add thorough error handling here
//
var hostname = nconf.get('server:hostname'); // not used yet
var port = nconf.get('server:port');
app.listen(port);

io.sockets.on('connection', function (socket) {
	// 
	// for now, we send all messages to both client types (Hadas client and actual project client)
	// obviously that has to be changed into cleanly communicating with each of the two types
	// each type has to identify it's semantic type as it first connects
	//
	
	socket.emit('agentStatus', (runner != null));
	socket.emit('watchStatus', watchActive.nodeSide);	
		
	socket.on('runNow', function (clientObject) {
	
		console.log("Run/recycle request received from UI. Params: " + clientObject.runParams);
		//console.log('runner ', runner);
		if (runner) 
		{ 
			console.log('about to recycle the node side') 
			recycleNode();
		}
		else
		{
			spawnPlus();
		}
		
		console.log('recycling the client side');	
		io.sockets.emit('clientRecycle', true);
	});
	
	socket.on('pause', function (clientObject) {
		console.log('request to pause the recycle watch received from the UI');
		console.log('pausing the recycle watch');
		watchActive.nodeSide = false;
		watchActive.clientSide = false;		
	});
	socket.on('resume', function (clientObject) {
		console.log('request to enable the recycle watch received from the UI');
		console.log('enabling the recycle watch');		
		watchActive.nodeSide = true;		
		watchActive.clientSide = true;				
	});
	socket.on('projectClient', function (clientObject) {
		console.log('project client side has registered');
		projectClients.push(clientObject); 
	});	
});

console.log('Hadas started - its UI served at http://localhost:' + port + '/hadas.html');
		
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
				request.url += 'hadas.html';
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
	runner = spawn('node',[run.node], { cwd: projectRoot});
	runner.stdout.on('data', function (data) { io.sockets.emit('agentStdout', String(data)) });	
	runner.stderr.on('data', function (data) { io.sockets.emit('agentStderr', String(data)) });	
	io.sockets.emit('agentStatus', true);
	io.sockets.emit('agentStarted');	
	
	console.log('...started node, pid is ' + runner.pid);
	runner.on('exit', function(code, signal) {
		// the kill signal brings us here assuming it caused the spawned process to exit
		if (code === null)
		{
			console.log('...node side stopped (pid = ' + this.pid + ', exit code = ' + code, ', signal = ' + signal +')');
			io.sockets.emit('agentStatus', false);			
			spawnPlus();
		}
		else
		{
			console.log('...node side terminated with abnormal exit code (pid = ' + this.pid + ', exit code = ' + code, ', signal = ' + signal +')');
			console.log('due to its abnormal termination, the node side will not be automatically restarted now');
			io.sockets.emit('agentStatus', false);
			runner = null;
		}
	})
}
	
function recycleNode()
{
	console.log('stopping the node side...');	
	//debugger;
	if (runner)
		runner.kill();
	else
		spawnPlus();
}
	

function changeDetected(event, filename)
{
	//
	// Using just one listener for all fs.watch event callbacks, 
	// ignore any directory and file that match an ignore name
	// 
	if (doNotWatchDirs.indexOf(filename) == -1)
	{
		console.log('fs.watch event: ' + event + ' on file ' + (filename || 'unknown. Probably a watched file has been deleted'));
		if (watchActive.nodeSide) 
		{
			console.log('about to recycle the node side');	
			recycleNode();
		}
		else 
			console.log('watch paused for node side - no action taken');		
		
		//
		// this sequence assumes the server is up by the time the client refreshes,
		// as recycling the node side is synchronous
		//
		
		if (watchActive.clientSide)
		{
			console.log('recycling the client side');	
			io.sockets.emit('clientRecycle', true);
		}
		else 
			console.log('watch paused for client side - no action taken');		

	}
}
	
function watch(directory)
{
			var fullPath = directory;
			
			var _type = fs.statSync(directory);
			if (_type.isDirectory())
			{
				//
				// Using just one listener for all fs.watch event callbacks, 
				// ignore any directory and file that match an ignore name
				// 
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
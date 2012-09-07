var watch = require('./watch.js');
var nconf = require('nconf'); 
nconf.file({ file: 'config/config.json'});
var agentIntervalSeconds = nconf.get('agentIntervalSeconds');
var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
io.set('log level', 2); 
var invocationLoop;

//var cipher = crypto.createCipher('aes256', 'my-password');

var static = require('node-static'); 
staticContentServer = new static.Server('./client', { cache: false });

//
// Must add thorough error handling here
//
var port = nconf.get('server:port');
app.listen(port);

io.sockets.on('connection', function (socket) {
	socket.emit('agentStatus', agentRunning);
	socket.on('runNow', function (clientObject) {
		if (agentRunning) 
		{ 
			console.log('Request to invoke the agent received from client, but the agent is already running.') 
		}
		else
		{
			console.log("Request to invoke the agent received from client. Params: " + clientObject.runParams + ".");
			watch.spawnPlus();
		}
	});
	
	socket.on('pause', function (clientObject) {
		if (agentRunning)
		{
			console.log('Request to pause invocation loop received from client.');
			console.log('Pausing the invocation loop (this does not halt the agent run currently in progress).');
		}
		else
		{
			console.log('Request to pause invocation loop received from client.');
			console.log('Pausing the invocation loop.');
		}
		
		clearTimeout(invocationLoop);
	});
	socket.on('resume', function (clientObject) {
		console.log('Request to resume invocation loop received from client.');
	});
});

var agentRunning=false;

//try later to incorporate this library
//var nodetime = require('nodetime');
//nodetime.profile();

console.log('Uber Agent started - UI listening on http://127.0.0.1:' + port + '.');
		
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

//Watch(projectRoot);
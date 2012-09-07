var nconf = require('nconf');
var argv = require('optimist').argv;
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;		
var tests = new Object();
tests.outPath = 'tests\\out\\';
tests.inPath = 'tests\\in\\';
var files;
var runner = null;

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

exports.spawnPlus = function()
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
	if (!runner) // first time Hadas runs the project
		spawnPlus();
	else
	{
		console.log('stopping the node side...');	
		runner.kill();
	}
}
	
function changeDetected(event, filename)
{
	console.log('fs.watch event: ' + event + ' on file ' + (filename || 'unknown. Probably a watched file has been deleted.'));
	
	recycle();
}
	
exports.Watch = function(directory)
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
					containedEntities.forEach(Watch);
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

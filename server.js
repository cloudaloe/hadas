//var dataApi = require('./dataApi.js');
//require('./visualizer.js');
var nconf = require('nconf');
var argv = require('optimist').argv;
var fs = require('fs');
var tests = new Object();
tests.outPath = 'tests\\out\\';
tests.inPath = 'tests\\in\\';
var files;

//
// this function is a preparation.
// 
function _tests()
{	
	console.log('running in test mode...');
	projectRoot = 'tests\\in\\source';
	if (!(tests.functionDetectionOut = fs.openSync(tests.outPath + 'functionDetection.out','w')))
		console.log('failed opening test output file ' + tests.outPath);
}

nconf.argv()
     .env()
     .file({ file: 'config/config.json' });

var projectRoot = nconf.get('projectRoot');
	 
if (argv.test) 
	_tests();
else
	console.log('running in regular mode...');

function recurseDirectories(projectRoot)
{
	files = fs.readdirSync(projectRoot)
	files.forEach(function(file) {
			var path = projectRoot + "\\" + file;
			console.log('detected: ' + path);	
			var _type = fs.statSync(path);
			if (_type.isDirectory())
			{
				recurseDirectories(path);
			}
			else if (_type.isFile())
			{
				if (path.substr(-3) == '.js')
				{
					var sourceFile = new Object();
					sourceFile.file = path;
					
					//data = readFile(path);
					if (argv.test)
						fs.writeSync(tests.functionDetectionOut, path + '\n');
										
					//console.log('source file details (as JSON):');
					//console.log(JSON.stringify(sourceFile, null, 4))					
					//project.push(sourceFile);					
				}
				else
					console.log('info: ' + path + ' contents ignored');
			}
			else
			{
				throw "Object not detected as directory nor file";
			}
		});
}

recurseDirectories(projectRoot);
//console.log(tokens);
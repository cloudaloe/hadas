//var dataApi = require('./dataApi.js');
//require('./visualizer.js');
var argv = require('optimist').argv;
var fs = require('fs');
var tests = new Object();
tests.outPath = 'tests\\out\\';
tests.inPath = 'tests\\in\\';
var sourceRoot='source';
var files;

//
// this function is a preparation.
// 
function _tests()
{	
	console.log('running in test mode...');
	sourceRoot = 'tests\\in\\source';
	if (!(tests.functionDetectionOut = fs.openSync(tests.outPath + 'functionDetection.out','w')))
		console.log('failed opening test output file ' + tests.outPath);
}

if (argv.test) 
	_tests();
else
	console.log('running in regular mode...');

function recurseDirectories(sourceRoot)
{
	files = fs.readdirSync(sourceRoot)
	files.forEach(function(file) {
			var path = sourceRoot + "\\" + file;
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

recurseDirectories(sourceRoot);
//console.log(tokens);
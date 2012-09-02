//use strict;

require('./dataApi.js');
var argv = require('optimist').argv;
var fs = require('fs');
var tokens = '';
var files;
var sourceRoot='source';
var project = new Array();
var tests = new Object();
tests.outPath = 'tests\\out\\';
tests.inPath = 'tests\\in\\';

//
// this function is a preparation.
// it's not finished as it doesn't compare output to desired output yet.
// but the most part is already impelemented - namely places in the code that 
// produce the test data when argv.test is true.
//
function _tests()
{	
	console.log('running in test mode...');
	sourceRoot = 'tests\\in\\source';
	if (!(tests.functionDetectionOut = fs.openSync(tests.outPath + 'functionDetection.out','w')))
		console.log('failed opening test output file ' + tests.outPath);
	//
	// to add: on test mode, check that the test output is equal to the one 
	// 		   produced on a clean run over the test source folder,
	//		   and integrate with Jasmine or Mocha http://visionmedia.github.com/mocha/
	//
	//if (!(tests.functionDetectionIn = fs.openSync(tests.inPath + 'functionDetection.out','r')))
	//  console.log('failed opening test input file ' + tests.outPath);
}

if (argv.test) _tests();
else
	console.log('running in regular mode...');

// 
// Following parsing code from http://jsfiddle.net/polygonplanet/ZAX48/
//

var tokenize = function(sourceCode) {
  var result = new Object();
  result.functionsDefined = 0;
  result.tokenCount = 0;
  var functionTokens = new Array();  
  var RE = {
    TOKEN : new RegExp(
      '(' + '/[*][\\s\\S]*?[*]/' +                  // multiline comment
      '|' + '/{2,}[^\\r\\n]*(?:\\r\\n|\\r|\\n|)' +  // single line comment
      '|' + '"(?:\\\\[\\s\\S]|[^"\\r\\n\\\\])*"' +  // string literal
      '|' + "'(?:\\\\[\\s\\S]|[^'\\r\\n\\\\])*'" +  // string literal
      '|' + '(' + '^' +                             // (2) regexp literal prefix
            '|' + '[-!%&*+,/:;<=>?[{(^|~]' +
            ')' +
            '(?:' +
                '(' +    // (3) line break
                  '(?!' + '[\\r\\n])\\s+' +
                    '|' + '(?:\\r\\n|\\r|\\n)' +
                 ')' +
              '|' + '\\s*' +
            ')' +
            '(?:' +
              '(' +      // (4) regular expression literal
                  '(?:/(?![*])(?:\\\\.|[^/\\r\\n\\\\])+/)' +
                  '(?:[gimy]{0,4}|\\b)' +
              ')' +
              '(?=\\s*' +
                '(?:' + '(?!\\s*[/\\\\<>*+%`^"\'\\w$-])' +
                        '[^/\\\\<>*+%`^\'"@({[\\w$-]' +
                  '|' + '===?' +
                  '|' + '!==?' +
                  '|' + '[|][|]' +
                  '|' + '[&][&]' +
                  '|' + '/(?:[*]|/)' +
                  '|' + '[,.;:!?)}\\]\\r\\n]' +
                  '|' + '$' +
                ')' +
              ')' +
            ')' +
      '|' + '<(\\w+(?::\\w+|))\\b[^>]*>' +          // (5) e4x
            '(?:(?!</\\5>(?!\\s*[\'"]))[\\s\\S])*' +
            '</\\5>' +
      '|' + '<>[\\s\\S]*?</>' +                     // e4x
      '|' + '>>>=?|<<=|===|!==|>>=' +               // operators
      '|' + '[+][+](?=[+])|[-][-](?=[-])' +
      '|' + '[=!<>*+/&|^-]=' +
      '|' + '[&][&]|[|][|]|[+][+]|[-][-]|<<|>>' +
      '|' + '0(?:[xX][0-9a-fA-F]+|[0-7]+)' +        // number literal
      '|' + '\\d+(?:[.]\\d+)?(?:[eE][+-]?\\d+)?' +
      '|' + '[1-9]\\d*' +
      '|' + '[-+/%*=&|^~<>!?:,;@()\\\\[\\].{}]' +   // operator
      '|' + '(?:(?![\\r\\n])\\s)+' +                // white space
      '|' + '(?:\\r\\n|\\r|\\n)' +                  // nl
      '|' + '[^\\s+/%*=&|^~<>!?:,;@()\\\\[\\].{}\'"-]+' + // token
      ')',
      'g'
    ),
    LINEBREAK : /^(?:\r\n|\r|\n)/,
    NOTSPACE  : /[\S\r\n]/,
    COMMENTS  : /^\/{2,}[\s\S]*$|^\/[*][\s\S]*?[*]\/$/
  };

	//
	// extracts for all functions tokens, the name of the function being defined
	//
	function extractNamedFunctions(result)
	{
		
		function concat(tokens, endPos, beginningPosContent)
		{
			var section = new Array();
			var i = endPos;
			var found = false;
			for (i = endPos; (tokens[i] != beginningPosContent) && (i>=0); i-=1)
			{
				found = true;
				section.push(tokens[i]);
			}
			if (!found)
				return null;
			else
				return section.reverse().join('');
		}
		
	
		result.functionTokens.forEach(function(functionToken) 
		{
			//console.log(functionToken + ' ' + result.tokens[functionToken]);
			
			// if its a regular non-anonymous function name definition
			if ((result.tokens[functionToken+1] != '(') && (result.tokens[functionToken+1] != '{'))
			{
				if (argv.test)
					fs.writeSync(tests.functionDetectionOut, 'function name: ' + result.tokens[functionToken+1] + '\n');
			}
			// otherwise it may be assigned to an existing object for reference, rather than being named.
			// in that case, extract the statement to which the function is being assigned, under an ugly
			// assumption that everything between the previous line break and here is just that.
			else 
			{
				var i = functionToken-1;
				if (result.tokens[i] == '=')
					{
						i -= 1;
						if (argv.test)						
							fs.writeSync(tests.functionDetectionOut, 'function name: ' + concat(result.tokens, i, '\r\n') +'\n');
					}
			}
		});
	}
  
  var go = function(sourceCode) {
    var r = [], m, token, prev, s = sourceCode.toString();
	if (s) {
      RE.TOKEN.lastIndex = 0;
      while ((m = RE.TOKEN.exec(s)) != null) {
        token = m[1];
        if (!RE.NOTSPACE.test(token) || RE.COMMENTS.test(token)) {
          continue;
        } else if (m[4]) {
          if (m[2]) {
            r[r.length] = m[2];
          }
          if (m[3] && RE.NOTSPACE.test(m[3])) {
            r[r.length] = m[3];
          }
          r[r.length] = m[4];
        } else {
          prev = r[r.length - 1];
          if (!prev ||
              !RE.LINEBREAK.test(prev) || !RE.LINEBREAK.test(token)) {
            r[r.length] = token;
			result.tokenCount += 1;
			if (token == 'function')
			{
				result.functionsDefined += 1;
				functionTokens.push(r.length-1);
				//console.log('pushing function location ', r.length);
			}
          }
        }
      }
    }
	result.functionTokens = functionTokens;
	result.tokens = r;
	result.namedFunctions = extractNamedFunctions(result);
	return result;
  };
  return go(sourceCode);
};

var joinTokens = function() {
  var isWord = /^[^\s+\/%*=&|^~<>!?:,;@()\\[\].{}'"-]+$/,
      isSign = /^[-+]+$/;
  return function(tokens) {
    var result = [], len, prev, prevSuf, pre, suf, i, token;
    if (tokens) {
      len = tokens.length;
      for (i = 0; i < len; i++) {
        token = tokens[i];
        if (!prev) {
          result[result.length] = token;
        } else {
          pre = '';
          suf = '';
          if (token === 'in') {
            if (!prevSuf) {
              pre = ' ';
            }
            suf = ' ';
          } else if (isSign.test(token)) {
            if (!prevSuf && isSign.test(prev)) {
              pre = ' ';
            }
          } else if (isWord.test(prev.slice(-1)) &&
                     isWord.test(token.charAt(0))) {
            pre = ' ';
          }
          if (prevSuf === ' ') {
            pre = '';
          }
          result[result.length] = pre + token + suf;
        }
        prev = token;
        prevSuf = suf;
      }
    }
    return result.join('');
  };
}();
  
//console.log(data);
//tokens = tokenize(data);
//console.log(tokens);

function readFile(fileName)
{
	try 
	{
	  var data = fs.readFileSync(fileName, 'ascii');
	}
	catch (err) {
	  console.error('Failed error opening ' + fileName);
	  console.log(err);
	}
	return data;
}

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
					
					data = readFile(path);
					if (argv.test)
						fs.writeSync(tests.functionDetectionOut, path + '\n');
					sourceFile.analysis = tokenize(data);
					
					console.log('source file details (as JSON):');
					console.log(JSON.stringify(sourceFile, null, 4))					
					project.push(sourceFile);					
					//tokens += tokenize(data);
					//console.log(tokenize(data).tokens);
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
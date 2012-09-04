//
// for scanning the functions and correlating the calls
//

// stores a function name and the file defining it
exports.storeFunc = function(name, file) 
{
	//return 'added'
	//return 'already exists'
};

exports.getFileDefinedFuncs = function(file)
{
	//return array of all function names defined in the file
}

exports.getAllFiles = function()
{
	//return array of all files
}

exports.getAllFuncs = function()
{
	//return array of all function names
}

exports.findFunc = function(name) 
{	
	//return file
	//return 'not found'
};

// register name of source that calls this function
exports.registerCall = function(file, name, callerFile)
{
	//return null;
	//call incrementUsageCount
}

exports.getCallersCount = function(file, name)
{
	//return callers count
}

exports.getCallers = function(file, name)
{
	//return callers count
}

exports.incrementUsageCount = function(file, name)
{
	 //return null;
}

exports.getFileTokensCount = function(file)
{
	//return number of tokens
}
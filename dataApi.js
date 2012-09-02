//
// for scanning the functions and correlating the calls
//

// stores a function name and the file defining it
var storeFunc = function(name, file) 
{
	//return 'added'
	//return 'already exists'
};

var getFileDefinedFuncs = function(file)
{
	//return array of all function names defined in the file
}

var getAllFiles = function()
{
	//return array of all files
}

var getAllFuncs = function()
{
	//return array of all function names
}

var getAllFiles = function()
{
	//return array of all file names
}

var findFunc = function(name) 
{	
	//return file
	//return 'not found'
};

// register name of source that calls this function
var registerCall = function(file, name, callerFile)
{
	//return null;
	//call incrementUsageCount
}

var getUsageCount = function(file, name)
{
	//return usage count
}

var incrementUsageCount = function(file, name)
{
	 //return null;
}
var dataApi = require('./dataApi.js');
//
// build sphere outer edges and inner arcs
//
files = dataApi.getAllFiles();

// for each file

	// set the outer edge size to the amount of tokens
	dataApi.getFileTokensCount();

	dataApi.getFileDefinedFuncs();
	// and set the color gradient in relation to the number of defined functions (this is rather optional)
	
	// for each function in the file
		// compute weight of arc towards each other file
			dataApi.getCallersCount();
			dataApi.getCallers();
			// for each caller
				// +1 in a matrix, for the connection between the two files
				



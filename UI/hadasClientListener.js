//
// assumes jqueyry has been loaded by the calling page
//

$.getScript("./lib/socket.io.js", function(){

	// connect to Hadas server and listen for reload events
	// need to make sure this runs after at least socket.io was loaded.
	//
	var socket = io.connect('http://localhost:1337');		
	socket.emit('projectClient');		
	socket.on('clientRecycle', function() {
		location.reload(true);
	});
	
});
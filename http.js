var http = require('http');
http.createServer(function(request, reponse) {
	reponse.writeHeader(200, {"Content-Type": "text/html"});
	reponse.write('Hello');

	reponse.end();
}).listen(8000);

console.log("server runing");
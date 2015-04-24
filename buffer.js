var Buffer = require('buffer').Buffer,
	buf = new Buffer(256),
	len = buf.write('\u00bd + \u00bc = \u99be', 0);
console.log(buf.toString('utf8', 0));
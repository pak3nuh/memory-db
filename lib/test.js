var cp = require('child_process');
var path = require('path');

var engine = cp.spawn('node',[path.join(__dirname, 'engine.js')],{stdio:[null,null,null,'pipe']});

//engine.stdio[3].write('test message');
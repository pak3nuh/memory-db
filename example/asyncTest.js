
/**
 * Must uncomment the received message log on engine.js
 */

var Database = require('../index.js');

var db = new Database();

db.createTable('table1', function(err, data){
	if(err)
		console.log('err: ', err);
});

for(var i=0; i<10; i++)
	db.addRecord('table1',{name:'record'+i}, function(err,data){
		if(err)
			console.log('err: ', err);
		
	});

console.log('add requests sent');

function waitN(sec){
	var time = Date.now();
	(function(){
		while(Date.now() - time < sec * 1000){};
	})();
}
waitN(2);
console.log('finish wait');

db.getRecords('table1', function(){	return true;}
,function(err,data){
	if(err)
			console.log('err: ', err);
	
	console.log('data:', data);
});	


var Database = require('../index.js');

var db = new Database();

//Create and delete table test
for(var i = 0; i < 1; i++){
	db.createTable('table1', function(err, data){
		console.log('callback create ', i);
		console.log('err: ', err);
		console.log('data:', data);
	});
	
	db.dropTable('table1', function(err, data){
		console.log('callback delete ', i);
		console.log('err: ', err);
		console.log('data:', data);
	});	
}

db.createTable('table1', function(err, data){
	console.log('callback create for get');
	console.log('err: ', err);
	console.log('data:', data);
});

//Error
db.createTable('table1', function(err, data){
	console.log('callback create for error');
	console.log('err: ', err);
	console.log('data:', data);
});

//Add record test
for(var i=0; i<10; i++)
	db.addRecord('table1',{name:'record'+i}, function(err,data){
		console.log('callback add ');
		console.log('err: ', err);
		console.log('data:', data);
	});


function getall(){
	db.getRecords('table1', function(){	return true;}
	,function(err,data){
		console.log('callback get all');
		console.log('err: ', err);
		console.log('data:', data);
	});	
}
getall();

//Replace record test
db.replaceRecords('table1', {name:'replacedRecord1'}
	, function predicate(item){return item.name=='record1'}
	, function callback(err,data){
	console.log('callback replace ');
	console.log('err: ', err);
	console.log('data:', data);
});

getall();

//Update record test
db.updateRecords('table1'
, function update(item){item.newProperty='newValue';}
, function predicate(item){return item.name=='record2';}
, function callback(err,data){
	console.log('callback update ');
	console.log('err: ', err);
	console.log('data:', data);
});

getall();

//Delete record test
db.deleteRecords('table1'
, function predicate(item){return item.name=='record5';}
, function callback(err,data){
	console.log('callback delete ');
	console.log('err: ', err);
	console.log('data:', data);
});

getall();

//Find record test
db.findRecord('table1'
, function predicate(item){return true;}
, function callback(err,data){
	console.log('callback find ');
	console.log('err: ', err);
	console.log('data:', data);
});

getall();

//Count record test
db.countRecords('table1'
, function predicate(item){return true;}
, function callback(err,data){
	console.log('callback count ');
	console.log('err: ', err);
	console.log('data:', data);
});

//Get Top record test
db.getTopRecords('table1'
, function predicate(item){return true;}
, 0, 2, 'name', false
, function callback(err,data){
	console.log('callback get top ');
	console.log('err: ', err);
	console.log('data:', data);
});

getall();

//Closure capture test
var ctx = {value:'record6'};
db.setClosure(ctx);
db.findRecord('table1'
, function predicate(item){return item.name==value;}
, function callback(err,data){
	console.log('callback find with closure record6');
	console.log('err: ', err);
	console.log('data:', data);
});
//Closure must be clean
db.findRecord('table1'
, function predicate(item){return item.name==value;}
, function callback(err,data){
	console.log('callback find with closure not set ');
	console.log('err: ', err);
	console.log('data:', data);
});
//Closure error
ctx = {value:'record6', Object:'record6'};
db.setClosure(ctx);
db.findRecord('table1'
, function predicate(item){return item.name==value;}
, function callback(err,data){
	console.log('callback closure error ');
	console.log('err: ', err);
	console.log('data:', data);
});

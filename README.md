# memory-db
An in memory database using child processes for async communication and load balancing.

### Overview
This library has two main components, the `database` and the `engine`.

The first acts as a client that sends requests and listens for the responses, and the second one, the child process, listens and executes the request, sending the response.

**All the communication in JSON, so you should guarantee the data you send is serializable through `JSON.stringify()`**

### Sample
```javascript
var DbCtr = require('memory-db');
var database = new DbCtr();
```

From this point in time, it is created a new NodeJs child process for the handling of the requests.

```javascript
database.createTable('table1', function(err,data){
	if(err)
    	return console.error('err: ', err);
    console.log('table created');
});
```
Now it is possible to _query_ the database.
```javascript
database.addRecord('table1', {name:'record1'}, function(err,insCnt){
	if(err)
    	return console.error('err: ', err);
    console.log(insCnt, ' record(s) created');
});
```
For convenience it is possible to set a context for the functions execution. By default the context is deleted after the execution, but it can be set a timeout of X executions.
```javascript
database.setContext({recordName:'record1', newName:'updatedRecord'});
database.updateRecord('table1'
  , function update(item){
      item.name = newName;
  }
  , function predicate(item){
      return item.name == recordName;
  }
  , function callback(err,updCnt){
      if(err)
          return console.error('err: ', err);
      console.log(updCnt, ' record(s) updated');
  }
);
```


### Caveats
There are some node debuggers that try to listen to the child processes once created through the same port that the main process.
The runtime throws an error saying the address is in use.

### Planned
1. Constraint system for insert, update and delete
2. User functions being executed in a sandbox environment
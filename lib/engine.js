
var operations = require('./engine-operations');
var errors = require('./engine-errors');
var TableCtr = require('./memory-table');

var tables = {};
var reqUuid;

//Message communication
process.on('message', function(operation){
	//console.log('engine received message',Date.now());
	processOperation(operation);
});

function sendError(errCode, message){
	errCode = errCode || errors.errCodes.EGEN;
	var err = new errors.ErrorResult(errCode, message)
	var res = new operations.Result(err, reqUuid, null);
	var jsonRes = JSON.stringify(res);
	
	process.send(jsonRes);
	
	if(requestClosure)
		cleanClosure();
}

function sendData(data){
	var res = new operations.Result(null, reqUuid, data);
	process.send(JSON.stringify(res));
	
	if(requestClosure)
		cleanClosure();
}

var requestClosure = null;
var funcClosure = global;
/**
 * Sets the closure for the user functions. Returns false if an error was detected and true otherwise
 * @param {object} [closure]: The object add to the current scope or null if no closure needed
 */
function setClosure(closure){
	if(closure==null)
		return true;
	
	if(requestClosure)
		cleanClosure();
	
	var addedKeys=[];
	var setCls = Object.keys(closure).every(function(key, index, array){
		if(funcClosure[key]){
			sendError(errors.errCodes.ECLSDUP, 'There is already a variable [' + key + '] within the current scope. Please choose another name.')
			//Cleanup
			for(var i=0; i<index; i++){
				//funcClosure[addedKeys[i]] = null;
				delete funcClosure[addedKeys[i]];
			}
			return false;
		}
		
		funcClosure[key] = closure[key];
		addedKeys.push(key);
		return true;
	});
	
	if(setCls)
		requestClosure = closure;

	return setCls;
}
function cleanClosure(){
	Object.keys(requestClosure).forEach(function(key){
		//funcClosure[key] = null;
		delete funcClosure[key];
	});
	requestClosure=null;
}

/**
 * Send an error result to the client if table does not exists
 * 
 * Returns true if the validation did not raised an error.
 * 
 * @param {string} tableName: The name of the table
 */
function errorOnTableNotExists(tableName){
	if(tables[tableName] == null){
		sendError(errors.errCodes.dbManagement.ETBLNOTEX ,'Table ' + tableName + ' does not exists.');
		return false;
	}
	return true;
}
/**
 * Send an error result to the client if table does exists
 * 
 * Returns true if the validation did not raised an error.
 * 
 * @param {string} tableName: The name of the table
 */
function errorOnTableExists(tableName){
	if(tables[tableName]){
		sendError(errors.errCodes.dbManagement.ETBLEX ,'Table ' + tableName + ' already exists.');
		return false;
	}
	return true;
}
function createTable(tableName){
	if(!errorOnTableExists(tableName))
		return;
		
	tables[tableName] = new TableCtr(tableName);
	sendData('Table Created');
}

function deleteTable(tableName){
	if(!errorOnTableNotExists(tableName))
		return;
	
	tables[tableName] = null;
	sendData('Table Deleted');
}

function instanciateFunction(funcStr){
	funcStr = funcStr.substring(funcStr.indexOf('{')+1, funcStr.lastIndexOf('}'));
	
	var func = new Function('item',funcStr);
	return func;
}

function getRecords(tableName, predicateFn){
	if(!errorOnTableNotExists(tableName))
		return;
		
	var func = instanciateFunction(predicateFn);
	tables[tableName].get(func,function(err,objArray){
		if(err)
			return sendError(err.message);
		
		sendData(objArray);
	});
}

function getTopRecords(tableName, predicateFn, startRow, maxRows, sortProperty, descending){
	if(!errorOnTableNotExists(tableName))
		return;
		
	var func = instanciateFunction(predicateFn);
	tables[tableName].getTop(func, startRow, maxRows, sortProperty, descending, function(err,objArray){
		if(err)
			return sendError(err.message);
		
		sendData(objArray);
	});
}

function countRecords(tableName, predicateFn){
	if(!errorOnTableNotExists(tableName))
		return;
		
	var func = instanciateFunction(predicateFn);
	tables[tableName].count(func,function(err,count){
		if(err)
			return sendError(err.message);
		
		sendData(count);
	});
}

function findRecord(tableName, predicateFn){
	if(!errorOnTableNotExists(tableName))
		return;
		
	var func = instanciateFunction(predicateFn);
	tables[tableName].find(func,function(err,obj){
		if(err)
			return sendError(err.message);
		
		sendData(obj);
	});
}

function deleteRecords(tableName, predicateFn){
	if(!errorOnTableNotExists(tableName))
		return;
		
	var func = instanciateFunction(predicateFn);
	tables[tableName].delete(func,function(err,delCnt){
		if(err)
			return sendError(err.message);
		
		sendData(delCnt);
	});
}

function addRecord(tableName, record){
	if(!errorOnTableNotExists(tableName))
		return;
	
	tables[tableName].add(record,function(err,insCnt){
		if(err)
			return sendError(err.message);
		
		sendData(insCnt);
	});
}

function replaceRecords(tableName, newRecord, predicateFn){
	if(!errorOnTableNotExists(tableName))
		return;
	
	var func = instanciateFunction(predicateFn);
	tables[tableName].replace(newRecord, func, function(err,repCnt){
		if(err)
			return sendError(err.message);
		
		sendData(repCnt);
	});
}

function updateRecords(tableName, updateFn, predicateFn){
	if(!errorOnTableNotExists(tableName))
		return;
	
	var func = instanciateFunction(predicateFn);
	var upd = instanciateFunction(updateFn);
	tables[tableName].update(upd, func, function(err,updCnt){
		if(err)
			return sendError(err.message);
		
		sendData(updCnt);
	});
}

function processOperation(operation){
	try{
		var operObj = JSON.parse(operation);
		reqUuid = operObj.uuid;
		//Closure
		if(!setClosure(operObj.closure))
			return;
				
		switch(operObj.type){
			case operations.types.dbManagement.createTable:
				createTable(operObj.tableName);
				break;
			
			case operations.types.dbManagement.dropTable:
				deleteTable(operObj.tableName);
				break;
			
			case operations.types.tableManagement.addRecord:
				addRecord(operObj.tableName, operObj.record);
				break;
			
			case operations.types.tableManagement.getRecords:
				getRecords(operObj.tableName, operObj.predicateFn);
				break;
			
			case operations.types.tableManagement.replaceRecords:
				replaceRecords(operObj.tableName, operObj.newRecord, operObj.predicateFn);
				break;
			
			case operations.types.tableManagement.updateRecords:
				updateRecords(operObj.tableName, operObj.updateFn, operObj.predicateFn);
				break;
			
			case operations.types.tableManagement.deleteRecords:
				deleteRecords(operObj.tableName, operObj.predicateFn);
				break;
			
			case operations.types.tableManagement.findRecord:
				findRecord(operObj.tableName, operObj.predicateFn);
				break;
			
			case operations.types.tableManagement.countRecords:
				countRecords(operObj.tableName, operObj.predicateFn);
				break;
			
			case operations.types.tableManagement.getTopRecords:
				getTopRecords(operObj.tableName, operObj.predicateFn, operObj.startRow, operObj.maxRows, operObj.sortProperty, operObj.descending);
				break;
			
			default:
				sendError(errors.errCodes.EOPNEX, 'Engine operation not found:' + operObj.type);
		}	
	}catch(ex){
		sendError(null, ex.message);	
	}
}


/**
 * By default Error preperties aren't enumerable.
 * Adds a proterty that allows JSON.stringify to work.
 */
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true
});
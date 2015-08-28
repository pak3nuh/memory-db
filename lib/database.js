
var util = require('util');
var cp = require('child_process');
var operations = require('./engine-operations');

function Database(){
	var requests = {};
	var engine = cp.fork(__dirname + '/engine.js');
	
	/**
	 * Response handler
	 */
	engine.on('message',function(result){
		var resObj = JSON.parse(result);
		if(requests[resObj.uuid])
		{
			try{
				if(typeof(requests[resObj.uuid]) == 'function')
					requests[resObj.uuid](resObj.error, resObj.data);	
			}catch(ex){
				console.log('Error runing callback on uuid:', resObj.uuid);
				console.log('Exception:', ex);
			}
			requests[resObj.uuid] = null;
		}
	});
	
	/**
	 * Error handler
	 */
	 engine.on('error', function(err){
		 console.error('Engine error:',err);
	 });
	
	/**
	 * Sends the operation to the engine.
	 */
	function sendOperation(operation){
		if(reqCls){
			operation.closure=reqCls;
			operation.closureTimeout = clsTimeout;
			reqCls=null;
			clsTimeout=null;
		}
		var jsonOper = JSON.stringify(operation);
		engine.send(jsonOper);
	}
	
	var reqCls, clsTimeout;
	/**
	 * Sets the closure object for the next operation with the database.
	 * After the operation the closure is set to null.
	 * @param {object} cls: Sets the global variable with the same name on the engine.
	 */
	this.setClosure=function setClosure(cls){
		reqCls=cls;
	}
	
	/**
	 * Creates a table with the givven name
	 * @param {string} tableName: The name of the table
	 * @param {function} callback(err,data): The callback when the response arrives
	 */
	this.createTable = function createTable(name, callback){
		var oper = new operations.CreateTable(name);
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Deletes a table with the givven name
	 * @param {string} tableName: The name of the table
	 * @param {function} callback(err,data): The callback when the response arrives
	 */
	this.dropTable = function dropTable(name, callback){
		var oper = new operations.DropTable(name);
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}	
	
	/**
	 * Adds a record to the specified table
	 * @param {string} tableName: The name of the table
	 * @param {object} record: The object to add
	 * @param {function} callback(err,insCnt): The callback with error and insertion count.
	 */
	this.addRecord = function addRecord(tableName, record, callback){
		var oper = new operations.AddRecord(tableName, record);
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Returns all records that match the predicate
	 * @param {string} tableName: The name of the table
	 * @param {function} predicateFn(item): The function containing the logic for matching records
	 * @param {function} callback(err,itemArray): The callback with error and an array of matching objects.
	 */
	this.getRecords = function getRecords(tableName, predicateFn, callback){
		var oper = new operations.GetRecords(tableName, predicateFn.toString());
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Replaces all records that match the predicate with a copy of newRecord
	 * @param {string} tableName: The name of the table
	 * @param {object} newRecord: The substitute record
	 * @param {function} predicateFn(item): The function containing the logic for matching records
	 * @param {function} callback(err,rplCnt): The callback with error and the replace count.
	 */
	this.replaceRecords = function replaceRecords(tableName, newRecord, predicateFn, callback){
		var oper = new operations.ReplaceRecords(tableName, newRecord, predicateFn.toString());
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Update all records that match the predicate with the updateFn
	 * @param {string} tableName: The name of the table
	 * @param {function} updateFn(item): The function containing the logic for updating the recors
	 * @param {function} predicateFn(item): The function containing the logic for matching records
	 * @param {function} callback(err,updCnt):The callback with error and the update count.
	 */
	this.updateRecords = function updateRecords(tableName, updateFn, predicateFn, callback){
		var oper = new operations.UpdateRecords(tableName, updateFn.toString(), predicateFn.toString());
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Deletes all records that match the predicate
	 * @param {string} tableName: The name of the table
	 * @param {function} predicateFn(item): The function containing the logic for matching records
	 * @param {function} callback(err,delCnt):The callback with error and the delete count.
	 */
	this.deleteRecords = function deleteRecords(tableName, predicateFn, callback){
		var oper = new operations.DeleteRecords(tableName, predicateFn.toString());
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Returns the first record that match the predicate
	 * @param {string} tableName: The name of the table
	 * @param {function} predicateFn(item): The function containing the logic for matching records
	 * @param {function} callback(err,item):The callback with error and the record.
	 */
	this.findRecord = function findRecord(tableName, predicateFn, callback){
		var oper = new operations.FindRecord(tableName, predicateFn.toString());
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Returns the record count that match the predicate
	 * @param {string} tableName: The name of the table
	 * @param {function} predicateFn(item): The function containing the logic for matching records
	 * @param {function} callback(err,count):The callback with error and the count.
	 */
	this.countRecords = function countRecords(tableName, predicateFn, callback){
		var oper = new operations.CountRecords(tableName, predicateFn.toString());
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
	/**
	 * Returns the top N record matching the predicate
	 * @param {string} tableName: The name of the table
	 * @param {function} predicateFn(item): The function containing the logic for matching records
	 * @param {number} startRow: Zero based index for starting the collect process
	 * @param {number} maxRows: The maximium number of rows that will be returned
	 * @param {string} sortProperty: The name of the property for the sorting process
	 * @param {boolean} descending: If true, sorts in descending order
	 * @param {function} callback(err,itemArray):The callback with error and the count.
	 */
	this.getTopRecords = function getTopRecords(tableName, predicateFn, startRow, maxRows, sortProperty, descending, callback){
		var oper = new operations.GetTopRecords(tableName, predicateFn.toString(), startRow, maxRows, sortProperty, descending);
		requests[oper.uuid] = callback;
		sendOperation(oper);
	}
}

module.exports = Database;
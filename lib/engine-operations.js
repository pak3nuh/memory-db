var uuid = require('uuid');

var oper = {
	types : {
		dbManagement:{
			result:0,
			createTable:1,
			dropTable:2	
		},
		tableManagement:{
			getRecords:3,
			addRecord:4,
			updateRecords:5,
			deleteRecords:6,
			replaceRecords:7,
			findRecord:8,
			countRecords:9,
			getTopRecords:10
		}
	},
	Result: function(err, uuid, data){
		return {
			type:oper.types.dbManagement.result,
			uuid:uuid,
			error:err,
			data:data
		};	
	}
	
	,CreateTable: function(tableName){
		return {
			type:oper.types.dbManagement.createTable,
			uuid:uuid.v4(),
			tableName:tableName
		};
	}
	
	,DropTable:function(tableName){
		return {
			type:oper.types.dbManagement.dropTable,
			uuid:uuid.v4(),
			tableName:tableName
		};
	},
	GetRecords:function(tableName, predicateFn){
		return{
			type:oper.types.tableManagement.getRecords,
			uuid:uuid.v4(),
			tableName:tableName,
			predicateFn:predicateFn
		};
	},
	AddRecord:function(tableName, record){
		return{
			type:oper.types.tableManagement.addRecord,
			uuid:uuid.v4(),
			tableName:tableName,
			record:record
		};
	},
	ReplaceRecords:function(tableName, newRecord, predicateFn){
		return{
			type:oper.types.tableManagement.replaceRecords,
			uuid:uuid.v4(),
			tableName:tableName,
			newRecord:newRecord,
			predicateFn:predicateFn
		};
	},
	UpdateRecords:function(tableName, updateFn, predicateFn){
		return{
			type:oper.types.tableManagement.updateRecords,
			uuid:uuid.v4(),
			tableName:tableName,
			updateFn:updateFn,
			predicateFn:predicateFn
		};
	},
	DeleteRecords:function(tableName, predicateFn){
		return{
			type:oper.types.tableManagement.deleteRecords,
			uuid:uuid.v4(),
			tableName:tableName,
			predicateFn:predicateFn
		};
	},
	FindRecord:function(tableName, predicateFn){
		return{
			type:oper.types.tableManagement.findRecord,
			uuid:uuid.v4(),
			tableName:tableName,
			predicateFn:predicateFn
		};
	},
	CountRecords:function(tableName, predicateFn){
		return{
			type:oper.types.tableManagement.countRecords,
			uuid:uuid.v4(),
			tableName:tableName,
			predicateFn:predicateFn
		};
	},
	GetTopRecords:function(tableName, predicateFn, startRow, maxRows, sortProperty, descending){
		return{
			type:oper.types.tableManagement.getTopRecords,
			uuid:uuid.v4(),
			tableName:tableName,
			predicateFn:predicateFn,
			startRow:startRow,
			maxRows:maxRows,
			sortProperty:sortProperty,
			descending:descending
		};
	}
};





module.exports=oper;

var err={
	errCodes:{
		/**
		* General Error
		*/
		EGEN:0,
		/**
		* Invalid Closure
		*/
		EINVCLS:1,
		/**
		* Duplicate closure key
		*/
		ECLSDUP:2,
		/**
		* Operation does not exists
		*/
		EOPNEX:3,
		dbManagement:{
			/**
			 * Table exists
			 */
			ETBLEX:100,
			/**
			 * Table not exists
			 */
			ETBLNOTEX:101
		},
		tableManagement:{
			/**
			* Constraint Failed
			*/
			ECNTFLD:200
		}
	},
	ErrorResult: function(errCode, message){
		var err = new Error(message);
		err.code = errCode;
		delete err.stack;
		return err;
	}
};

module.exports = err;
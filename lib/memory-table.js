
var util = require('util');
var base = require('./table-prototype');
base.extendTo(DataTable);

/**
 * Creates a memory datatable binded to an object model.
 * This API is compliant with 'error-first' callback style
 * @param {string} name: Datatable name
 * @param {object} [model]: Constructor function bind the items to a validation function.
 * */
function DataTable(name, model) {
    this.Name=name
    var innerTable = [];
    var itemType = model;
    DataTable.super_.call(this);
    
    /**
     * Clones as object using it's enumerable properties.
     * It cannot detect loops in object properties.
     */
    function cloneObj(obj){
        if(typeof(obj) != 'object')
            return obj;
        
        var ret = {}
        Object.keys(obj).forEach(function(property){
            if(typeof(obj[property]) == 'object'){
                ret[property] = cloneObj(obj[property]);
            }
            else{
                ret[property] = obj[property];
            }
        });
        return ret;
    }
    
    /**
     * Validates if the item is the same type that the model on the table
     * Calls the error callback if the validation fails
     * @param {object} item: Item to validate
     * @param {function} doneCb(err): Callback in the case of an error
     * @return {boolean}: True if the validation succeded
     * */
    function validateItem(item, doneCb) {
        if(itemType==null)
            return true;
        
        if (!(item instanceof itemType)) {
            var err = new TypeError("Item to add does not have the same type than the remaining items on the table.");
            err.userError=true;
            doneCb(err);
            return false;
        }   
        return true;
    }

    /**
     * Adds one item to the table.
     * @param {object} item: Item to be inserted.
     * @param {function} doneCb(err, insCount): Callback with the error and the number of inserted item. 
     * */
    this.add = function (item, doneCb) {
        if (!validateItem(item, doneCb))
            return;

        innerTable.push(item);
        doneCb(null,1);
        
    }

    /**
     * Gets an the items in the table by a predicate function.
     * @param {function} predicate(item): Predicate function to be used
     * @param {function} doneCb(err, itemArray): Callback with the error and the array of items in the table that match the function. 
     * */
    this.get = function (predicate, doneCb) {
        var ret = [];
        var func = predicate;
        for (var i = 0; i < innerTable.length; i++)
            if (func(innerTable[i]))
                ret.push(innerTable[i]);
        doneCb(null,ret);
    }
    
    /**
     * @param {function} predicate(item): Predicate function to be used
     * @param {int} startRow: Zero based row number for start collecting.
     * @param {int} maxRows: Max number of objects to return
     * @param {string} sortProperty: Field for sort
     * @param {boolean} descending: True if descending order
     * @param {function} doneCb(err, objArray): Function called with error and the array of items.
     */
    this.getTop = function (predicate, startRow, maxRows, sortProperty, descending, doneCb) {
        //Copy array for sorting process
        var ordered=[];
        for(var i=0; i<innerTable.length; i++){
            if(innerTable[i][sortProperty]==null)
                return doneCb(new Error('The property ' + sortProperty + ' does not exist on all objects'));
            
            ordered.push(innerTable[i]);
        }
        
        //orders temporary array
        var reverse = descending ? -1:1;
        ordered = ordered.sort(function (a, b){
            
            if(a[sortProperty]<b[sortProperty])
                return -1 * reverse;
            if (a[sortProperty] > b[sortProperty])
                return 1 * reverse;
                
            return 0;
        });

        //filters results
        var ret = [];
        var func = predicate;
        for (var i = 0; i < ordered.length; i++)
            if (i >= startRow)
                if (func(ordered[i]) && maxRows-- > 0) {
                    ret.push(ordered[i]);
                    if (maxRows == 0)
                        break;
                }
        doneCb(null,ret);
    }

    /**
     * Counts the items in the table by a predicate function.
     * @param {function} predicate(item): Predicate function to be used
     * @param {function} doneCb(err, count): Callback with the error and the number items in the table that match the function. 
     * */
    this.count = function (predicate, doneCb) {
        var ret = 0;
        var func = predicate;
        for (var i = 0; i < innerTable.length; i++)
            if (func(innerTable[i]))
                ret++;
        doneCb(null,ret);
    }

    /**
     * Replaces the items in the table with the input item. Will be updated all the items that match the predicate function.
     * @param {object} item: Item with the values for the update.
     * @param {function} predicate(item): The function used for matching records.
     * @param {function} doneCb(err, repCount): Callback with the error and the number items updated.
     * */
    this.replace = function (item, predicate, doneCb) {
        
        if (!validateItem(item,doneCb))
            return;

        var cnt = 0;
        for (var i = 0; i < innerTable.length; i++)
            if (predicate(innerTable[i])) {
                innerTable[i] = cloneObj(item);
                cnt++;
            }

        doneCb(null,cnt);
    }
    
    /**
     * Update the items in the table with the update function. Will be updated all the items that match the predicate function.
     * @param {function} updateFn(item): Item with the values for the update.
     * @param {function} predicate(item): The function used for matching records.
     * @param {function} doneCb(err, updCount): Callback with the error and the number items updated.
     * */
    this.update = function (updateFn, predicate, doneCb) {
        var cnt = 0;
        for (var i = 0; i < innerTable.length; i++)
            if (predicate(innerTable[i])) {
                updateFn(innerTable[i]);
                cnt++;
            }

        doneCb(null,cnt);
    }

    /**
     * Deletes all the items in the table that match the predicate function.
     * @param {function} predicate: The function used for matching records.
     * @param {function} doneCb(err, delCount): Callback with the error and the number items deleted.
     * */
    this.delete = function (predicate, doneCb) {
        var cnt = 0;

        for (var i = 0; i < innerTable.length; i++)
            if (predicate(innerTable[i])) {
                innerTable.splice(i, 1);
                i--;
                cnt++;
            }

        doneCb(null,cnt);
    }

    /**
     * Returns the first element that matches the predicate.
     * @param {function} predicate(item): Predicate function to be used
     * @param {function} doneCb(err, itemFound): Callback with the error and the number items deleted.
     * */
    this.find = function(predicate, doneCb){
        for (var i = 0; i < innerTable.length; i++){
            if(predicate(innerTable[i]))
                return doneCb(null, innerTable[i]);
        }
        return doneCb(null, null);
    }
}

module.exports = DataTable;
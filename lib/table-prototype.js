
var dbInterface = DBContextInterface;
var util = require('util');

function DBContextInterface() {
}

dbInterface.prototype.add = function (item,doneCb) { 
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.getAll = function (doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.getById = function (id, doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.get = function (predicate, doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.getTop = function (predicate, startRow, maxRows, sortProperty, descending, doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.count = function (predicate, doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.updateById = function (item, doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.deleteById = function (id, doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.prototype.find = function (predicate, doneCb) {
    throw doneCb(new Error("Not Yet Implemented."));
}

dbInterface.extendTo = function extendTo(target){
    util.inherits(target, DBContextInterface);
}

module.exports = dbInterface;
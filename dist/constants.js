'use strict';

exports.ACTION_DIRECT_UPDATE = Symbol('ACTION_DIRECT_UPDATE');
exports.PrimitiveTransaction = function PrimitiveTransaction(heads, prop) {
  this.path = heads + '.' + prop;
};
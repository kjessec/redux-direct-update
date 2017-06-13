'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = require('./constants'),
    PrimitiveTransaction = _require.PrimitiveTransaction;

module.exports = function (map) {
  return {
    directUpdateTransaction: false,
    map: map,
    get: function get(target, prop, receiver) {
      if (_typeof(target[prop]) === 'object' || typeof target[prop] === 'undefined' || target[prop] === null) return Reflect.get(target, prop, receiver);

      // primitive + normal read
      if (!this.directUpdateTransaction) {
        return Reflect.get(target, prop, receiver);
      }

      // primitive + directUpdate transaction
      return new PrimitiveTransaction(this.map.get(target), prop);
    }
  };
};
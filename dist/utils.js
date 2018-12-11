"use strict";

exports.isArray = Array.isArray;

exports.isObject = function (obj) {
  return obj === Object(obj);
};

exports.sequencialReducerComposer = function () {
  for (var _len = arguments.length, reducers = new Array(_len), _key = 0; _key < _len; _key++) {
    reducers[_key] = arguments[_key];
  }

  return function (state, action) {
    return reducers.reduce(function (t, f) {
      return f(t, action);
    }, state);
  };
};
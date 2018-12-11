"use strict";

var createDirectUpdateHandlerReducer = require('./directUpdateHandlerReducer');

var createDirectUpdatePostprocessingReducer = require('./directUpdatePostprocessingReducer');

module.exports = function createDirectUpdateContext() {
  var map = new WeakMap();
  var directUpdateHandlerReducer = createDirectUpdateHandlerReducer(map);
  var directUpdatePostprocessingReducer = createDirectUpdatePostprocessingReducer(map);
  return {
    map: map,
    directUpdateHandlerReducer: directUpdateHandlerReducer,
    directUpdatePostprocessingReducer: directUpdatePostprocessingReducer
  };
};
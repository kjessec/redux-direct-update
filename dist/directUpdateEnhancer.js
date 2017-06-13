'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var directUpdate = require('./directUpdate');
var createDirectUpdateHandlerReducer = require('./directUpdateHandlerReducer');
var createDirectUpdatePostprocessingReducer = require('./directUpdatePostprocessingReducer');

var _require = require('./utils'),
    sequencialReducerComposer = _require.sequencialReducerComposer;

var directUpdateEnhancer = function directUpdateEnhancer(createStore) {
  return function (defaultReducer, preloadedState, enhancer) {
    var map = new WeakMap();

    var enhancedReducer = sequencialReducerComposer(createDirectUpdateHandlerReducer(map), defaultReducer, createDirectUpdatePostprocessingReducer(map));
    var store = createStore(enhancedReducer, preloadedState, enhancer);

    // assign this store context to directUpdate!
    directUpdate.assignContext(store);

    return _extends({}, store, {
      directUpdate: directUpdate
    });
  };
};

module.exports = directUpdateEnhancer;
'use strict';

var _require = require('./utils'),
    isArray = _require.isArray,
    isObject = _require.isObject;

module.exports = function createDirectUpdatePostProcess(map, proxyHandler) {
  // global map
  var previousState = {};
  return function directUpdatePostprocessingReducer(intermediateState) {
    var nextState = walkTreeAndFindChanges(previousState, intermediateState, map, proxyHandler, function (path, previousState, changedState) {
      map.set(changedState, path);
    });

    previousState = nextState;
    map.set(nextState, 'root');

    return nextState;
  };
};

function walkTreeAndFindChanges(previousState, nextState, map, proxyHandler, callMeWhenChanged) {
  var path = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'root';

  // exit if unchanged
  if (map.has(previousState) && map.get(previousState) === map.get(nextState)) return nextState;

  var changedState = null;
  if (isArray(nextState)) {
    changedState = new Proxy(nextState.slice(0), proxyHandler).map(function (e, i) {
      return walkTreeAndFindChanges((previousState || [])[i], e, map, proxyHandler, callMeWhenChanged, path + '.' + i);
    });

    callMeWhenChanged(path, previousState, changedState);
  } else if (isObject(nextState)) {
    var dirtyNextState = {};
    Object.keys(nextState).forEach(function (key) {
      dirtyNextState[key] = walkTreeAndFindChanges((previousState || {})[key], nextState[key], map, proxyHandler, callMeWhenChanged, path + '.' + key);
    });
    changedState = new Proxy(dirtyNextState, proxyHandler);

    callMeWhenChanged(path, previousState, dirtyNextState);
  } else {
    changedState = nextState;
  }

  // carry on...
  return changedState;
}
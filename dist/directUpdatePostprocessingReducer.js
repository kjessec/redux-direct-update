'use strict';

var _require = require('./utils'),
    isArray = _require.isArray,
    isObject = _require.isObject;

module.exports = function createDirectUpdatePostProcess(map) {
  // global map
  var previousState = {};
  return function directUpdatePostprocessingReducer(nextState) {
    if (!nextState) return nextState;

    walkTreeAndFindChanges(previousState, nextState, function (path, previousState, nextState) {
      map.delete(previousState);
      map.set(nextState, path);
    });

    previousState = nextState;
    map.set(nextState, 'root');

    return nextState;
  };
};

function walkTreeAndFindChanges(previousState, nextState, callMeWhenChanged) {
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'root';

  // exit if unchanged
  if (previousState === nextState) return;

  if (isArray(nextState)) {
    callMeWhenChanged(path, previousState, nextState);
    nextState.forEach(function (e, i) {
      return walkTreeAndFindChanges((previousState || [])[i], e, callMeWhenChanged, path + '.' + i);
    });
  } else if (isObject(nextState)) {
    callMeWhenChanged(path, previousState, nextState);
    Object.keys(nextState).forEach(function (key) {
      walkTreeAndFindChanges((previousState || {})[key], nextState[key], callMeWhenChanged, path + '.' + key);
    });
  }
}
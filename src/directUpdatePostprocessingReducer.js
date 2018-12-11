const { isArray, isObject } = require('./utils');

module.exports = function createDirectUpdatePostProcess(map) {
  // global map
  let previousState = {};
  return function directUpdatePostprocessingReducer(nextState) {
    if(!nextState) return nextState;

    walkTreeAndFindChanges(
      previousState,
      nextState,
      function(path, previousState, nextState) {
        map.delete(previousState);
        map.set(nextState, path);
      },
      null
    );

    previousState = nextState;
    map.set(nextState, '');

    return nextState;
  };
};

function walkTreeAndFindChanges(previousState, nextState, callMeWhenChanged, path = '') {
  // exit if unchanged
  if(previousState === nextState) return;

  if(isArray(nextState)) {
    callMeWhenChanged(path, previousState, nextState);
    nextState.forEach((e, i) =>
      walkTreeAndFindChanges((previousState || [])[i], e, callMeWhenChanged, path ? `${path}.${i}` : `${i}`)
    );
  }

  else if(isObject(nextState)) {
    callMeWhenChanged(path, previousState, nextState);
    Object.keys(nextState).forEach(key => {
      walkTreeAndFindChanges(
        (previousState || {})[key], nextState[key], callMeWhenChanged, path ? `${path}.${key}` : `${key}`
      );
    });
  }
}

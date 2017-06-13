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
      }
    );

    previousState = nextState;
    map.set(nextState, 'root');

    return nextState;
  };
};

function walkTreeAndFindChanges(previousState, nextState, callMeWhenChanged, path = 'root') {
  // exit if unchanged
  if(previousState === nextState) return;

  if(isArray(nextState)) {
    callMeWhenChanged(path, previousState, nextState);
    nextState.forEach((e, i) =>
      walkTreeAndFindChanges((previousState || [])[i], e, callMeWhenChanged, `${path}.${i}`)
    );
  }

  else if(isObject(nextState)) {
    callMeWhenChanged(path, previousState, nextState);
    Object.keys(nextState).forEach(key => {
      walkTreeAndFindChanges(
        (previousState || {})[key], nextState[key], callMeWhenChanged, `${path}.${key}`
      );
    });
  }
}

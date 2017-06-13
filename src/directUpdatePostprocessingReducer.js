const { isArray, isObject } = require('./utils');

module.exports = function createDirectUpdatePostProcess(map, proxyHandler) {
  // global map
  let previousState = {};
  return function directUpdatePostprocessingReducer(intermediateState) {
    const nextState = walkTreeAndFindChanges(
      previousState,
      intermediateState,
      map,
      proxyHandler,
      function(path, previousState, changedState) {
        map.set(changedState, path);
      }
    );

    previousState = nextState;
    map.set(nextState, 'root');

    return nextState;
  };
};

function walkTreeAndFindChanges(previousState, nextState, map, proxyHandler, callMeWhenChanged, path = 'root') {
  // exit if unchanged
  if(map.has(previousState) && map.get(previousState) === map.get(nextState)) return nextState;

  let changedState = null;
  if(isArray(nextState)) {
    changedState = new Proxy(nextState.slice(0), proxyHandler).map((e, i) =>
      walkTreeAndFindChanges((previousState || [])[i], e, map, proxyHandler, callMeWhenChanged, `${path}.${i}`)
    );

    callMeWhenChanged(path, previousState, changedState);
  }

  else if(isObject(nextState)) {
    const dirtyNextState = {};
    Object.keys(nextState).forEach(key => {
      dirtyNextState[key] = walkTreeAndFindChanges(
        (previousState || {})[key], nextState[key], map, proxyHandler, callMeWhenChanged, `${path}.${key}`
      );
    });
    changedState = new Proxy(dirtyNextState, proxyHandler);

    callMeWhenChanged(path, previousState, dirtyNextState);
  }

  else {
    changedState = nextState;
  }

  // carry on...
  return changedState;
}

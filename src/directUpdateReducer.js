const { ACTION_DIRECT_UPDATE } = require('./constants');
const { deepPlant, isArray, isObject } = require('./utils');
const { PrimitiveTransaction } = require('./constants');
const createProxyHandler = require('./createProxyHandler');

module.exports = function directUpdateReducerCreator() {
  // global map
  const map = new WeakMap();
  const proxyHandler = createProxyHandler(map);

  return function directUpdateReducer(previousState, action) {
    let nextState = previousState;
    const { type, batchArgs } = action;

  // if direct update action, do something
    if(type === ACTION_DIRECT_UPDATE) {
      proxyHandler.directUpdateTransaction = true;
      const updateMeta = transformBatchArgsToUpdateMeta(map, previousState, batchArgs());
      proxyHandler.directUpdateTransaction = false;

      const dirtyState = updateMeta.reduce((prevState, meta) => {
        const [updatePath, nextValue] = meta;
        return deepPlant(prevState, updatePath, typeof nextValue === 'function' ? nextValue : () => nextValue);
      }, previousState);

      nextState = dirtyState;
    }

    nextState = walkTreeAndFindChanges(
      previousState,
      nextState,
      map,
      proxyHandler,
      function(path, previousState, changedState) {
        map.set(changedState, path);
      }
    );

    map.set(nextState, 'root');

    return nextState;
  };
};

function transformBatchArgsToUpdateMeta(map, state, batchArgs) {
  return batchArgs.map(([key, newValue]) => {
    if(typeof key !== 'object') {
      throw new Error('Update path is NOT correct. Did you pass a primitive value itself as the update key?');
    }
    const updatePath = key instanceof PrimitiveTransaction ? key.path : map.get(key);
    return [updatePath, newValue];
  });
}

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

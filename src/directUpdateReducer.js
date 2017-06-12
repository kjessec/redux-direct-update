const { ACTION_DIRECT_UPDATE } = require('./constants');
const { deepPlant, isArray, isObject } = require('./utils');
const PrimitiveWrapper = require('./PrimitiveWrapper');

module.exports = function directUpdateReducerCreator() {
  // global map
  const __map = new WeakMap();
  return function directUpdateReducer(previousState, action) {
    let nextState = previousState;
    const { type, batchArgs } = action;

  // if direct update action, do something
    if(type === ACTION_DIRECT_UPDATE) {
      const updateMeta = transformBatchArgsToUpdateMeta(__map, previousState, batchArgs);
      const dirtyState = updateMeta.reduce((prevState, meta) => {
        const [updatePath, nextValue] = meta;
        return deepPlant(prevState, updatePath, typeof nextValue === 'function' ? nextValue : () => nextValue);
      }, previousState);

      nextState = dirtyState;
    }

    // if nextState is different than previousState,
    // that means there was a DIRECT_UPDATE change
    // create maps
    nextState = walkTreeAndFindChanges(previousState, nextState, __map, function(path, previousState, changedState) {
      __map.delete(previousState);
      __map.set(changedState, path);
    });

    return nextState;
  };
};

function transformBatchArgsToUpdateMeta(map, state, batchArgs) {
  return batchArgs.map(([key, newValue]) => {
    const updatePath = map.get(key);
    return [updatePath, newValue];
  });
}

function walkTreeAndFindChanges(previousState, nextState, map, callMeWhenChanged, path = 'root') {
  // exit if unchanged
  if(map.get(previousState) && map.get(previousState) === map.get(nextState)) return nextState;

  let changedState = null;
  if(isArray(nextState)) {
    changedState = nextState.map((e, i) =>
      walkTreeAndFindChanges((previousState || [])[i], e, map, callMeWhenChanged, `${path}.${i}`)
    );
  }

  else if(isObject(nextState)) {
    const dirtyNextState = {};
    Object.keys(nextState).forEach(key => {
      dirtyNextState[key] = walkTreeAndFindChanges(
        (previousState || {})[key], nextState[key], map, callMeWhenChanged, `${path}.${key}`
      );
    });
    changedState = dirtyNextState;
  }

  else {
    // wrap primitives
    changedState = new PrimitiveWrapper(nextState);
  }

  // notify changes
  callMeWhenChanged(path, previousState, changedState);

  // carry on...
  return changedState;
}

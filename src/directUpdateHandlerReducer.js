const { ACTION_DIRECT_UPDATE } = require('./constants');
const { deepPlant } = require('./utils');

module.exports = function createDirectUpdateHandler(map) {
  return function directUpdateHandlerReducer(previousState, action) {
    // un update;
    if(action.type === ACTION_DIRECT_UPDATE) {
      let { batchArgs } = action;
      if(typeof batchArgs === 'function') batchArgs = batchArgs();

      const updateMeta = transformBatchArgsToUpdateMeta(map, previousState, batchArgs);

      // return newly updated state
      return updateMeta.reduce((prevState, meta) => {
        const [updatePath, nextValue] = meta;
        return deepPlant(prevState, updatePath, typeof nextValue === 'function' ? nextValue : () => nextValue);
      }, previousState);
    }

    return previousState;
  };
};

function transformBatchArgsToUpdateMeta(map, state, batchArgs) {
  return batchArgs.filter(x => x).map(([key, newValue]) => {
    if(typeof key !== 'object') {
      throw new Error('Update path is NOT correct. Did you pass a primitive value itself as the update key?');
    }
    return [map.get(key), newValue];
  });
}

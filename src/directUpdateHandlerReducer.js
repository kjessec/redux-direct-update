const { ACTION_DIRECT_UPDATE } = require('./constants');
const { deepPlant } = require('./utils');
const { PrimitiveTransaction } = require('./constants');

module.exports = function createDirectUpdateHandler(map, proxyHandler) {
  return function directUpdateHandlerReducer(previousState, action) {
    // un update;
    if(action.type === ACTION_DIRECT_UPDATE) {
      const { batchArgs } = action;
      proxyHandler.directUpdateTransaction = true;
      const updateMeta = transformBatchArgsToUpdateMeta(map, previousState, batchArgs());
      proxyHandler.directUpdateTransaction = false;

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
  return batchArgs.map(([key, newValue]) => {
    if(typeof key !== 'object') {
      throw new Error('Update path is NOT correct. Did you pass a primitive value itself as the update key?');
    }
    const updatePath = key instanceof PrimitiveTransaction ? key.path : map.get(key);
    return [updatePath, newValue];
  });
}

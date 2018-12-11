const { ACTION_DIRECT_UPDATE } = require('./constants');
const dotprop = require('dot-prop-immutable');

module.exports = function createDirectUpdateHandler(map) {
  return function directUpdateHandlerReducer(previousState, action) {
    // un update;
    if(action.type === ACTION_DIRECT_UPDATE) {
      const { directUpdateDescriptor } = action;
      const updateMeta = transformdirectUpdateDescriptorToUpdateMeta(map, previousState, directUpdateDescriptor);

      // return newly updated state
      return updateMeta.reduce((prevState, meta) => {
        const [updatePath, nextValue] = meta;
        if(!updatePath) return (typeof nextValue === 'function' ? nextValue(prevState) : nextValue);
        else return dotprop.set(prevState, updatePath, nextValue);
      }, previousState);
    }

    return previousState;
  };
};

function transformdirectUpdateDescriptorToUpdateMeta(map, state, directUpdateDescriptor) {
  return directUpdateDescriptor.filter(x => x).map(([key, newValue]) => {
    if(typeof key !== 'object') {
      throw new Error('Update path is NOT correct. Did you pass a primitive value itself as the update key?');
    }
    return [map.get(key), newValue];
  });
}

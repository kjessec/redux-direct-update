const directUpdate = require('./directUpdate');
const createDirectUpdateHandlerReducer = require('./directUpdateHandlerReducer');
const createDirectUpdatePostprocessingReducer = require('./directUpdatePostprocessingReducer');
const { sequencialReducerComposer } = require('./utils');

const directUpdateEnhancer = createStore => (defaultReducer, preloadedState, enhancer) => {
  const map = new WeakMap();

  const enhancedReducer = sequencialReducerComposer(
    createDirectUpdateHandlerReducer(map),
    defaultReducer,
    createDirectUpdatePostprocessingReducer(map)
  );
  const store = createStore(enhancedReducer, preloadedState, enhancer);

  // assign this store context to directUpdate!
  directUpdate.assignContext(store);

  return {
    ...store,
    directUpdate
  };
};

module.exports = directUpdateEnhancer;

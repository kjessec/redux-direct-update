const directUpdate = require('./directUpdate');
const directUpdateReducerCreator = require('./directUpdateReducer');
const { sequencialReducerComposer } = require('./utils');

const directUpdateEnhancer = createStore => (reducer, preloadedState, enhancer) => {
  const enhancedReducer = sequencialReducerComposer(
    reducer,
    directUpdateReducerCreator()
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

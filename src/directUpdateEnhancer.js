const directUpdate = require('./directUpdate');
const createDirectUpdateHandlerReducer = require('./directUpdateHandlerReducer');
const createDirectUpdatePostprocessingReducer = require('./directUpdatePostprocessingReducer');
const { sequencialReducerComposer } = require('./utils');
const createProxyHandler = require('./createProxyHandler');


const directUpdateEnhancer = createStore => (defaultReducer, preloadedState, enhancer) => {
  const map = new WeakMap();
  const proxyHandler = createProxyHandler(map);

  const enhancedReducer = sequencialReducerComposer(
    createDirectUpdateHandlerReducer(map, proxyHandler),
    defaultReducer,
    createDirectUpdatePostprocessingReducer(map, proxyHandler)
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

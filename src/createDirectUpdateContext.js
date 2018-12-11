const createDirectUpdateHandlerReducer = require('./directUpdateHandlerReducer');
const createDirectUpdatePostprocessingReducer = require('./directUpdatePostprocessingReducer');

module.exports = function createDirectUpdateContext() {
    const map = new WeakMap();
    const directUpdateHandlerReducer = createDirectUpdateHandlerReducer(map);
    const directUpdatePostprocessingReducer = createDirectUpdatePostprocessingReducer(map);

    return {
        map,
        directUpdateHandlerReducer,
        directUpdatePostprocessingReducer
    };
}
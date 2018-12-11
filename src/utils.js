exports.isArray = Array.isArray;
exports.isObject = obj => obj === Object(obj);
exports.sequencialReducerComposer = (...reducers) => (state, action) => reducers.reduce((t, f) => f(t, action), state);
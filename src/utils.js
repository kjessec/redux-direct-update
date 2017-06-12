exports.isArray = Array.isArray;
exports.isObject = obj => obj === Object(obj);
exports.sequencialReducerComposer = (...reducers) => (state, action) => reducers.reduce((t, f) => f(t, action), state);

const PrimitiveWrapper = require('./PrimitiveWrapper');
exports.deepPlant = function deepPlantWithPrimitiveWrapperFlatten(source, path, reduce) {
  const sepPath = path.split('.').slice(1);
  return recursivePlant(source, sepPath, reduce);
};

function recursivePlant(state, sepPath, reduce) {
  const path = sepPath[0];

  // if path cannot be found, return false
  let nextState = null;


  // if we reached here, we're at the tail
  // reduce as needed
  if(!path) return sanitize(reduce(state));

  // go on....
  nextState = sanitize(state);

  // update
  if(sepPath.length) {
    nextState[path] = recursivePlant(nextState[path], sepPath.slice(1), reduce);
  }

  // return
  return nextState;
}

function sanitize(state) {
  // sanitize
  if(exports.isArray(state)) {
    return state.map(flattenIfWrappedPrimitive);
  }

  else if(exports.isObject(state)) {
    const nextState = {};
    Object.keys(state).forEach(key => {
      nextState[key] = state[key];
    });
    return nextState;
  }

  return state;
}

function flattenIfWrappedPrimitive(value) {
  return value instanceof PrimitiveWrapper ? value.valueOf() : value;
}

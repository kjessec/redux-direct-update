'use strict';

exports.isArray = Array.isArray;
exports.isObject = function (obj) {
  return obj === Object(obj);
};
exports.sequencialReducerComposer = function () {
  for (var _len = arguments.length, reducers = Array(_len), _key = 0; _key < _len; _key++) {
    reducers[_key] = arguments[_key];
  }

  return function (state, action) {
    return reducers.reduce(function (t, f) {
      return f(t, action);
    }, state);
  };
};

exports.deepPlant = function deepPlantWithPrimitiveWrapperFlatten(source, path, reduce) {
  var sepPath = path.split('.').slice(1);
  return recursivePlant(source, sepPath, reduce);
};

function recursivePlant(state, sepPath, reduce) {
  var path = sepPath[0];

  // if path cannot be found, return false
  var nextState = null;

  // if we reached here, we're at the tail
  // reduce as needed
  if (!path) return sanitize(reduce(state));

  // go on....
  nextState = sanitize(state);

  // update
  if (sepPath.length) {
    nextState[path] = recursivePlant(nextState[path], sepPath.slice(1), reduce);
  }

  // return
  return nextState;
}

function sanitize(state) {
  // sanitize
  if (exports.isArray(state)) {
    return state.slice(0);
  } else if (exports.isObject(state)) {
    var nextState = {};
    Object.keys(state).forEach(function (key) {
      nextState[key] = state[key];
    });
    return nextState;
  }

  return state;
}
"use strict";

var _require = require('./constants'),
    ACTION_DIRECT_UPDATE = _require.ACTION_DIRECT_UPDATE;

module.exports = function createDirectUpdateFn(dispatch) {
  return function directUpdateFn(directUpdateDescriptor) {
    return dispatch({
      type: ACTION_DIRECT_UPDATE,
      directUpdateDescriptor: directUpdateDescriptor
    });
  };
};
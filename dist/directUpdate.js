'use strict';

// exports directUpdate context
// this is basically IoC container,
var storeContext = null;

var _require = require('./constants'),
    ACTION_DIRECT_UPDATE = _require.ACTION_DIRECT_UPDATE;

function directUpdate(batchArgs) {
  if (storeContext === null) throw new Error('directUpdate isn\'t assigned a store context yet.');

  // relay batchArgs to directUpdateReducer
  storeContext.dispatch({
    type: ACTION_DIRECT_UPDATE,
    batchArgs: batchArgs
  });
}

directUpdate.assignContext = function (store) {
  storeContext = store;
};

module.exports = directUpdate;
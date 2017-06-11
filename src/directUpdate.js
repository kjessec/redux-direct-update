// exports directUpdate context
// this is basically IoC container,
let storeContext = null;
const { ACTION_DIRECT_UPDATE } = require('./constants');
function directUpdate(batchArgs) {
  if(storeContext === null) throw new Error('directUpdate isn\'t assigned a store context yet.');

  // relay batchArgs to directUpdateReducer
  storeContext.dispatch({
    type: ACTION_DIRECT_UPDATE,
    batchArgs
  });
}

directUpdate.assignContext = store => { storeContext = store; };

module.exports = directUpdate;

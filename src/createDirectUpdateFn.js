const { ACTION_DIRECT_UPDATE } = require('./constants');
module.exports = function createDirectUpdateFn(dispatch) {
    return function directUpdateFn(directUpdateDescriptor) {
        return dispatch({
            type: ACTION_DIRECT_UPDATE,
            directUpdateDescriptor
        });
    };
}
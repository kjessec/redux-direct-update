'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('./constants'),
    ACTION_DIRECT_UPDATE = _require.ACTION_DIRECT_UPDATE;

var _require2 = require('./utils'),
    deepPlant = _require2.deepPlant;

module.exports = function createDirectUpdateHandler(map) {
  return function directUpdateHandlerReducer(previousState, action) {
    // un update;
    if (action.type === ACTION_DIRECT_UPDATE) {
      var batchArgs = action.batchArgs;

      if (typeof batchArgs === 'function') batchArgs = batchArgs();

      var updateMeta = transformBatchArgsToUpdateMeta(map, previousState, batchArgs);

      // return newly updated state
      return updateMeta.reduce(function (prevState, meta) {
        var _meta = _slicedToArray(meta, 2),
            updatePath = _meta[0],
            nextValue = _meta[1];

        return deepPlant(prevState, updatePath, typeof nextValue === 'function' ? nextValue : function () {
          return nextValue;
        });
      }, previousState);
    }

    return previousState;
  };
};

function transformBatchArgsToUpdateMeta(map, state, batchArgs) {
  return batchArgs.filter(function (x) {
    return x;
  }).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        newValue = _ref2[1];

    if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) !== 'object') {
      throw new Error('Update path is NOT correct. Did you pass a primitive value itself as the update key?');
    }
    return [map.get(key), newValue];
  });
}
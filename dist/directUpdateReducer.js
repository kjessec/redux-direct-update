'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('./constants'),
    ACTION_DIRECT_UPDATE = _require.ACTION_DIRECT_UPDATE;

var _require2 = require('./utils'),
    deepPlant = _require2.deepPlant,
    isArray = _require2.isArray,
    isObject = _require2.isObject;

var _require3 = require('./constants'),
    PrimitiveTransaction = _require3.PrimitiveTransaction;

var createProxyHandler = require('./createProxyHandler');

module.exports = function directUpdateReducerCreator() {
  // global map
  var map = new WeakMap();
  var proxyHandler = createProxyHandler(map);

  return function directUpdateReducer(previousState, action) {
    var nextState = previousState;
    var type = action.type,
        batchArgs = action.batchArgs;

    // if direct update action, do something

    if (type === ACTION_DIRECT_UPDATE) {
      proxyHandler.directUpdateTransaction = true;
      var updateMeta = transformBatchArgsToUpdateMeta(map, previousState, batchArgs());
      proxyHandler.directUpdateTransaction = false;

      var dirtyState = updateMeta.reduce(function (prevState, meta) {
        var _meta = _slicedToArray(meta, 2),
            updatePath = _meta[0],
            nextValue = _meta[1];

        return deepPlant(prevState, updatePath, typeof nextValue === 'function' ? nextValue : function () {
          return nextValue;
        });
      }, previousState);

      nextState = dirtyState;
    }

    nextState = walkTreeAndFindChanges(previousState, nextState, map, proxyHandler, function (path, previousState, changedState) {
      map.set(changedState, path);
    });

    map.set(nextState, 'root');

    return nextState;
  };
};

function transformBatchArgsToUpdateMeta(map, state, batchArgs) {
  return batchArgs.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        newValue = _ref2[1];

    if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) !== 'object') {
      throw new Error('Update path is NOT correct. Did you pass a primitive value itself as the update key?');
    }
    var updatePath = key instanceof PrimitiveTransaction ? key.path : map.get(key);
    return [updatePath, newValue];
  });
}

function walkTreeAndFindChanges(previousState, nextState, map, proxyHandler, callMeWhenChanged) {
  var path = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'root';

  // exit if unchanged
  if (map.has(previousState) && map.get(previousState) === map.get(nextState)) return nextState;

  var changedState = null;
  if (isArray(nextState)) {
    changedState = new Proxy(nextState.slice(0), proxyHandler).map(function (e, i) {
      return walkTreeAndFindChanges((previousState || [])[i], e, map, proxyHandler, callMeWhenChanged, path + '.' + i);
    });

    callMeWhenChanged(path, previousState, changedState);
  } else if (isObject(nextState)) {
    var dirtyNextState = {};
    Object.keys(nextState).forEach(function (key) {
      dirtyNextState[key] = walkTreeAndFindChanges((previousState || {})[key], nextState[key], map, proxyHandler, callMeWhenChanged, path + '.' + key);
    });
    changedState = new Proxy(dirtyNextState, proxyHandler);

    callMeWhenChanged(path, previousState, dirtyNextState);
  } else {
    changedState = nextState;
  }

  // carry on...
  return changedState;
}
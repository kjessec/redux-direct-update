"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require('./constants'),
    ACTION_DIRECT_UPDATE = _require.ACTION_DIRECT_UPDATE;

var dotprop = require('dot-prop-immutable');

module.exports = function createDirectUpdateHandler(map) {
  return function directUpdateHandlerReducer(previousState, action) {
    // un update;
    if (action.type === ACTION_DIRECT_UPDATE) {
      var directUpdateDescriptor = action.directUpdateDescriptor;
      var updateMeta = transformdirectUpdateDescriptorToUpdateMeta(map, previousState, directUpdateDescriptor); // return newly updated state

      return updateMeta.reduce(function (prevState, meta) {
        var _meta = _slicedToArray(meta, 2),
            updatePath = _meta[0],
            nextValue = _meta[1];

        if (!updatePath) return typeof nextValue === 'function' ? nextValue(prevState) : nextValue;else return dotprop.set(prevState, updatePath, nextValue);
      }, previousState);
    }

    return previousState;
  };
};

function transformdirectUpdateDescriptorToUpdateMeta(map, state, directUpdateDescriptor) {
  return directUpdateDescriptor.filter(function (x) {
    return x;
  }).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        newValue = _ref2[1];

    if (_typeof(key) !== 'object') {
      throw new Error('Update path is NOT correct. Did you pass a primitive value itself as the update key?');
    }

    return [map.get(key), newValue];
  });
}
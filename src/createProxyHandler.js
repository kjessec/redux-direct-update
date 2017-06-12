const { PrimitiveTransaction } = require('./constants');
module.exports = map => ({
  directUpdateTransaction: false,
  map,
  get(target, prop, receiver) {
    if(
      typeof target[prop] === 'object' ||
      typeof target[prop] === 'undefined' ||
      target[prop] === null
    ) return Reflect.get(target, prop, receiver);

    // primitive + normal read
    if(!this.directUpdateTransaction) {
      return Reflect.get(target, prop, receiver);
    }

    // primitive + directUpdate transaction
    return new PrimitiveTransaction(this.map.get(target), prop);
  }
});

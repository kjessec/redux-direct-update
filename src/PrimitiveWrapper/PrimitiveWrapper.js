module.exports = class PrimitiveWrapper {
  constructor(value) {
    this.value = value;
  }
  valueOf() { return this.value; }
  toString() { return `${this.value}`; }
};

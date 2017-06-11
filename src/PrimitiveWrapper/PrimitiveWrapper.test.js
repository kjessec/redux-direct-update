const test = require('tape');
const PrimitiveWrapper = require('./PrimitiveWrapper');

test('PrimitiveWrapper', function(t) {
  const myValue = new PrimitiveWrapper(2);

  t.equal(myValue + 1, 3, 'ok');
  t.ok(+myValue === 2, 'ok');
  t.end();
});

const test = require('tape');
const { directUpdateEnhancer, directUpdate } = require('./src');
const { createStore, compose } = require('redux');

const initialState = { data: 0 };
const testReducer = function(state, action) {
  switch(action.type) {
    case 'INCREMENT':
      return { ...state, data: state.data + 1 };
    case 'DECREMENT':
      return { ...state, data: state.data - 1 };
    default:
      return state;
  }
};

const ACTION_INCREMENT = { type: 'INCREMENT' };
const ACTION_DECREMENT = { type: 'DECREMENT' };

const createTestStore = loadedInitialState => createStore(
  testReducer, loadedInitialState || initialState, directUpdateEnhancer
);

test('directUpdateMiddleware does not interefere with the default redux behaviour', function(t) {
  const store = createTestStore();
  t.equal(+store.getState().data, 0, 'default state OK');

  store.dispatch(ACTION_INCREMENT);
  t.equal(+store.getState().data, 1, 'action 1 OK');

  store.dispatch(ACTION_DECREMENT);
  t.equal(+store.getState().data, 0, 'action 2 OK');

  t.end();
});

test('directUpdate is attached to store', function(t) {
  const store = createTestStore();

  t.ok(store.directUpdate, 'directUpdate attachment OK');
  t.ok(store.directUpdate === directUpdate, 'identity OK');
  t.end();
});

test('directUpdate works', function(t) {
  const store = createTestStore();
  const state = store.getState();

  store.directUpdate([
    [state.data, 9999]
  ]);

  t.equal(+store.getState().data, 9999, 'works ok');
  t.end();
});

test('functional update works', function(t) {
  const store = createTestStore();
  const state = store.getState();

  store.directUpdate([
    [state.data, state => ({ ...state, added: 1 })]
  ]);


  t.equal(+store.getState().data.added, 1, 'works ok');
  t.end();
});

test('updating store itself works', function(t) {
  const store = createTestStore();
  const state = store.getState();

  store.directUpdate([
    [state, state => ({ ...state, test2: 1 })]
  ]);

  const nextState = store.getState();
  t.equal(+nextState.test2, 1);
  t.equal(+nextState.data, 0);
  t.end();
});

test('complex works', function(t) {
  const sampleData = {
    data: 0,
    jesse: { a: { b: { c: { d: { e: [{ hello: 'hello' }] } } } } },
    supper: [
      { sth: 1 },
      { sth: 2 }
    ]
  };
  const store = createTestStore(sampleData);
  const state = store.getState();

  store.dispatch(ACTION_INCREMENT); // 1
  store.dispatch(ACTION_INCREMENT); // 2
  store.dispatch(ACTION_INCREMENT); // 3
  store.dispatch(ACTION_INCREMENT); // 4
  store.directUpdate([
    [state.jesse.a.b.c.d.e[0].hello, 'goodbye'],
    [state.supper[0].sth, value => value + 1],
    [state.supper[1].sth, 3333333]
  ]);
  store.dispatch(ACTION_INCREMENT); // 5
  store.dispatch(ACTION_INCREMENT); // 6
  store.dispatch(ACTION_INCREMENT); // 7
  const nextState1 = store.getState();
  store.directUpdate([
    [nextState1.supper[1].sth, 1]
  ]);
  store.dispatch(ACTION_INCREMENT); // 8

  const nextState = store.getState();
  t.equal(+nextState.data, 8);
  t.ok(nextState.jesse.a.b.c.d.e[0].hello.valueOf() === 'goodbye');
  t.equal(+nextState.supper[0].sth, 2);
  t.equal(+nextState.supper[1].sth, 1);
  t.end();
});

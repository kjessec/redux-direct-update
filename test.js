const test = require('tape');
const { createDirectUpdateContext, createDirectUpdateFn, composeReducers } = require('./src');
const { createStore } = require('redux');

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

function createTestStore(loadedInitialState) {
  const directUpdateContext = createDirectUpdateContext();
  const directUpdateEnabledReducer = composeReducers(
    directUpdateContext.directUpdateHandlerReducer,
    testReducer,
    directUpdateContext.directUpdatePostprocessingReducer
  );
  const store = createStore(directUpdateEnabledReducer, loadedInitialState || initialState);
  const directUpateFn = store.directUpdate = createDirectUpdateFn(store.dispatch);

  return store;
}

test('directUpdateMiddleware does not interefere with the default redux behaviour', function(t) {
  const store = createTestStore();
  t.equal(store.getState().data, 0, 'default state OK');

  store.dispatch(ACTION_INCREMENT);
  t.equal(store.getState().data, 1, 'action 1 OK');

  store.dispatch(ACTION_DECREMENT);
  t.equal(store.getState().data, 0, 'action 2 OK');

  t.end();
});

test('directUpdateMiddleware does not interefere with the default redux behaviour (reference transparency)', function(t) {
  const store = createTestStore({
    a: { b: { c: { d: { e: 1 } } } },
    data: 0
  });

  const state1 = store.getState();
  store.dispatch(ACTION_INCREMENT);
  const state2 = store.getState();
  t.notEqual(state1, state2, 'ok');
  t.notEqual(state1.data, state2.data, 'ok');
  t.equal(state1.a, state2.a, 'ok');

  t.end();
});

test('directUpdate is attached to store', function(t) {
  const store = createTestStore();

  t.ok(store.directUpdate, 'directUpdate attachment OK');
  t.end();
});

test('directUpdate works', function(t) {
  const store = createTestStore();
  const state = store.getState();

  store.directUpdate([
    [state, state => ({ ...state, data: 9999 })]
  ]);

  t.equal(store.getState().data, 9999, 'works ok');
  t.end();
});

test('functional update works', function(t) {
  const store = createTestStore();
  const state = store.getState();

  store.directUpdate([
    [state, state => ({ ...state, added: 1 })]
  ]);

  t.equal(store.getState().added, 1, 'works ok');
  t.end();
});

test('updating store itself works', function(t) {
  const store = createTestStore();
  const state = store.getState();

  store.directUpdate([
    [state, state => ({ ...state, test2: 1 })]
  ]);

  const nextState = store.getState();

  t.equal(nextState.test2, 1);
  t.equal(nextState.data, 0);
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
    [state.jesse.a.b.c.d.e[0], state => ({ ...state, hello: 'goodbye' })],
    [state.supper[0], state => ({ ...state, sth: 3 })],
    [state.supper[1], state => ({ ...state, sth: 3333333 })]
  ]);
  store.dispatch(ACTION_INCREMENT); // 5
  store.dispatch(ACTION_INCREMENT); // 6
  store.dispatch(ACTION_INCREMENT); // 7
  const nextState1 = store.getState();
  store.directUpdate([
    [nextState1.supper[1], state => ({ ...state, sth: 5 })]
  ]);
  store.dispatch(ACTION_INCREMENT); // 8

  const nextState = store.getState();
  t.equal(nextState.data, 8);
  t.ok(nextState.jesse.a.b.c.d.e[0].hello === 'goodbye');
  t.equal(nextState.supper[0].sth, 3);
  t.equal(nextState.supper[1].sth, 5);
  t.end();
});

test('stress test', function(t) {
  const sampleComplexData = {
    a: { b: { c: { d: { e: { f: { g: { h: 1 } } } } } } }
  };
  const store = createTestStore(sampleComplexData);

  for(let i=0; i<200; i++) {
    const state = store.getState();
    store.directUpdate([
      [state.a.b.c.d.e.f.g, state => ({ ...state, h: state.h+1 })]
    ]);
  }

  t.ok(true);
  t.end();
});

test('passing refs to other function', function(t) {
  const sampleComplexData = {
    a: { b: { c: { d: { e: { f: [{ g: { h: 4 } }] } } } } }
  };
  const store = createTestStore(sampleComplexData);

  const updateInFunction = (variable, target) => {
    store.directUpdate([
      [variable, state => ({ ...state, h: target })]
    ]);
  };

  const state = store.getState();
  updateInFunction(state.a.b.c.d.e.f[0].g, 4444);
  t.deepEqual(store.getState().a.b.c.d.e.f[0].g, { h: 4444 });

  console.log('final', store.getState().a.b.c.d.e);

  t.end();
});

import expect from 'unexpected';

import Fragment from '../../../../src/fragment';

class Foo extends Fragment {}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

fixture('Fragment :: 130 #getPersistedState()')
  .page(__dirname + '/index.html');

test("010 It should throw error when 'id' argument is not a non-blank string", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    foo.getPersistedState(42);
  }
  catch (e) {
    const message = "'id' argument must be a non-blank string but it is Number (42)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when state persisted under specified id is not exist", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    foo.getPersistedState('42');
  }
  catch (e) {
    const message = "Persisted state with id '42' does not exist";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should return persisted state", async () => {
  const foo = new Foo();
  const persistedState42 = {};

  foo._persistedStates['42'] = persistedState42;

  const state = foo.getPersistedState('42');
  expect(state === persistedState42, 'to be true');
  expect(state, 'to equal', {});
});

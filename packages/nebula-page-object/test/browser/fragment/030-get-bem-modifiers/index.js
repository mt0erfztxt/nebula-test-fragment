import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../../src/fragment';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

class Foobar extends Fragment {}

Object.defineProperties(Foobar, {
  bemBase: {
    value: 'foobar'
  },
  displayName: {
    value: 'Foobar'
  }
});

fixture `Fragment :: 030 #getBemModifiers()`
  .page(__dirname + '/index.html');

test("010 It should throw error when 'modifierName' argument is not a nil or a non-blank string", async (t) => {
  const foobar = new Foobar();
  await t.expect(foobar.selector.count).gte(1);

  // -- 1

  let isThrown = false;

  try {
    await foobar.getBemModifiers('');
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'modifierName' argument must be a nil or a non-blank string but it is String ()"
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // -- 2

  isThrown = false;

  try {
    await foobar.getBemModifiers('  ');
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'modifierName' argument must be a nil or a non-blank string but it is String (  )"
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // -- 3

  isThrown = false;

  try {
    await foobar.getBemModifiers(1);
  }
  catch (e) {
    expect(
      e.message,
      'to equal',
      "'modifierName' argument must be a nil or a non-blank string but it is Number (1)"
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when fragment's selector not return DOM elements", async (t) => {
  class NonExistent extends Fragment {}

  Object.defineProperties(NonExistent, {
    bemBase: {
      value: 'non-existent'
    },
    displayName: {
      value: 'NonExistent'
    }
  });

  const nonExistent = new NonExistent();
  await t.expect(nonExistent.selector.count).eql(0);

  let isThrown = false;

  try {
    await nonExistent.getBemModifiers();
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*'NonExistent' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when fragment's selector return more than one DOM element", async (t) => {
  class Multiple extends Fragment {}

  Object.defineProperties(Multiple, {
    bemBase: {
      value: 'multiple'
    },
    displayName: {
      value: 'Multiple'
    }
  });

  const multiple = new Multiple();
  await t.expect(multiple.selector.count).gte(1);

  let isThrown = false;

  try {
    await multiple.getBemModifiers();
  }
  catch (e) {
    expect(
      e.errMsg,
      'to match',
      /.*'Multiple' fragment's selector must return exactly one DOM element but it doesn't: expected 2.*/
    );

    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should return array that contains all BEM modifiers when 'modifierName' argument is nil", async () => {
  class FizBuz extends Fragment {}

  Object.defineProperties(FizBuz, {
    bemBase: {
      value: 'fiz--buz'
    },
    displayName: {
      value: 'FizBuz'
    }
  });

  const foobar = new Foobar();
  const foobarBemModifiers = await foobar.getBemModifiers();
  expect(foobarBemModifiers, 'to equal', [
    ['mod1'],
    ['no-mod2'],
    ['mod3', 'val']
  ]);

  // -- Check case of fragment built on BEM base with modifier.

  const fizBuz = new FizBuz();
  const fizBuzModifiers = await fizBuz.getBemModifiers();
  expect(fizBuzModifiers, 'to equal', [
    ['buz'],
    ['id', '42'],
    ['invalid']
  ]);
});

test("050 It should return array that contains only matching BEM modifiers when 'modifierName' argument is not nil", async () => {
  class Bar1 extends Fragment {}

  Object.defineProperties(Bar1, {
    bemBase: {
      value: 'bar1'
    },
    displayName: {
      value: 'Bar1'
    }
  });

  const bar1 = new Bar1();
  expect(await bar1.getBemModifiers('mod1'), 'to equal', [
    ['mod1']
  ]);
  expect(await bar1.getBemModifiers('mod3'), 'to equal', [
    ['mod3', 'val']
  ]);

  class Bar2 extends Fragment {}

  Object.defineProperties(Bar2, {
    bemBase: {
      value: 'bar2'
    },
    displayName: {
      value: 'Bar2'
    }
  });

  const bar2 = new Bar2();
  expect(await bar2.getBemModifiers('mod3'), 'to equal', [
    ['mod3', 'val'],
    ['mod3', 'foo']
  ]);

  // -- Check case of fragment built on BEM base with modifier.

  class Bar3Foo extends Fragment {}

  Object.defineProperties(Bar3Foo, {
    bemBase: {
      value: 'bar3--foo'
    },
    displayName: {
      value: 'Bar3Foo'
    }
  });

  const bar3Foo = new Bar3Foo();
  expect(await bar3Foo.getBemModifiers('mod4'), 'to equal', [
    ['mod4', 'val341']
  ]);

  class Bar4Foo extends Fragment {}

  Object.defineProperties(Bar4Foo, {
    bemBase: {
      value: 'bar4--foo'
    },
    displayName: {
      value: 'Bar4Foo'
    }
  });

  const bar4Foo = new Bar4Foo();
  expect(await bar4Foo.getBemModifiers('mod5'), 'to equal', [
    ['mod5', 'val451'],
    ['mod5', 'val452']
  ]);
});

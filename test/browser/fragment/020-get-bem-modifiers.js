import appRootPath from 'app-root-path';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../src/fragment';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `Fragment :: 020 #getBemModifiers()`
  .page(appRootPath.path + '/test/fixtures/fragment/020-get-bem-modifiers.html');

test("010 It should throw error when `modifierName` argument is not a nil or a non-blank string", async (t) => {
  let isThrown = false;
  let msg;
  const fragment = new Fragment(null, { bemBase: 'foobar' });

  await t.expect(fragment.selector.count).gte(1);

  // 1
  try {
    await fragment.getBemModifiers('');
  }
  catch (e) {
    msg = "'modifierName' argument must be a nil or a non-blank string but it is String ()";
    expect(e.message, 'to equal', msg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 2
  isThrown = false;

  try {
    await fragment.getBemModifiers('  ');
  }
  catch (e) {
    msg = "'modifierName' argument must be a nil or a non-blank string but it is String (  )";
    expect(e.message, 'to equal', msg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // 3
  isThrown = false;

  try {
    await fragment.getBemModifiers(1);
  }
  catch (e) {
    msg = "'modifierName' argument must be a nil or a non-blank string but it is Number (1)";
    expect(e.message, 'to equal', msg);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when fragment's selector not return DOM elements", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, { bemBase: 'non-existent' });

  await t.expect(fragment.selector.count).eql(0);

  try {
    await fragment.getBemModifiers();
  }
  catch (e) {
    const msgPattern = /.*'Fragment' fragment's selector must return exactly one DOM element but it doesn't: expected 0.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when fragment's selector return more than one DOM element", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, { bemBase: 'multiple' });

  await t.expect(fragment.selector.count).gte(1);

  try {
    await fragment.getBemModifiers();
  }
  catch (e) {
    const msgPattern = /.*'Fragment' fragment's selector must return exactly one DOM element but it doesn't: expected 2.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should return array that contains all BEM modifiers when `modifierName` argument is nil", async () => {
  const foobar = new Fragment(null, { bemBase: 'foobar' });
  const foobarBemModifiers = await foobar.getBemModifiers();
  expect(foobarBemModifiers, 'to equal', [
    ['mod1'],
    ['no-mod2'],
    ['mod3', 'val']
  ]);

  // -- Check case of fragment built on BEM base with modifier.

  const fizBuz = new Fragment(null, { bemBase: 'fiz--buz' });
  const fizBuzModifiers = await fizBuz.getBemModifiers();
  expect(fizBuzModifiers, 'to equal', [
    ['buz'],
    ['id', '42'],
    ['invalid']
  ]);
});

test("060 It should return array that contains only matching BEM modifiers when `modifierName` argument is not nil", async () => {
  const bar1 = new Fragment(null, { bemBase: 'bar1' });
  expect(await bar1.getBemModifiers('mod1'), 'to equal', [
    ['mod1']
  ]);
  expect(await bar1.getBemModifiers('mod3'), 'to equal', [
    ['mod3', 'val']
  ]);

  const bar2 = new Fragment(null, { bemBase: 'bar2' });
  expect(await bar2.getBemModifiers('mod3'), 'to equal', [
    ['mod3', 'val'],
    ['mod3', 'foo']
  ]);

  // -- Check case of fragment built on BEM base with modifier.

  const bar3 = new Fragment(null, { bemBase: 'bar3--foo' });
  expect(await bar3.getBemModifiers('mod4'), 'to equal', [
    ['mod4', 'val341']
  ]);

  const bar4 = new Fragment(null, { bemBase: 'bar4--foo' });
  expect(await bar4.getBemModifiers('mod5'), 'to equal', [
    ['mod5', 'val451'],
    ['mod5', 'val452']
  ]);
});

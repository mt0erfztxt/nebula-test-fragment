import appRootPath from 'app-root-path';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import {Fragment} from '../../../src';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `Fragment :: 010 #expectIsExist() and #expectIsNotExist()`
  .page(appRootPath.path + '/test/fixtures/fragment/010-expect-is-exist.html');

test("010 It should throw error when fragment's selector must not exist but it does", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, {bemBase: 'foo'});

  await t.expect(fragment.selector.count).eql(1);

  try {
    await fragment.expectIsExist({isNot: true});
  }
  catch (e) {
    const msgPattern = /.*'Fragment' fragment's selector must not return DOM elements but it does.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should not throw error when fragment's selector must not exist and it doesn't", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, {bemBase: 'non-existent'});

  await t.expect(fragment.selector.count).eql(0);

  try {
    await fragment.expectIsExist({isNot: true});
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("030 It should throw when fragment's selector must exist but is doesn't (case when `options.allowMultiple` is truthy)", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, {bemBase: 'non-existent'});

  await t.expect(fragment.selector.count).eql(0);

  try {
    await fragment.expectIsExist({allowMultiple: true, isNot: false});
  }
  catch (e) {
    const msgPattern = /.*'Fragment' fragment's selector must return one or more DOM elements but it doesn't.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw when fragment's selector must exist but it doesn't (case when `options.allowMultiple` is falsey)", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, {bemBase: 'non-existent'});

  await t.expect(fragment.selector.count).eql(0);

  try {
    await fragment.expectIsExist({allowMultiple: false, isNot: false});
  }
  catch (e) {
    const msgPattern = /.*'Fragment' fragment's selector must return exactly one DOM element but it doesn't.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should throw when fragment's selector does exist and returns multiple DOM elements but `options.allowMultiple` is falsey", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, {bemBase: 'bar'});

  await t.expect(fragment.selector.count).eql(2);

  try {
    await fragment.expectIsExist({allowMultiple: false});
  }
  catch (e) {
    const msgPattern = /.*'Fragment' fragment's selector must return exactly one DOM element but it doesn't.*2.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("060 It should not throw when fragment's selector must exist and it does", async () => {
  await new Fragment(null, {bemBase: 'foo'}).expectIsExist();
  await new Fragment(null, {bemBase: 'foo'}).expectIsExist({allowMultiple: true});
  await new Fragment(null, {bemBase: 'bar'}).expectIsExist({allowMultiple: true});
});

test("070 It should allow to set custom message for error using `options.message` argument", async (t) => {
  let isThrown = false;
  const fragment = new Fragment(null, {bemBase: 'non-existent'});

  await t.expect(fragment.selector.count).eql(0);

  try {
    await fragment.expectIsExist({message: 'Custom error message'});
  }
  catch (e) {
    const msgPattern = /.*Custom error message.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("080 It should have complementary method named `expectIsNotExist", async () => {
  const fragment1 = new Fragment(null, {bemBase: 'non-existent'});
  const expectIsExistSpy1 = sinon.spy(fragment1, 'expectIsExist');
  await fragment1.expectIsNotExist();
  expect(expectIsExistSpy1, 'was called times', 1);
  expect(expectIsExistSpy1, 'to have a call satisfying', {args: [{allowMultiple: false, isNot: true}]});

  const fragment2 = new Fragment(null, {bemBase: 'bar'});
  const expectIsExistSpy2 = sinon.spy(fragment2, 'expectIsExist');
  await fragment2.expectIsNotExist({allowMultiple: true, isNot: true});
  expect(expectIsExistSpy2, 'was called times', 1);
  expect(expectIsExistSpy2, 'to have a call satisfying', {args: [{allowMultiple: true, isNot: false}]});
});


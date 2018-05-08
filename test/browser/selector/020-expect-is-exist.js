import appRootPath from 'app-root-path';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';
import {Selector} from 'testcafe';

import selector from '../../../src/selector';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `selector :: 020 expectIsExist`
  .page(appRootPath.path + '/test/fixtures/selector/020-expect-is-exist.html');

test("010 It throws when selector does exist but it must not", async (t) => {
  const sel = Selector('.a');
  await t.expect(sel.count).eql(1);

  try {
    await selector.expectIsExist(sel, {isNot: true});
  }
  catch (e) {
    expect(e.errMsg, 'to match', /.*Selector must not return DOM elements but it does.*/);
  }
});

test("020 It does not throw when selector that must not exist does not exist", async (t) => {
  const sel = Selector('.non-existent');
  await t.expect(sel.count).eql(0);
  await selector.expectIsExist(sel, {isNot: true});
});

test("030 It throws when selector does not exist but it must (case when `options.allowMultiple` is falsey)", async (t) => {
  const sel = Selector('.non-existent');
  await t.expect(sel.count).eql(0);

  try {
    await selector.expectIsExist(sel);
  }
  catch (e) {
    expect(e.errMsg, 'to match', /.*Selector must return only one DOM element but it doesn't.*/);
  }
});

test("040 It throws when selector does not exist but it must (case when `options.allowMultiple` is truthy)", async (t) => {
  const sel = Selector('.non-existent');
  await t.expect(sel.count).eql(0);

  try {
    await selector.expectIsExist(sel, {allowMultiple: true});
  }
  catch (e) {
    expect(e.errMsg, 'to match', /.*Selector must return one or more DOM elements but it doesn't.*/);
  }
});

test("050 It throws when selector does exist and returns multiple DOM elements but `options.allowMultiple` is falsey", async (t) => {
  const sel = Selector('.b');
  await t.expect(sel.count).eql(2);

  try {
    await selector.expectIsExist(sel, {allowMultiple: false});
  }
  catch (e) {
    expect(e.errMsg, 'to match', /.*Selector must return only one DOM element but it doesn't.*2.*/);
  }
});

test("060 It does not throw when selector that must exist does exist", async () => {
  await selector.expectIsExist(Selector('.a'));
  await selector.expectIsExist(Selector('.a'), {allowMultiple: true});
  await selector.expectIsExist(Selector('.b'), {allowMultiple: true});
});

test("070 It allows to set custom message for error using `options.message` argument", async () => {
  try {
    await selector.expectIsExist(Selector('.non-existent'), {message: 'Custom error message'});
  }
  catch (e) {
    expect(e.errMsg, 'to match', /.*Custom error message.*/);
  }
});

test("080 It has complementary helper named `expectIsNotExist", async (t) => {
  const expectIsExistSpy = sinon.spy(selector, 'expectIsExist');
  await selector.expectIsNotExist('.non-existent');
  expect(expectIsExistSpy, 'was called times', 1);
  expect(expectIsExistSpy, 'to have a call satisfying', {args: ['.non-existent', {isNot: true}]})
});
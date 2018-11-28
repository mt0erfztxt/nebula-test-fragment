import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../../src/fragment1';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

class Lnk extends Fragment {}

Object.defineProperties(Lnk, {
  bemBase: {
    value: 'lnk'
  },
  displayName: {
    value: 'Lnk'
  }
});

fixture('Fragment :: 200 #expectIsLink()')
  .page(__dirname + '/index.html');

test("010 It should delegate to '#expectExistsAndConformsRequirements()'", async () => {
  const lnk = new Lnk();
  const spy = sinon.spy(lnk, 'expectExistsAndConformsRequirements');
  await lnk.expectIsLink();
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'a' },
      { selector: void(0) }
    ]
  });
});

test("020 It should handle 'href' option", async () => {
  const lnk = new Lnk();
  const spy = sinon.spy(lnk, 'expectExistsAndConformsRequirements');

  // -- Case of string

  await lnk.expectIsLink({ text: 'Link' });
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'a', text: ['Link'] },
      { selector: void(0) }
    ]
  });

  // -- Case of array

  await lnk.expectIsLink({ text: ['Foo', true] });
  expect(spy, 'was called times', 2);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'a', text: ['Foo', true] },
      { selector: void(0) }
    ]
  });
});

test("030 It should handle 'text' option", async () => {
  const lnk = new Lnk();
  const spy = sinon.spy(lnk, 'expectExistsAndConformsRequirements');

  // -- Case of string

  await lnk.expectIsLink({ text: 'Link' });
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'a', text: ['Link'] },
      { selector: void(0) }
    ]
  });

  // -- Case of array

  await lnk.expectIsLink({ text: ['Foo', true] });
  expect(spy, 'was called times', 2);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'a', text: ['Foo', true] },
      { selector: void(0) }
    ]
  });
});

test("040 It should handle 'selector' option", async () => {
  const lnk = new Lnk();
  const spy = sinon.spy(lnk, 'expectExistsAndConformsRequirements');
  await lnk.expectIsLink({ text: 'Bar Link', selector: '.bar-lnk' });
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'a' },
      { selector: '.bar-lnk' }
    ]
  });
});

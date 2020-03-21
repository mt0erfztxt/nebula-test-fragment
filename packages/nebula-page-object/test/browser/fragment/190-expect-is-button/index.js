import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../../src/fragment';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

class Btn extends Fragment {}

Object.defineProperties(Btn, {
  bemBase: {
    value: 'btn'
  },
  displayName: {
    value: 'Btn'
  }
});

fixture('Fragment :: 190 #expectIsButton()')
  .page(__dirname + '/index.html');

test("010 It should delegate to '#expectExistsAndConformsRequirements()'", async () => {
  const btn = new Btn();
  const spy = sinon.spy(btn, 'expectExistsAndConformsRequirements');
  await btn.expectIsButton();
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'button' },
      { selector: void(0) }
    ]
  });
});

test("020 It should handle 'text' option", async () => {
  const btn = new Btn();
  const spy = sinon.spy(btn, 'expectExistsAndConformsRequirements');

  // -- Case of string

  await btn.expectIsButton({ text: 'Button' });
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'button', text: ['Button'] },
      { selector: void(0) }
    ]
  });

  // -- Case of array

  await btn.expectIsButton({ text: ['Foo', true] });
  expect(spy, 'was called times', 2);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'button', text: ['Foo', true] },
      { selector: void(0) }
    ]
  });
});

test("030 It should handle 'selector' option", async () => {
  const btn = new Btn();
  const spy = sinon.spy(btn, 'expectExistsAndConformsRequirements');
  await btn.expectIsButton({ text: 'Bar Button', selector: '.bar-btn' });
  expect(spy, 'was called times', 1);
  expect(spy, 'to have a call satisfying', {
    args: [
      { tagName: 'button' },
      { selector: '.bar-btn' }
    ]
  });
});

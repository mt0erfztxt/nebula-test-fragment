import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../../src/fragment1';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `Fragment :: 060 #expectIndexInParentIs()`
  .page(__dirname + '/index.html');

class Foo extends Fragment {}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

class Bar extends Fragment {}

Object.defineProperties(Bar, {
  bemBase: {
    value: 'bar'
  },
  displayName: {
    value: 'Bar'
  }
});

test("010 It should delegate most of its logic to '#expectIsEqual()'", async () => {
  const foo = new Foo();
  await foo.expectIsExist();

  const barCid1 = new Bar({ cid: '1' });
  await barCid1.expectIsExist();

  const barCid1ConstructorSpy = sinon.spy(barCid1, 'constructor');
  const barCid1ExpectIsEqualSpy = sinon.spy(barCid1, 'expectIsEqual');

  const equalityCheck = function() {};

  await barCid1.expectIndexInParentIs(foo, 0, { equalityCheck });

  expect(barCid1ConstructorSpy, 'was called times', 1);
  expect(barCid1ConstructorSpy, 'to have a call satisfying', {
    args: [
      expect
      .it('to only have keys', ['idx', 'parent'])
      .and('to have own properties', { idx: 0, parent: foo })
    ]
  });

  expect(barCid1ExpectIsEqualSpy, 'was called times', 1);
  expect(barCid1ExpectIsEqualSpy, 'to have a call satisfying', {
    args: [
      expect.it('to be a', Bar),
      { equalityCheck }
    ]
  });

  expect([barCid1ConstructorSpy, barCid1ExpectIsEqualSpy], 'given call order');
});

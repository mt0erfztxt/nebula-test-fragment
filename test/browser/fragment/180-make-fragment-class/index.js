import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../../src/fragment';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture('Fragment :: 180 .makeFragmentClass()')
  .page(__dirname + '/index.html');

test("010 It should throw error when 'stateParts' options is not an array", async () => {
  let isThrown = false;

  try {
    Fragment.makeFragmentClass(Fragment, { stateParts: 'foo' });
  }
  catch (e) {
    const messagePattern = /.*'options.stateParts' argument must be an array but it is String \(foo\).*/;
    expect(e.message, 'to match', messagePattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test
  .before(async (t) => {
    t.ctx.withPartOfStateMixinSpy = sinon.spy(Fragment, 'withPartOfStateMixin');
  })
  .after(async (t) => {
    t.ctx.withPartOfStateMixinSpy.restore();
  })
  ("020 It should mix in state parts behavior using 'stateParts' option as specification", async (t) => {
    const MyFragment = Fragment.makeFragmentClass(Fragment, {
      stateParts: [
        ['disabled', { antonym: 'enabled' }],
        ['fetched'],
        'fetching'
      ]
    });

    /**
     * @name MyFragment#expectIsFetched
     * @param {*} value
     * @return {Promise<void>}
     */

    /**
     * @name MyFragment#expectIsNotFetching
     * @param {*} value
     * @return {Promise<void>}
     */

    Object.defineProperties(MyFragment, {
      bemBase: {
        value: 'myFragment'
      },
      displayName: {
        value: 'MyFragment'
      }
    });

    expect(MyFragment, 'to be a function');
    expect(t.ctx.withPartOfStateMixinSpy, 'was called times', 3);
    expect(t.ctx.withPartOfStateMixinSpy, 'to have calls satisfying', [{
        args: [
          expect.it('to be a function'),
          'disabled',
          { antonym: 'enabled' }
        ]
      },
      {
        args: [
          expect.it('to be a function'),
          'fetched',
          void(0)
        ]
      },
      {
        args: [
          expect.it('to be a function'),
          'fetching',
          void(0)
        ]
      }
    ]);

    const myFragment = new MyFragment();
    expect(myFragment, 'to be a', Fragment);
    expect(myFragment.getDisabledPartOfState, 'to be a function');
    expect(myFragment.expectIsFetched, 'to be a function');
    expect(myFragment.expectIsNotFetching, 'to be a function');
  });

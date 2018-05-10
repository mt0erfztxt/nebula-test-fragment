import appRootPath from 'app-root-path';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import {Fragment} from '../../../src';
import selector from '../../../src/selector';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

fixture `Fragment :: 010 #expectIsExist() and #expectIsNotExist()`
  .page(appRootPath.path + '/test/fixtures/fragment/010-expect-is-exist.html');

test
  .after(async (t) => {
    t.ctx.selectorExpectIsExistSpy.restore();
  })
  ("010 It (expectIsExist) should delegate check to corresponding helper of `selector` module", async (t) => {
    t.ctx.selectorExpectIsExistSpy = sinon.spy(selector, 'expectIsExist');

    const fragment = new Fragment(null, {bemBase: 'foobar'});
    const options = {message: 'Something'};

    await fragment.expectIsExist(options);
    expect(t.ctx.selectorExpectIsExistSpy, 'was called times', 1);
    expect(t.ctx.selectorExpectIsExistSpy, 'to have a call satisfying', {args: [fragment.selector, options]});
  });

test
  .after(async (t) => {
    t.ctx.selectorExpectIsNotExistSpy.restore();
  })
  ("020 It (expectIsNotExist) should delegate check to corresponding helper of `selector` module", async (t) => {
    t.ctx.selectorExpectIsNotExistSpy = sinon.spy(selector, 'expectIsNotExist');

    const fragment = new Fragment(null, {bemBase: 'non-existent'});
    const options = {message: 'Something'};

    await fragment.expectIsNotExist(options);
    expect(t.ctx.selectorExpectIsNotExistSpy, 'was called times', 1);

    // TODO Strange behaviour in next assert.
    //      TestCafe prints "Waiting for an element to appear..." and after
    //      timeout test marked as succeeded.
    // expect(t.ctx.selectorExpectIsNotExistSpy, 'to have a call satisfying', {args: [fragment.selector, options]});
  });

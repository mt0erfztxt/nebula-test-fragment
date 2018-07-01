import appRootPath from 'app-root-path';

import Fragment from '../../../../src/fragment';

class MyFragment extends Fragment {}

Object.defineProperties(MyFragment, {
  bemBase: {
    value: 'myFragment'
  },
  displayName: {
    value: 'MyFragment'
  }
});

fixture `Fragment :: Constructor :: 040 Spec Idx`
  .page(appRootPath.path + '/test/fixtures/fragment/constructor/040-spec-idx.html');

test("010 It uses `spec.idx` argument to filter fragments by 'idx'", async (t) => {
  const myFragment = new MyFragment();
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(10);
  await t.expect(myFragment.selector.nth(0).textContent).eql('MyFragment, idx 0');
  await t.expect(myFragment.selector.nth(1).textContent).eql('MyFragment, idx 1');
  await t.expect(myFragment.selector.nth(2).textContent).eql('MyFragment, idx 2');
  await t.expect(myFragment.selector.nth(3).textContent).eql('MyFragment, cns foo, idx 0');
  await t.expect(myFragment.selector.nth(4).textContent).eql('MyFragment, cns foo, idx 1');
  await t.expect(myFragment.selector.nth(5).textContent).eql('MyFragment, parent, idx 0');
  await t.expect(myFragment.selector.nth(6).textContent).eql('MyFragment, parent, idx 1');
  await t.expect(myFragment.selector.nth(7).textContent).eql('MyFragment, parent, cns foo, idx 0');
  await t.expect(myFragment.selector.nth(8).textContent).eql('MyFragment, parent, cns foo, idx 1');
  await t.expect(myFragment.selector.nth(9).textContent).eql('MyFragment, parent, cns foo, idx 2');

  const myFragmentWithIdx = new MyFragment({ idx: 2 });
  await t.expect(myFragmentWithIdx.selector.textContent).eql('MyFragment, idx 2');
});

test("020 It respects `spec.parent` argument when uses `spec.idx` argument to filter fragments by 'idx'", async (t) => {
  const myFragmentIdxFirst = new MyFragment({ parent: '.parent', idx: 0 });
  await t.expect(myFragmentIdxFirst.selector.textContent).eql('MyFragment, parent, idx 0');
  await t.expect(myFragmentIdxFirst.selector.parent().classNames).eql(['parent']);

  const myFragmentIdxLast = new MyFragment({ parent: '.parent', idx: -1 });
  await t.expect(myFragmentIdxLast.selector.textContent).eql('MyFragment, parent, cns foo, idx 2');
  await t.expect(myFragmentIdxLast.selector.parent().classNames).eql(['parent']);

  const myFragmentIdx1 = new MyFragment({ parent: '.parent', idx: 1 });
  await t.expect(myFragmentIdx1.selector.textContent).eql('MyFragment, parent, idx 1');
  await t.expect(myFragmentIdx1.selector.parent().classNames).eql(['parent']);

  const myFragmentIdx2 = new MyFragment({ parent: '.parent', idx: 2 });
  await t.expect(myFragmentIdx2.selector.textContent).eql('MyFragment, parent, cns foo, idx 0');
  await t.expect(myFragmentIdx2.selector.parent().classNames).eql(['parent']);
});

test("030 It respects `spec.cns` argument when uses `spec.idx` argument to filter fragments by 'idx'", async (t) => {
  const myFragmentIdxFirst = new MyFragment({ cns: 'foo', idx: 0 });
  await t.expect(myFragmentIdxFirst.selector.textContent).eql('MyFragment, cns foo, idx 0');
  await t.expect(myFragmentIdxFirst.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);

  const myFragmentIdxLast = new MyFragment({ cns: 'foo', idx: -1 });
  await t.expect(myFragmentIdxLast.selector.textContent).eql('MyFragment, parent, cns foo, idx 2');
  await t.expect(myFragmentIdxLast.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);

  const myFragmentIdx1 = new MyFragment({ cns: 'foo', idx: 1 });
  await t.expect(myFragmentIdx1.selector.textContent).eql('MyFragment, cns foo, idx 1');
  await t.expect(myFragmentIdx1.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);

  const myFragmentIdx2 = new MyFragment({ cns: 'foo', idx: 2 });
  await t.expect(myFragmentIdx2.selector.textContent).eql('MyFragment, parent, cns foo, idx 0');
  await t.expect(myFragmentIdx2.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);
});

test("040 It respects both `spec.parent` and `spec.cns` arguments when uses `spec.idx` argument to filter fragments by 'idx'", async (t) => {
  const myFragmentFirst = new MyFragment({ parent: '.parent', cns: 'foo', idx: 0 });
  await t.expect(myFragmentFirst.selector.exists).ok();
  await t.expect(myFragmentFirst.selector.textContent).eql('MyFragment, parent, cns foo, idx 0');
  await t.expect(myFragmentFirst.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);
  await t.expect(myFragmentFirst.selector.parent().classNames).eql(['parent']);

  const myFragmentLast = new MyFragment({ parent: '.parent', cns: 'foo', idx: -1 });
  await t.expect(myFragmentLast.selector.exists).ok();
  await t.expect(myFragmentLast.selector.textContent).eql('MyFragment, parent, cns foo, idx 2');
  await t.expect(myFragmentLast.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);
  await t.expect(myFragmentLast.selector.parent().classNames).eql(['parent']);
});

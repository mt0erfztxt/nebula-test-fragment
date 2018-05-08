import appRootPath from 'app-root-path';

import {Fragment} from '../../../src';

class MyFragment extends Fragment {
}

Object.defineProperties(MyFragment, {
  bemBase: {
    value: 'myFragment'
  },
  displayName: {
    value: 'MyFragment'
  }
});

fixture `Fragment :: Constructor :: 030 Spec Cid`
  .page(appRootPath.path + '/test/fixtures/fragment/constructor/030-spec-cid.html');

test("010 It uses `spec.cid` argument to filter fragments by 'cid'", async (t) => {
  const myFragment = new MyFragment();
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(5);
  await t.expect(myFragment.selector.nth(0).textContent).eql('MyFragment');
  await t.expect(myFragment.selector.nth(1).textContent).eql('MyFragment, cid 1');
  await t.expect(myFragment.selector.nth(2).textContent).eql('MyFragment, cns foo, cid 1');
  await t.expect(myFragment.selector.nth(3).textContent).eql('MyFragment, parent, cid 1');
  await t.expect(myFragment.selector.nth(4).textContent).eql('MyFragment, parent, cns foo, cid 1');

  const myFragmentWithCid = new MyFragment({cid: '1'});
  await t.expect(myFragmentWithCid.selector.count).eql(4);
});

test("020 It respects `spec.parent` argument when uses `spec.cid` argument to filter fragments by 'cid'", async (t) => {
  const myFragment = new MyFragment({parent: '.parent'});
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(2);
  await t.expect(myFragment.selector.nth(0).textContent).eql('MyFragment, parent, cid 1');
  await t.expect(myFragment.selector.nth(0).parent().classNames).eql(['parent']);
  await t.expect(myFragment.selector.nth(1).textContent).eql('MyFragment, parent, cns foo, cid 1');
  await t.expect(myFragment.selector.nth(1).parent().classNames).eql(['parent']);
});

test("030 It respects `spec.cns` argument when uses `spec.cid` argument to filter fragments by 'cid'", async (t) => {
  const myFragment = new MyFragment({cns: 'foo'});
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(2);
  await t.expect(myFragment.selector.nth(0).textContent).eql('MyFragment, cns foo, cid 1');
  await t.expect(myFragment.selector.nth(0).classNames).eql(['myFragment', 'myFragment--cns_foo', 'myFragment--cid_1']);
  await t.expect(myFragment.selector.nth(1).textContent).eql('MyFragment, parent, cns foo, cid 1');
  await t.expect(myFragment.selector.nth(1).classNames).eql(['myFragment', 'myFragment--cns_foo', 'myFragment--cid_1']);
});

test("040 It respects both `spec.parent` and `spec.cns` arguments when uses `spec.cid` argument to filter fragments by 'cid'", async (t) => {
  const myFragment = new MyFragment({cns: 'foo', parent: '.parent'});
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(1);
  await t.expect(myFragment.selector.textContent).eql('MyFragment, parent, cns foo, cid 1');
  await t.expect(myFragment.selector.classNames).eql(['myFragment', 'myFragment--cns_foo', 'myFragment--cid_1']);
  await t.expect(myFragment.selector.parent().classNames).eql(['parent']);
});

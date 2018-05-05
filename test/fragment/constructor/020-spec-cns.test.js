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

fixture `Fragment :: Constructor :: 020 Spec Cns`
  .page(appRootPath.path + '/test/fixtures/fragment/constructor/020-spec-cns.html');

test("010 It uses `spec.cns` argument to filter fragments by 'cns'", async (t) => {
  const myFragmentWithoutCns = new MyFragment();
  await t.expect(myFragmentWithoutCns.selector.exists).ok();
  await t.expect(myFragmentWithoutCns.selector.count).eql(3);
  await t.expect(myFragmentWithoutCns.selector.nth(0).textContent).eql('MyFragment');
  await t.expect(myFragmentWithoutCns.selector.nth(1).textContent).eql('MyFragment with cns foo');
  await t.expect(myFragmentWithoutCns.selector.nth(2).textContent).eql('MyFragment with cns foo and in custom parent');

  const myFragmentWithCns = new MyFragment({cns: 'foo'});
  await t.expect(myFragmentWithCns.selector.exists).ok();
  await t.expect(myFragmentWithCns.selector.count).eql(2);
  await t.expect(myFragmentWithCns.selector.nth(0).textContent).eql('MyFragment with cns foo');
  await t.expect(myFragmentWithCns.selector.nth(1).textContent).eql('MyFragment with cns foo and in custom parent');
});

test("020 It respects `spec.parent` argument when uses `spec.cns` argument to filter fragments by 'cns'", async (t) => {
  const myFragment = new MyFragment({cns: 'foo', parent: '.parent'});
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(1);
  await t.expect(myFragment.selector.nth(0).textContent).eql('MyFragment with cns foo and in custom parent');
});

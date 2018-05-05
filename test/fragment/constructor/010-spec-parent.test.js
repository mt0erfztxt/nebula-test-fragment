import appRootPath from 'app-root-path';

import {Fragment} from '../../../src';

class ParentFragment extends Fragment {
}

Object.defineProperties(ParentFragment, {
  bemBase: {
    value: 'parent-fragment'
  },
  displayName: {
    value: 'ParentFragment'
  }
});

class ChildFragment extends Fragment {
}

Object.defineProperties(ChildFragment, {
  bemBase: {
    value: 'child-fragment'
  },
  displayName: {
    value: 'ChildFragment'
  }
});

fixture `Fragment :: Constructor :: 010 Spec Parent`
  .page(appRootPath.path + '/test/fixtures/fragment/constructor/010-spec-parent.html');

test("010 It uses selector of `spec.parent` argument as parent selector when it is a fragment", async (t) => {
  const parentFragment = new ParentFragment();
  const childFragment = new ChildFragment({parent: parentFragment});

  // Check that parent fragment found.
  await t.expect(parentFragment.selector.exists).ok();

  // Check that child fragments found matches only that placed in parent
  // fragment.
  await t.expect(childFragment.selector.exists).ok();
  await t.expect(childFragment.selector.count).eql(2);
  await t.expect(childFragment.selector.nth(0).textContent).eql('0');
  await t.expect(childFragment.selector.nth(1).textContent).eql('1');
});

test("020 It uses 'BODY' element of page to create parent selector when `spec.parent` argument is not set", async (t) => {
  const childFragment = new ChildFragment();
  await t.expect(childFragment.selector.exists).ok();
  await t.expect(childFragment.selector.count).eql(6);
  await t.expect(childFragment.selector.nth(0).textContent).eql('0');
  await t.expect(childFragment.selector.nth(1).textContent).eql('1');
  await t.expect(childFragment.selector.nth(2).textContent).eql('3');
  await t.expect(childFragment.selector.nth(3).textContent).eql('4');
  await t.expect(childFragment.selector.nth(4).textContent).eql('5');
  await t.expect(childFragment.selector.nth(5).textContent).eql('2');
});

test("020 It uses `spec.parent` argument to create parent selector when it is set but not to a fragment", async (t) => {
  const childFragment = new ChildFragment({parent: '.not-a-fragment'});
  await t.expect(childFragment.selector.exists).ok();
  await t.expect(childFragment.selector.count).eql(1);
  await t.expect(childFragment.selector.nth(0).textContent).eql('2');
});

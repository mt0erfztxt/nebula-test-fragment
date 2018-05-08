import _ from 'lodash';
import appRootPath from 'app-root-path';

import {Fragment} from '../../../../src';
import selector from '../../../../src/selector';

class MyFragment extends Fragment {
  constructor(spec, opts) {
    const {initializedOpts, initializedSpec, isInstance} = MyFragment.initializeFragmentSpecAndOpts(spec, opts);

    if (isInstance === true) {
      return spec;
    }

    if (initializedSpec.text) {
      initializedSpec.custom = (sel, spec) => selector.filterByText(sel, spec.text);
    }

    super(initializedSpec, initializedOpts);
    return this;
  }
}

Object.defineProperties(MyFragment, {
  bemBase: {
    value: 'myFragment'
  },
  displayName: {
    value: 'MyFragment'
  }
});

fixture `Fragment :: Constructor :: 050 Spec Custom`
  .page(appRootPath.path + '/test/fixtures/fragment/constructor/050-spec-custom.html');

test("010 It uses `spec.custom` argument to filter by custom spec", async (t) => {
  const myFragment = new MyFragment();
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(14);
  await t.expect(myFragment.selector.nth(0).textContent).eql('MyFragment');
  await t.expect(myFragment.selector.nth(1).textContent).eql('MyFragment, custom text 101');
  await t.expect(myFragment.selector.nth(2).textContent).eql('MyFragment, custom text 102');
  await t.expect(myFragment.selector.nth(3).textContent).eql('MyFragment, custom text 103');
  await t.expect(myFragment.selector.nth(4).textContent).eql('MyFragment, cns foo, custom text 1');
  await t.expect(myFragment.selector.nth(5).textContent).eql('MyFragment, cns foo, custom text 2');
  await t.expect(myFragment.selector.nth(6).textContent).eql('MyFragment, cns foo, custom text 22');
  await t.expect(myFragment.selector.nth(7).textContent).eql('MyFragment, custom text 102');
  await t.expect(myFragment.selector.nth(8).textContent).eql('MyFragment, custom text 103');
  await t.expect(myFragment.selector.nth(9).textContent).eql('MyFragment, custom text 101');
  await t.expect(myFragment.selector.nth(10).textContent).eql('MyFragment, parent, custom text 18');
  await t.expect(myFragment.selector.nth(11).textContent).eql('MyFragment, parent, custom text 19');
  await t.expect(myFragment.selector.nth(12).textContent).eql('MyFragment, parent, cns foo, custom text 36');
  await t.expect(myFragment.selector.nth(13).textContent).eql('MyFragment, custom text 103');

  const myFragmentWithText = new MyFragment({text: 'MyFragment, parent, custom text 19'});
  await t.expect(myFragmentWithText.selector.count).eql(1);
  await t.expect(myFragmentWithText.selector.textContent).eql('MyFragment, parent, custom text 19');
});

test("020 It respects `spec.parent` argument when uses `spec.custom`", async (t) => {
  const myFragment = new MyFragment({text: 'MyFragment, custom text 101'});
  await t.expect(myFragment.selector.count).eql(2);

  const myFragmentWithParent = new MyFragment({parent: '.parent', text: 'MyFragment, custom text 101'});
  await t.expect(myFragmentWithParent.selector.count).eql(1);
  await t.expect(myFragmentWithParent.selector.parent().classNames).eql(['parent']);
});

test("030 It respects `spec.cns` argument when uses `spec.custom`", async (t) => {
  const myFragment = new MyFragment({text: 'MyFragment, custom text 102'});
  await t.expect(myFragment.selector.count).eql(2);

  const myFragmentWithCns = new MyFragment({cns: 'foo', text: 'MyFragment, custom text 102'});
  await t.expect(myFragmentWithCns.selector.count).eql(1);
  await t.expect(myFragmentWithCns.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);
});

test("040 It respects both `spec.parent` and `spec.cns` arguments when uses `spec.custom`", async (t) => {
  const myFragment = new MyFragment({text: 'MyFragment, custom text 103'});
  await t.expect(myFragment.selector.count).eql(3);

  const myFragmentWithParentAndCns = new MyFragment({
    cns: 'foo',
    parent: '.parent',
    text: 'MyFragment, custom text 103'
  });
  await t.expect(myFragmentWithParentAndCns.selector.count).eql(1);
  await t.expect(myFragmentWithParentAndCns.selector.classNames).eql(['myFragment', 'myFragment--cns_foo']);
  await t.expect(myFragmentWithParentAndCns.selector.parent().classNames).eql(['parent']);
});

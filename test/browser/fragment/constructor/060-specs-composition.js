import appRootPath from 'app-root-path';

import Fragment from '../../../../src/fragment';
import selector from '../../../../src/selector';

class ParentFragment extends Fragment {
}

Object.defineProperties(ParentFragment, {
    bemBase: {
        value: 'parentFragment'
    },
    displayName: {
        value: 'ParentFragment'
    }
});

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

fixture`Fragment :: Constructor :: 060 Specs Composition`
    .page(appRootPath.path + '/test/fixtures/fragment/constructor/060-specs-composition.html');

test("010 It allows specs to be composed", async (t) => {
    const parentFragment = new ParentFragment();
    const myFragment = new MyFragment();

    // Check that parent fragment found.
    await t.expect(parentFragment.selector.exists).ok();

    // Just to be sure fixture is in sync with tests.
    await t.expect(myFragment.selector.exists).ok();
    await t.expect(myFragment.selector.count).eql(8);

    // Check specs composition:
    // -- parent
    const myFragmentParent = new MyFragment({parent: parentFragment});
    await t.expect(myFragmentParent.selector.exists).ok();
    await t.expect(myFragmentParent.selector.count).eql(7);
    await t.expect(myFragmentParent.selector.nth(0).textContent).eql('MyFragment, parent');
    await t.expect(myFragmentParent.selector.nth(1).textContent).eql('MyFragment, parent, cns foo');
    await t.expect(myFragmentParent.selector.nth(2).textContent).eql('MyFragment, parent, cns foo, cid bar');
    await t.expect(myFragmentParent.selector.nth(3).textContent).eql('MyFragment, parent, cns foo, cid bar, idx 1');
    await t.expect(myFragmentParent.selector.nth(4).textContent).eql('MyFragment, parent, cns foo, cid buz');
    await t.expect(myFragmentParent.selector.nth(5).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 1, custom text 42');
    await t.expect(myFragmentParent.selector.nth(6).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 2, custom text 420');

    // -- parent + cns
    const myFragmentParentCns = new MyFragment({parent: parentFragment, cns: 'foo'});
    await t.expect(myFragmentParentCns.selector.exists).ok();
    await t.expect(myFragmentParentCns.selector.count).eql(6);
    await t.expect(myFragmentParentCns.selector.nth(0).textContent).eql('MyFragment, parent, cns foo');
    await t.expect(myFragmentParentCns.selector.nth(1).textContent).eql('MyFragment, parent, cns foo, cid bar');
    await t.expect(myFragmentParentCns.selector.nth(2).textContent).eql('MyFragment, parent, cns foo, cid bar, idx 1');
    await t.expect(myFragmentParentCns.selector.nth(3).textContent).eql('MyFragment, parent, cns foo, cid buz');
    await t.expect(myFragmentParentCns.selector.nth(4).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 1, custom text 42');
    await t.expect(myFragmentParentCns.selector.nth(5).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 2, custom text 420');

    // -- parent + cns + cid
    const myFragmentParentCnsCidBar = new MyFragment({parent: parentFragment, cns: 'foo', cid: 'bar'});
    await t.expect(myFragmentParentCnsCidBar.selector.exists).ok();
    await t.expect(myFragmentParentCnsCidBar.selector.count).eql(2);
    await t.expect(myFragmentParentCnsCidBar.selector.nth(0).textContent).eql('MyFragment, parent, cns foo, cid bar');
    await t.expect(myFragmentParentCnsCidBar.selector.nth(1).textContent).eql('MyFragment, parent, cns foo, cid bar, idx 1');

    const myFragmentParentCnsCidBuz = new MyFragment({parent: parentFragment, cns: 'foo', cid: 'buz'});
    await t.expect(myFragmentParentCnsCidBuz.selector.exists).ok();
    await t.expect(myFragmentParentCnsCidBuz.selector.count).eql(3);
    await t.expect(myFragmentParentCnsCidBuz.selector.nth(0).textContent).eql('MyFragment, parent, cns foo, cid buz');
    await t.expect(myFragmentParentCnsCidBuz.selector.nth(1).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 1, custom text 42');
    await t.expect(myFragmentParentCnsCidBuz.selector.nth(2).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 2, custom text 420');

    // -- parent + cns + cid + idx
    // Checking on `nth()` because of its misbehavior at least in TestCafe
    // '0.16.2'
    const myFragmentParentCnsCidBuzIdx1 = new MyFragment({parent: parentFragment, cns: 'foo', cid: 'buz', idx: 1});
    await t.expect(myFragmentParentCnsCidBuzIdx1.selector.exists).ok();
    await t.expect(myFragmentParentCnsCidBuzIdx1.selector.count).eql(1);
    await t.expect(myFragmentParentCnsCidBuzIdx1.selector.textContent).eql('MyFragment, parent, cns foo, cid buz, idx 1, custom text 42');
    await t.expect(myFragmentParentCnsCidBuzIdx1.selector.nth(0).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 1, custom text 42');

    // -- parent + cns + cid + idx + custom - case of success
    const myFragmentParentCnsCidBuzIdx2Custom = new MyFragment({
        parent: parentFragment,
        cns: 'foo',
        cid: 'buz',
        idx: 2,
        text: /.*42.*/
    });
    await t.expect(myFragmentParentCnsCidBuzIdx2Custom.selector.exists).ok();
    await t.expect(myFragmentParentCnsCidBuzIdx2Custom.selector.count).eql(1);
    await t.expect(myFragmentParentCnsCidBuzIdx2Custom.selector.textContent).eql('MyFragment, parent, cns foo, cid buz, idx 2, custom text 420');
    await t.expect(myFragmentParentCnsCidBuzIdx2Custom.selector.nth(0).textContent).eql('MyFragment, parent, cns foo, cid buz, idx 2, custom text 420');

    // -- parent + cns + cid + idx + custom - case of failure
    const myFragmentParentCnsCidBuzIdx2CustomFailure = new MyFragment({
        parent: parentFragment,
        cns: 'foo',
        cid: 'buz',
        idx: 2,
        text: /.*42$/
    });
    await t.expect(myFragmentParentCnsCidBuzIdx2CustomFailure.selector.exists).notOk();
});

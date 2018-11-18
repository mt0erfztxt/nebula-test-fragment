import appRootPath from 'app-root-path';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import bem from '../../../src/bem';
import Fragment from '../../../src/fragment1';

const { BemBase } = bem;

const expect = unexpected.clone();
expect.use(unexpectedSinon);

function buildPagePath(testId) {
  return (
    appRootPath.path + `/test/browser/fragment1/${testId ? testId : 'index'}.html`
  );
}

class F1 extends Fragment {}

Object.defineProperties(F1, {
  bemBase: {
    value: 'f1'
  },
  displayName: {
    value: 'F1'
  }
});

fixture("Fragment");

test
  .page(buildPagePath())
  ("010 It chooses correct BEM base for fragment", async () => {

    // -- Check when BEM base on fragment itself

    const f1 = new F1();
    expect(f1.bemBase, 'to be a', BemBase);
    expect(f1.displayName, 'to equal', 'F1');
    expect(f1.bemBase.toString(), 'to equal', 'f1');

    // -- Check when BEM base on fragment's parent

    class F2 extends F1 {}

    Object.defineProperties(F2, {
      displayName: {
        value: 'F2'
      }
    });

    const f2 = new F2();
    expect(f2.bemBase, 'to be a', BemBase);
    expect(f2.displayName, 'to equal', 'F2');
    expect(f2.bemBase.toString(), 'to equal', 'f1');

    // -- Check when BEM base on fragment's grand parent

    class F3 extends F2 {}

    Object.defineProperties(F3, {
      displayName: {
        value: 'F3'
      }
    });

    const f3 = new F3();
    expect(f3.bemBase, 'to be a', BemBase);
    expect(f3.displayName, 'to equal', 'F3');
    expect(f3.bemBase.toString(), 'to equal', 'f1');
  });

test
  .page(buildPagePath('020'))
  ("020 It creates fragment with selector returning only elements with fragment's BEM base", async (t) => {
    const f1 = new F1();
    expect(f1._selector, 'to be defined');
    await t.expect(f1._selector.count).eql(2);
    await t.expect(f1._selector.nth(0).textContent).eql('f1a');
    await t.expect(f1._selector.nth(1).textContent).eql('f1b');
  });

test
  .page(buildPagePath('030'))
  ("030 It scopes fragment's selector into parent selector", async (t) => {

    // -- Check when parent not provided

    const f1a = new F1();
    expect(f1a._selector, 'to be defined');
    await t.expect(f1a._selector.textContent).eql('f1a');
    await t.expect(f1a._selector.parent(0).tagName).eql('body');

    // -- Check when parent provided as string

    const f1b = new F1({}, { parent: '.parent' });
    expect(f1b._selector, 'to be defined');
    await t.expect(f1b._selector.textContent).eql('f1b');
    await t.expect(f1b._selector.parent(0).tagName).eql('div');
    await t.expect(f1b._selector.parent(0).classNames).eql(['parent']);

    // -- Check when parent provided as fragment

    class F2 extends Fragment {}

    Object.defineProperties(F2, {
      bemBase: {
        value: 'f2'
      },
      displayName: {
        value: 'F2'
      }
    });

    const f2 = new F2();
    const f1c = new F1({}, { parent: f2 });
    expect(f1c._selector, 'to be defined');
    await t.expect(f1c._selector.textContent).eql('f1c');
    await t.expect(f1c._selector.parent(0).tagName).eql('div');
    await t.expect(f1c._selector.parent(0).classNames).eql(['f2']);
  });

test
  .page(buildPagePath())
  ("040 It initializes fragment's selector on first access", async () => {
    let sel;
    const f1 = new F1();
    const initializeSelectorSpy = sinon.spy(f1, '_initializeSelector');

    // -- Check that selector initialized only on first access and fragment
    // -- marked accordingly

    expect(f1._selectorInitialized, 'to be false');

    sel = f1.selector;
    expect(sel, 'to be defined');
    expect(initializeSelectorSpy, 'was called times', 1);
    expect(f1._selectorInitialized, 'to be true');

    sel = f1.selector;
    expect(sel, 'to be defined');
    expect(initializeSelectorSpy, 'was called times', 1);
    expect(f1._selectorInitialized, 'to be true');
  });

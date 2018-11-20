import appRootPath from 'app-root-path';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import bem from '../../../src/bem';
import Fragment from '../../../src/fragment1';
import selector from '../../../src/selector';

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
  ("010 It should choose correct BEM base for fragment", async () => {

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
  ("020 It should create fragment with selector returning only elements with fragment's BEM base", async (t) => {
    const f1 = new F1();
    expect(f1._selector, 'to be defined');
    await t.expect(f1._selector.count).eql(2);
    await t.expect(f1._selector.nth(0).textContent).eql('f1a');
    await t.expect(f1._selector.nth(1).textContent).eql('f1b');
  });

test
  .page(buildPagePath('030'))
  ("030 It should scope fragment's selector into parent selector", async (t) => {

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
  ("040 It should initialize fragment's selector on first access", async () => {
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

test
  .page(buildPagePath('050'))
  ("050 It should allow 'selectorInitializer' argument to be a function", async (t) => {
    const f1 = new F1((sel, _) => selector.filterByText(sel, 'f1b'));

    await t.expect(f1.selector.count).eql(1);
    await t.expect(f1.selector.classNames).eql(['f1']);
    await t.expect(f1.selector.textContent).eql('f1b');

    // -- Ensure it fails as expected

    let isThrown = false;

    try {
      await t.expect(f1.selector.textContent).eql('foo');
    }
    catch (e) {
      expect(
        e.errMsg,
        'to match',
        /.+expected 'f1b' to deeply equal 'foo'/
      );

      isThrown = true;
    }

    expect(isThrown, 'to be true');
  });

test
  .page(buildPagePath('060'))
  ("060 It should allow 'selectorInitializer' argument to be a list of functions", async (t) => {
    const f1 = new F1([
      (sel, _) => selector.filterByText(sel, 'f1b'),
      (sel, _) => sel.nth(3),
    ]);

    await t.expect(f1.selector.count).eql(1);
    await t.expect(f1.selector.classNames).eql(['f1']);
    await t.expect(f1.selector.textContent).eql('f1b');
    await t.expect(f1.selector.getAttribute('data-nth')).eql('3');

    // -- Ensure it fails as expected

    let isThrown = false;

    try {
      await t.expect(f1.selector.getAttribute('data-nth')).eql('4');
    }
    catch (e) {
      expect(
        e.errMsg,
        'to match',
        /.+expected '3' to deeply equal '4'/
      );

      isThrown = true;
    }

    expect(isThrown, 'to be true');
  });

test
  .page(buildPagePath('070'))
  ("070 It should allow 'selectorInitializer' argument to be a POJO with built-in 'cid' transformation", async (t) => {
    const f1 = new F1({ cid: 'baz' });

    await t.expect(f1.selector.count).eql(1);
    await t.expect(f1.selector.classNames).eql(['f1', 'f1--cid_baz']);
    await t.expect(f1.selector.textContent).eql('baz');

    // -- Ensure it fails as expected

    let isThrown = false;

    try {
      await t.expect(f1.selector.textContent).eql('foo');
    }
    catch (e) {
      expect(
        e.errMsg,
        'to match',
        /.+expected 'baz' to deeply equal 'foo'/
      );

      isThrown = true;
    }

    expect(isThrown, 'to be true');
  });

test
  .page(buildPagePath('080'))
  ("080 It should allow 'selectorInitializer' argument to be a POJO with built-in 'cns' transformation", async (t) => {
    const f1 = new F1({ cns: 'baz' });

    await t.expect(f1.selector.count).eql(1);
    await t.expect(f1.selector.classNames).eql(['f1', 'f1--cns_baz']);
    await t.expect(f1.selector.textContent).eql('baz');

    // -- Ensure it fails as expected

    let isThrown = false;

    try {
      await t.expect(f1.selector.textContent).eql('foo');
    }
    catch (e) {
      expect(
        e.errMsg,
        'to match',
        /.+expected 'baz' to deeply equal 'foo'/
      );

      isThrown = true;
    }

    expect(isThrown, 'to be true');
  });

test
  .page(buildPagePath('090'))
  ("090 It should allow 'selectorInitializer' argument to be a POJO with built-in 'idx' transformation", async (t) => {
    const f1 = new F1({ idx: 2 });

    await t.expect(f1.selector.count).eql(1);
    await t.expect(f1.selector.classNames).eql(['f1']);
    await t.expect(f1.selector.textContent).eql('baz');

    // -- Ensure it fails as expected

    let isThrown = false;

    try {
      await t.expect(f1.selector.textContent).eql('abc');
    }
    catch (e) {
      expect(
        e.errMsg,
        'to match',
        /.+expected 'baz' to deeply equal 'abc'/
      );

      isThrown = true;
    }

    expect(isThrown, 'to be true');
  });

test
  .page(buildPagePath('100'))
  ("100 It should apply built-in transformations in following order 'cns' -> 'cid' -> 'idx'", async (t) => {
    const f1 = new F1({ idx: 1, cns: 'bar', cid: '11' });

    await t.expect(f1.selector.count).eql(1);
    await t.expect(f1.selector.classNames).eql(['f1', 'f1--cns_bar', 'f1--cid_11']);
    await t.expect(f1.selector.textContent).eql('bar 11 1');

    // -- Ensure it fails as expected

    let isThrown = false;

    try {
      await t.expect(f1.selector.textContent).eql('bar 11 0');
    }
    catch (e) {
      expect(
        e.errMsg,
        'to match',
        /.+expected 'bar 11 1' to deeply equal 'bar 11 0'/
      );

      isThrown = true;
    }

    expect(isThrown, 'to be true');
  });

test
  .page(buildPagePath('110'))
  ("110 It should allow 'selectorInitializer' argument to be a list of POJOs", async (t) => {
    throw new Error('To be done!')
  });

test
  .page(buildPagePath('120'))
  ("120 It should allow 'selectorInitializer' argument to be a mix of function and POJOs", async (t) => {
    throw new Error('To be done!')
  });

test
  .page(buildPagePath('130'))
  ("130 It should allow 'selectorInitializer' argument to have custom tranformations provided by derived fragments", async (t) => {
    throw new Error('To be done!')
  });

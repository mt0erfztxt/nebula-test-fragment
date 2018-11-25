import expect from 'unexpected';

import Fragment from '../../../../src/fragment1';

class Foo extends Fragment {

  /**
   * @returns {BemBase}
   */
  get itemElementBemBase() {
    if (!this._itemElementBemBase) {
      this._itemElementBemBase = this
        .cloneBemBase()
        .setElt('item');
    }

    return this._itemElementBemBase;
  }

  /**
   * @returns {Selector}
   */
  get itemElementSelector() {
    if (!this._itemElementSelector) {
      this._itemElementSelector = this
        .selector
        .find(`.${this.itemElementBemBase}`);
    }

    return this._itemElementSelector;
  }
}

Object.defineProperties(Foo, {
  bemBase: {
    value: 'foo'
  },
  displayName: {
    value: 'Foo'
  }
});

fixture('Fragment :: 080 #expectSomethingsCountIs()')
  .page(__dirname + '/index.html');

test("010 It should throw error when fragment doesn't have specified somethings", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, 2);
  }
  catch (e) {
    const msgPattern = /.*expected 3 to deeply equal 2.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should respect 'isNot' option", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, 3, {
      isNot: true
    });
  }
  catch (e) {
    const msgPattern = /.*expected 3 to not deeply equal 3.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should allow 'count' argument to be an array", async () => {
  const foo = new Foo();

  let isThrown = false;

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, ['gte', 3]);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("040 It should respect 'isNot' options when 'count' argument is array", async () => {
  let isThrown = false;
  const foo = new Foo();

  try {
    await Foo.expectSomethingsCountIs(foo.itemElementSelector, ['gte', 3], { isNot: true });
  }
  catch (e) {
    const msgPattern = /.*expected 3 to be below 3.*/;
    expect(e.errMsg, 'to match', msgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

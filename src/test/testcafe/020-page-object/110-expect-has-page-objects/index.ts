import { Selector } from "testcafe";
import { BemBase } from "../../../../main/bem";
import {
  ExpectHasPageObjectExtraArgs,
  ExpectHasPageObjectsExtraArgs,
  PageObject,
  SelectorTransformation
} from "../../../../main/page-object";
import {
  expectDomElementsCountIs,
  ExpectDomElementsCountIsOptions
} from "../../../../main/selector";

class Bar extends PageObject {
  static bemBase = "bar";
  static displayName = "Bar";
}

class Foo extends PageObject {
  static bemBase = "foo";
  static displayName = "Foo";

  private _barBemBase: BemBase;
  private _barSelector: Selector;

  get barBemBase(): BemBase {
    if (!this._barBemBase) {
      this._barBemBase = new BemBase(Bar.bemBase);
    }

    return this._barBemBase;
  }

  get barSelector(): Selector {
    if (!this._barSelector) {
      this._barSelector = this.selector.find(this.barBemBase.toQuerySelector());
    }

    return this._barSelector;
  }

  getBar(...args: SelectorTransformation[]): Bar {
    return this.getPageObject(Bar, ...args);
  }

  async expectBarsCountIs(
    count: number,
    options?: ExpectDomElementsCountIsOptions
  ): Promise<void> {
    await expectDomElementsCountIs(this.barSelector, count, options);
  }

  async expectHasBar(...args: ExpectHasPageObjectExtraArgs): Promise<Bar> {
    return this.expectHasPageObject(this.getBar, ...args);
  }

  async expectHasBars(...args: ExpectHasPageObjectsExtraArgs): Promise<Bar[]> {
    return this.expectHasPageObjects(
      this.expectHasBar,
      this.expectBarsCountIs,
      ...args
    );
  }
}

fixture("PageObject#expectHasPageObjects()").page(`${__dirname}/index.html`);

test("010 fails when page object doesn't have specified page objects inside it -- case of direct call", async t => {
  let isThrown;
  const bar0 = new Bar(["cid", "0"]);
  const bar9 = new Bar(["cid", "9"]);
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(bar0.selector.count).eql(1);
  await t.expect(bar9.selector.count).eql(0);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "9"]]
    );
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Bar's selector must return exactly one DOM element but it returned 0 of them.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("015 fails when page object doesn't have specified page objects inside it -- case of specific method", async t => {
  let isThrown;
  const bar0 = new Bar(["cid", "0"]);
  const bar9 = new Bar(["cid", "9"]);
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(bar0.selector.count).eql(1);
  await t.expect(bar9.selector.count).eql(0);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await foo.expectHasBars([["cid", "0"]], [["cid", "9"]]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Bar's selector must return exactly one DOM element but it returned 0 of them.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("020 succeeds when page object have specified page objects inside it -- case of direct call", async t => {
  let isThrown;
  const bar0 = new Bar(["cid", "0"]);
  const bar1 = new Bar(["cid", "1"]);
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(bar0.selector.count).eql(1);
  await t.expect(bar1.selector.count).eql(1);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "1"]]
    );
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("025 succeeds when page object have specified page objects inside it -- case of specific method", async t => {
  let isThrown;
  const bar0 = new Bar(["cid", "0"]);
  const bar1 = new Bar(["cid", "1"]);
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(bar0.selector.count).eql(1);
  await t.expect(bar1.selector.count).eql(1);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await foo.expectHasBars([["cid", "0"]], [["cid", "1"]], [["cid", "2"]], {
      sameOrder: true
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("030 works with 'options.only' set to true", async t => {
  let isThrown;
  const bar0 = new Bar(["cid", "0"]);
  const bar1 = new Bar(["cid", "1"]);
  const bar2 = new Bar(["cid", "2"]);
  const bar3 = new Bar(["cid", "3"]);
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(bar0.selector.count).eql(1);
  await t.expect(bar1.selector.count).eql(1);
  await t.expect(bar2.selector.count).eql(1);
  await t.expect(bar3.selector.count).eql(0);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check failure -- case of less page objects than actual.
  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "1"]],
      { only: true }
    );
  } catch (e) {
    await t.expect(e.errMsg).match(/.*expected 3 to deeply equal 2.*/);
    isThrown = true;
  }
  await t.expect(isThrown).ok();

  // Check failure -- case of more page objects than actual.
  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "1"]],
      [["cid", "2"]],
      [["cid", "3"]],
      { only: true }
    );
  } catch (e) {
    await t.expect(e.errMsg).match(/.*expected 3 to deeply equal 4.*/);
    isThrown = true;
  }
  await t.expect(isThrown).ok();

  // Check success.
  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "1"]],
      [["cid", "2"]],
      { only: true }
    );
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("040 works with 'options.sameOrder' set to true", async t => {
  let isThrown;
  const bar0 = new Bar(["cid", "0"]);
  const bar1 = new Bar(["cid", "1"]);
  const bar2 = new Bar(["cid", "2"]);
  const bar3 = new Bar(["cid", "3"]);
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(bar0.selector.count).eql(1);
  await t.expect(bar1.selector.count).eql(1);
  await t.expect(bar2.selector.count).eql(1);
  await t.expect(bar3.selector.count).eql(0);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check `only` option is enforced.
  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "1"]],
      { only: true }
    );
  } catch (e) {
    await t.expect(e.errMsg).match(/.*expected 3 to deeply equal 2.*/);
    isThrown = true;
  }
  await t.expect(isThrown).ok();

  // Check failure if page objects in wrong order.
  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "2"]],
      [["cid", "1"]],
      { sameOrder: true }
    );
  } catch (e) {
    await t
      .expect(e.errMsg)
      .match(
        /.*Bar at left doesn't equal Bar at right because their text contents not equal:.*/
      );
    isThrown = true;
  }
  await t.expect(isThrown).ok();

  // Check success if page object in correct order.
  isThrown = false;
  try {
    await foo.expectHasPageObjects(
      foo.expectHasBar,
      foo.expectBarsCountIs,
      [["cid", "0"]],
      [["cid", "1"]],
      [["cid", "2"]],
      { sameOrder: true }
    );
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("050 returns found page objects", async t => {
  const bar0 = new Bar(["cid", "0"]);
  const bar2 = new Bar(["cid", "2"]);
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(bar0.selector.count).eql(1);
  await t.expect(bar2.selector.count).eql(1);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  const bars = await foo.expectHasPageObjects(
    foo.expectHasBar,
    foo.expectBarsCountIs,
    [["cid", "0"]],
    [["cid", "2"]]
  );

  await t.expect(bars.length).eql(2);
  await t.expect(bars[0] instanceof Bar).ok();
  await t.expect(bars[1] instanceof Bar).ok();
  await t.expect(bars[0].selector.textContent).eql("Bar 0");
  await t.expect(bars[1].selector.textContent).eql("Bar 2");
});

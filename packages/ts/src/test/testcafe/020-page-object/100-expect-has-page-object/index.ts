import { t } from "testcafe";
import {
  ExpectHasPageObjectExtraArgs,
  PageObject,
  SelectorTransformation
} from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetB extends PageObject {
  static bemBase = "widgetB";
  static displayName = "WidgetB";

  getWidgetA(...args: SelectorTransformation[]): WidgetA {
    return this.getPageObject(WidgetA, ...args);
  }

  async expectHasWidgetA(...args: ExpectHasPageObjectExtraArgs): Promise<WidgetA> {
    return this.expectHasPageObject(this.getWidgetA, ...args);
  }
}

/**
 * Asserts equality of page objects -- page objects treated as equal if
 * difference between their 'cid's is 1.
 */
const customEqualityCheck = async (
  l: PageObject,
  r: PageObject
): Promise<void> => {
  const [[, lValue]] = await l.getBemModifiers("cid");
  const [[, rValue]] = await r.getBemModifiers("cid");
  await t
    .expect(
      Math.abs(parseInt(lValue as string, 10) - parseInt(rValue as string, 10))
    )
    .eql(
      1,
      "Page objects not equal because their 'cid's difference not equal 1"
    );
};

fixture("PageObject#expectHasPageObject()").page(`${__dirname}/index.html`);

test("010 fails when specified page object doesn't exist inside this page object -- case of direct call", async t => {
  let isThrown;
  const widgetA4Locator: SelectorTransformation = ["cid", "4"];
  const widgetA4 = new WidgetA(widgetA4Locator);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA4.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectHasPageObject(widgetB.getWidgetA, widgetA4Locator);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetA's selector must return exactly one DOM element but it returned 0 of them.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("020 succeeds when specified page object does exist inside this page object -- case of direct call", async t => {
  let isThrown;
  const widgetA2Locator: SelectorTransformation = ["cid", "2"];
  const widgetA2 = new WidgetA(widgetA2Locator);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA2.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectHasPageObject(widgetB.getWidgetA, widgetA2Locator);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("030 fails when specified page object doesn't exist inside this page object -- case of specific method", async t => {
  let isThrown;
  const widgetA4Locator: SelectorTransformation = ["cid", "4"];
  const widgetA4 = new WidgetA(widgetA4Locator);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA4.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectHasWidgetA(widgetA4Locator);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetA's selector must return exactly one DOM element but it returned 0 of them.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("040 succeeds when specified page object does exist inside this page object -- case of specific method", async t => {
  let isThrown;
  const widgetA2Locator: SelectorTransformation = ["cid", "2"];
  const widgetA2 = new WidgetA(widgetA2Locator);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA2.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectHasWidgetA(widgetA2Locator);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("050 fails when specified page object doesn't exist at specified index", async t => {
  let isThrown;
  const widgetA3Locator: SelectorTransformation = ["cid", "3"];
  const widgetA3 = new WidgetA(widgetA3Locator);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA3.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectHasWidgetA(widgetA3Locator, { idx: 1 });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetA at left doesn't equal WidgetA at right because their text contents not equal.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("060 succeeds when specified page object does exist at specified index", async t => {
  let isThrown;
  const widgetA3Locator: SelectorTransformation = ["cid", "3"];
  const widgetA3 = new WidgetA(widgetA3Locator);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA3.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectHasWidgetA(widgetA3Locator, { idx: 2 });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("070 uses provided custom equality check", async t => {
  let isThrown;
  const widgetA1Locator: SelectorTransformation = ["cid", "1"];
  const widgetA2Locator: SelectorTransformation = ["cid", "2"];
  const widgetA3Locator: SelectorTransformation = ["cid", "3"];
  const widgetA1 = new WidgetA(widgetA1Locator);
  const widgetA2 = new WidgetA(widgetA2Locator);
  const widgetA3 = new WidgetA(widgetA3Locator);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetA2.selector.count).eql(1);
  await t.expect(widgetA3.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  // Check failure -- left cid - right cid != abs(1).
  isThrown = false;
  try {
    await widgetB.expectHasWidgetA(widgetA1Locator, {
      equalityCheck: customEqualityCheck,
      idx: 2
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Page objects not equal because their 'cid's difference not equal 1.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check success -- left cid - right cid != abs(1).
  isThrown = false;
  try {
    await widgetB.expectHasWidgetA(widgetA1Locator, {
      equalityCheck: customEqualityCheck,
      idx: 1
    });
  } catch (e) {
    isThrown = true;
    console.log(e);
  }
  await t.expect(isThrown).notOk();
});

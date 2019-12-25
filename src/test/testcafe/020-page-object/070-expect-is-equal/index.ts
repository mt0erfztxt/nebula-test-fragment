import { t } from "testcafe";
import { AbstractPageObject } from "../../../../main/abstract-page-object";
import { PageObject } from "../../../../main/page-object";

fixture("PageObject#expectIsEqual()").page(`${__dirname}/index.html`);

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetB extends PageObject {
  static bemBase = "widgetB";
  static displayName = "WidgetB";

  /**
   * Asserts equality using value of 'foo' BEM modifier.
   */
  async expectIsEqual(
    that: WidgetB,
    options?: { equalityCheck?: (l: WidgetB, r: WidgetB) => Promise<void> }
  ) {
    const thatEqualityCheckValue = (await that.getBemModifiers("foo"))[0][1];
    const thisEqualityCheckValue = (await this.getBemModifiers("foo"))[0][1];
    await t
      .expect(thisEqualityCheckValue)
      .eql(thatEqualityCheckValue, "Page objects not equal");
  }
}

class WidgetC extends PageObject {
  static bemBase = "widgetC";
  static displayName = "WidgetC";
}

/**
 * Asserts equality of page objects by presence/absence of 'data-fiz'
 * attribute.
 */
const customEqualityCheck = async (
  l: AbstractPageObject,
  r: AbstractPageObject
): Promise<void> => {
  const lValue = await l.selector.hasAttribute("data-fiz");
  const rValue = await r.selector.hasAttribute("data-fiz");
  await t
    .expect(lValue)
    .eql(
      rValue,
      "Page objects not equal because their 'data-fiz' attributes not equal"
    );
};

test("010 fails when 'that' argument is a page object not of same type as 'this'", async () => {
  let isThrown;
  const widgetA1 = new WidgetA(["cid", "1"]);
  const widgetB1 = new WidgetB(["cid", "1"]);

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectIsEqual(widgetB1);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "'that' argument must be a WidgetA page object but it is a WidgetB page object"
      );
  }
  await t.expect(isThrown).ok();
});

test("020 fails when 'this' page object's selector returned zero DOM elements", async t => {
  let isThrown;
  const widgetA1 = new WidgetA(["cid", "1"]);
  const widgetA9 = new WidgetA(["cid", "9"]);

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetA9.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA9.expectIsEqual(widgetA1);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("030 fails when 'that' page object's selector returned zero DOM elements", async t => {
  let isThrown;
  const widgetA1 = new WidgetA(["cid", "1"]);
  const widgetA9 = new WidgetA(["cid", "9"]);

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetA9.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectIsEqual(widgetA9);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("040 uses default implementation of equality check -- case of failure", async t => {
  let isThrown;
  const widgetA1 = new WidgetA(["cid", "1"]);
  const widgetA3 = new WidgetA(["cid", "3"]);

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetA3.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectIsEqual(widgetA3);
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

test("050 uses default implementation of equality check -- case of success", async t => {
  let isThrown;
  const widgetA1 = new WidgetA(["cid", "1"]);
  const widgetA2 = new WidgetA(["cid", "2"]);

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetA2.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectIsEqual(widgetA2);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("060 uses overridden implementation of equality check -- case of failure", async t => {
  let isThrown;
  const widgetB1 = new WidgetB(["cid", "1"]);
  const widgetB2 = new WidgetB(["cid", "2"]);

  // -- Pre-checks --

  await t.expect(widgetB1.selector.count).eql(1);
  await t.expect(widgetB2.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB1.expectIsEqual(widgetB2);
  } catch (e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*Page objects not equal.*/);
  }
  await t.expect(isThrown).ok();
});

test("070 uses overridden implementation of equality check -- case of success", async t => {
  let isThrown;
  const widgetB1 = new WidgetB(["cid", "1"]);
  const widgetB3 = new WidgetB(["cid", "3"]);

  // -- Pre-checks --

  await t.expect(widgetB1.selector.count).eql(1);
  await t.expect(widgetB3.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB1.expectIsEqual(widgetB3);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("080 uses custom implementation of equality check provided in 'options' argument -- case of failure", async t => {
  let isThrown;
  const widgetC1 = new WidgetC(["cid", "1"]);
  const widgetC2 = new WidgetC(["cid", "2"]);

  // -- Pre-checks --

  await t.expect(widgetC1.selector.count).eql(1);
  await t.expect(widgetC2.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC1.expectIsEqual(widgetC2, {
      equalityCheck: customEqualityCheck
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Page objects not equal because their 'data-fiz' attributes not equal.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("090 uses custom implementation of equality check provided in 'options' argument -- case of success", async t => {
  let isThrown;
  const widgetC2 = new WidgetC(["cid", "2"]);
  const widgetC3 = new WidgetC(["cid", "3"]);

  // -- Pre-checks --

  await t.expect(widgetC2.selector.count).eql(1);
  await t.expect(widgetC3.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC2.expectIsEqual(widgetC3, {
      equalityCheck: customEqualityCheck
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

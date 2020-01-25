import { t } from "testcafe";
import { PageObject } from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetB extends PageObject {
  static bemBase = "widgetB";
  static displayName = "WidgetB";
}

/**
 * Asserts equality of page objects by presence/absence of 'data-fiz'
 * attribute.
 */
const customEqualityCheck = async (
  l: PageObject,
  r: PageObject
): Promise<void> => {
  const lValue = await l.selector.getAttribute("data-fiz");
  const rValue = await r.selector.getAttribute("data-fiz");
  await t
    .expect(lValue)
    .eql(
      rValue,
      "Page objects not equal because their 'data-fiz' attributes not equal"
    );
};

fixture("PageObject#expectIndexInParentIs()").page(`${__dirname}/index.html`);

test("005 fails when 'idx' argument is not an integer gte 0", async () => {
  let isThrown;
  const widgetA2 = new WidgetA(["cid", "2"]);
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA2.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  // Check integer.
  isThrown = false;
  try {
    await widgetA2.expectIndexInParentIs(widgetB1, 1.42);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "'idx' of WidgetA must be an integer greater or equal zero but it is 1.42"
      );
  }
  await t.expect(isThrown).ok();

  // Check integer gte 0.
  isThrown = false;
  try {
    await widgetA2.expectIndexInParentIs(widgetB1, -1);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "'idx' of WidgetA must be an integer greater or equal zero but it is -1"
      );
  }
  await t.expect(isThrown).ok();
});

test("010 fails when page object not found in parent at specified index", async () => {
  let isThrown;
  const widgetA2 = new WidgetA(["cid", "2"]);
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA2.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA2.expectIndexInParentIs(widgetB1, 0);
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

test("020 succeeds when page object found in parent at specified index", async () => {
  let isThrown;
  const widgetA2 = new WidgetA(["cid", "2"]);
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA2.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA2.expectIndexInParentIs(widgetB1, 1);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("030 fails when page object not found in parent at specified index -- case with 'equalityCheck' option", async () => {
  let isThrown;
  const widgetA1 = new WidgetA(["cid", "1"]);
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectIndexInParentIs(widgetB1, 2, {
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

test("040 succeeds when page object found in parent at specified index -- case with 'equalityCheck' option", async () => {
  let isThrown;
  const widgetA1 = new WidgetA(["cid", "1"]);
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  // Check equality with self.
  isThrown = false;
  try {
    await widgetA1.expectIndexInParentIs(widgetB1, 0, {
      equalityCheck: customEqualityCheck
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check equality with other page object which its equal by custom equality
  // check.
  isThrown = false;
  try {
    await widgetA1.expectIndexInParentIs(widgetB1, 1, {
      equalityCheck: customEqualityCheck
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

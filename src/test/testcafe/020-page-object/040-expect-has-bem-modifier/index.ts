import { PageObject } from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class DisabledWidgetB extends PageObject {
  static bemBase = "widgetB--disabled";
  static displayName = "DisabledWidgetB";
}

class WidgetC extends PageObject {
  static bemBase = "widgetC";
  static displayName = "WidgetC";
}

fixture("PageObject#expectHasBemModifier()").page(__dirname + "/index.html");

test("010 fails when page object's selector returned zero DOM elements", async t => {
  let isThrown;
  const widgetC = new WidgetC();

  // -- Pre-checks --

  await t.expect(widgetC.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC.expectHasBemModifier(["bar"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("020 fails when DOM element returned by page object's selector must have specified BEM modifier but it doesn't -- case of simple modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectHasBemModifier(["boo"]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by WidgetA's selector must have 'boo' BEM modifier but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("030 fails when DOM element returned by page object's selector must have specified BEM modifier but it doesn't -- case of full modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectHasBemModifier(["bar", "2"]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by WidgetA's selector must have 'bar,2' BEM modifier but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("040 succeeded when DOM element returned by page object's selector have specified BEM modifier -- case of simple modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();
  const disabledWidgetB1 = new DisabledWidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(disabledWidgetB1.selector.count).eql(1);

  // -- Checks --

  // Check when page object's BEM base is a 'block'.
  isThrown = false;
  try {
    await widgetA1.expectHasBemModifier(["foo"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check when page object's BEM base is a 'block--modifier'.
  isThrown = false;
  try {
    await disabledWidgetB1.expectHasBemModifier(["fiz"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("050 succeeded when DOM element returned by page object's selector have specified BEM modifier -- case of full modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();
  const disabledWidgetB1 = new DisabledWidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(disabledWidgetB1.selector.count).eql(1);

  // -- Checks --

  // Check when page object's BEM base is a 'block'.
  isThrown = false;
  try {
    await widgetA1.expectHasBemModifier(["bar", "1"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check when page object's BEM base is a 'block--modifier'.
  isThrown = false;
  try {
    await disabledWidgetB1.expectHasBemModifier(["buz", "2"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

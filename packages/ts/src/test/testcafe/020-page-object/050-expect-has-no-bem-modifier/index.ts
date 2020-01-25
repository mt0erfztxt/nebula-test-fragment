import { PageObject } from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetB extends PageObject {
  static bemBase = "widgetB--cid_1";
  static displayName = "WidgetB";
}

class WidgetC extends PageObject {
  static bemBase = "widgetC";
  static displayName = "WidgetC";
}

fixture("PageObject#expectHasNoBemModifier()").page(__dirname + "/index.html");

test("010 fails when page object's selector returned zero DOM elements", async t => {
  let isThrown;
  const widgetC = new WidgetC();

  // -- Pre-checks --

  await t.expect(widgetC.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC.expectHasNoBemModifier(["foo"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("020 fails when DOM element returned by page object's selector must not have specified BEM modifier but it does -- case of simple modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  // Check when page object's BEM base is a 'block'.
  isThrown = false;
  try {
    await widgetA1.expectHasNoBemModifier(["foo"]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by WidgetA's selector must not have 'foo' BEM modifier but it does.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check when page object's BEM base is a 'block--modifier'.
  isThrown = false;
  try {
    await widgetB1.expectHasNoBemModifier(["fiz"]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by WidgetB's selector must not have 'fiz' BEM modifier but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("030 fails when DOM element returned by page object's selector must not have specified BEM modifier but it does -- case of full modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.expectHasNoBemModifier(["bar", "1"]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by WidgetA's selector must not have 'bar,1' BEM modifier but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("040 succeeded when DOM element returned by page object's selector must not have specified BEM modifier and it doesn't -- case of simple modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  // Check when page object's BEM base is a 'block'.
  isThrown = false;
  try {
    await widgetA1.expectHasNoBemModifier(["boo"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check when page object's BEM base is a 'block--modifier'.
  isThrown = false;
  try {
    await widgetB1.expectHasNoBemModifier(["foo"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("050 succeeded when DOM element returned by page object's selector must not have specified BEM modifier and it doesn't -- case of full modifier", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  // Check when page object's BEM base is a 'block'.
  isThrown = false;
  try {
    await widgetA1.expectHasNoBemModifier(["bar", "2"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check when page object's BEM base is a 'block--modifier'.
  isThrown = false;
  try {
    await widgetB1.expectHasNoBemModifier(["buz", "3"]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

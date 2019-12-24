import { PageObject } from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetB extends PageObject {
  static bemBase = "widgetB";
  static displayName = "WidgetB";
}

class WidgetC extends PageObject {
  static bemBase = "widgetC";
  static displayName = "WidgetC";
}

fixture("PageObject#expectIsNotExist()").page(__dirname + "/index.html");

test("010 succeeds when page object's selector not exists -- 0 expected and 0 returned", async t => {
  let isThrown;
  const widgetC = new WidgetC();

  // -- Pre-checks --

  await t.expect(widgetC.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC.expectIsNotExist();
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("020 fails when page object's selector exists -- 0 expected and 1 returned", async t => {
  let isThrown;
  const widgetA = new WidgetA();

  // -- Pre-checks --

  await t.expect(widgetA.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA.expectIsNotExist();
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetA's selector must not return DOM elements but it returned 1 of them.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check `options.message`.
  isThrown = false;
  try {
    await widgetA.expectIsNotExist({ message: "foobar" });
  } catch (e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*foobar.*/);
  }
  await t.expect(isThrown).ok();
});

test("030 fails when page object's selector exists -- 0 expected and > 1 returned", async t => {
  let isThrown;
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetB.selector.count).eql(2);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectIsNotExist();
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetB's selector must not return DOM elements but it returned 2 of them.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check `options.message`.
  isThrown = false;
  try {
    await widgetB.expectIsNotExist({ message: "foobar" });
  } catch (e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*foobar.*/);
  }
  await t.expect(isThrown).ok();
});

import { PageObject } from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetB extends PageObject {
  static bemBase = "widgetB";
  static displayName = "WidgetB";
}

fixture("PageObject#expectIsNotExist()").page(__dirname + "/index.html");

test("010 succeeds when page object's selector must not exist and it doesn't", async t => {
  let isThrown;
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetB.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectIsNotExist();
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("020 fails when page object's selector must not exist but it does", async t => {
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
        /.*WidgetA: selector must not return DOM elements but it does -- 1 returned.*/
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

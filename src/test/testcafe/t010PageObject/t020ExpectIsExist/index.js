import PageObject from "../../../../main/pageObject";

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

fixture("PageObject#expectIsExist()").page(`${__dirname}/index.html`);

test("010 succeeds when page object's selector must not exist and it doesn't -- 0 expected and 0 returned", async t => {
  let isThrown;
  const widgetC = new WidgetC();

  // -- Pre-checks --

  await t.expect(widgetC.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC.expectIsExist({ isNot: true });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("020 fails when page object's selector must not exist but it does -- 0 expected and 1 returned", async t => {
  let isThrown;
  const widgetA = new WidgetA();

  // -- Pre-checks --

  await t.expect(widgetA.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA.expectIsExist({ isNot: true });
  } catch (/** @type NTF.AssertionError*/ e) {
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
    await widgetA.expectIsExist({ isNot: true, message: "foobar" });
  } catch (/** @type NTF.AssertionError*/ e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*foobar.*/);
  }
  await t.expect(isThrown).ok();
});

test("025 fails when page object's selector must not exist but it does -- 0 expected and > 1 returned", async t => {
  let isThrown;
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetB.selector.count).eql(2);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectIsExist({ isNot: true });
  } catch (/** @type NTF.AssertionError*/ e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetB: selector must not return DOM elements but it does -- 2 returned.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check `options.message`.
  isThrown = false;
  try {
    await widgetB.expectIsExist({ isNot: true, message: "foobar" });
  } catch (/** @type NTF.AssertionError*/ e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*foobar.*/);
  }
  await t.expect(isThrown).ok();
});

test("030 fails when page object's selector must exist but it doesn't -- 1 expected and 0 returned", async t => {
  let isThrown;
  const widgetC = new WidgetC();

  // -- Pre-checks --

  await t.expect(widgetC.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC.expectIsExist();
  } catch (/** @type NTF.AssertionError*/ e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetC: selector must return exactly one DOM element but it doesn't -- 0 returned.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check `options.message`.
  isThrown = false;
  try {
    await widgetC.expectIsExist({ message: "foobar" });
  } catch (/** @type NTF.AssertionError*/ e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*foobar.*/);
  }
  await t.expect(isThrown).ok();
});

test("040 succeeds when page object's selector must exist and it does -- 1 expected and 1 returned", async t => {
  let isThrown;
  const widgetA = new WidgetA();

  // -- Pre-checks --

  await t.expect(widgetA.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA.expectIsExist();
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("050 fails when page object's selector must exist and it does but more than expected elements returned -- 1 expected and > 1 returned", async t => {
  let isThrown;
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetB.selector.count).eql(2);

  // -- Checks --

  isThrown = false;
  try {
    await widgetB.expectIsExist();
  } catch (/** @type NTF.AssertionError*/ e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*WidgetB: selector must return exactly one DOM element but it doesn't -- 2 returned.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check `options.message`.
  isThrown = false;
  try {
    await widgetB.expectIsExist({ message: "foobar" });
  } catch (/** @type NTF.AssertionError*/ e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*foobar.*/);
  }
  await t.expect(isThrown).ok();
});

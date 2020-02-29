import PageObject from "../../../../main/pageObject";

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

fixture("PageObject#getBemModifiers()").page(`${__dirname}/index.html`);

test("010 fails when page object's selector returned zero DOM elements", async t => {
  let isThrown;
  const widgetC = new WidgetC();

  // -- Pre-checks --

  await t.expect(widgetC.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await widgetC.getBemModifiers();
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("020 fails when 'bemModifierName' argument is not valid", async t => {
  let isThrown;
  const widgetA1 = new WidgetA();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await widgetA1.getBemModifiers(" ");
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "BEM modifier's name: BEM name: must conform constraints but it " +
          "doesn't -- string  "
      );
  }
  await t.expect(isThrown).ok();
});

test("030 returns array containing all BEM modifiers when 'bemModifierName' argument not provided", async t => {
  const widgetA1 = new WidgetA();
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  // Check when page object's BEM base is a 'block'.
  const widgetA1BemModifiers = await widgetA1.getBemModifiers();
  await t
    .expect(widgetA1BemModifiers)
    .eql([["mod1"], ["no-mod2"], ["mod3", "val"]]);

  // Check when page object's BEM base is a 'block--modifier'.
  const widgetB1BemModifiers = await widgetB1.getBemModifiers();
  await t.expect(widgetB1BemModifiers).eql([["cid", "1"], ["bar"]]);
});

test("040 returns array containing only BEM modifiers with name equal to 'bemModifierName' argument when it provided", async t => {
  const widgetA1 = new WidgetA();
  const widgetB1 = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB1.selector.count).eql(1);

  // -- Checks --

  // Check when page object's BEM base is a 'block'.
  const widgetA1BemModifiers = await widgetA1.getBemModifiers("mod3");
  await t.expect(widgetA1BemModifiers).eql([["mod3", "val"]]);

  // Check when page object's BEM base is a 'block--modifier'.
  const widgetB1BemModifiers = await widgetB1.getBemModifiers("bar");
  await t.expect(widgetB1BemModifiers).eql([["bar"]]);
});

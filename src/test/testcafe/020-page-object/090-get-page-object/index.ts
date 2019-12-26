import {
  PageObject,
  PageObjectConstructorArgs
} from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetB extends PageObject {
  static bemBase = "widgetB";
  static displayName = "WidgetB";

  getWidgetA(...args: PageObjectConstructorArgs) {
    return this.getPageObject(WidgetA, ...args);
  }
}

class WidgetC extends PageObject {
  static bemBase = "widgetC";
  static displayName = "WidgetC";
}

fixture("PageObject#getPageObject()").page(`${__dirname}/index.html`);

test("010 returns correct page object -- case of direct call", async t => {
  const widgetA3 = new WidgetA(["cid", "3"]);
  const widgetA4 = new WidgetA(["cid", "4"]);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA3.selector.count).eql(1);
  await t.expect(widgetA4.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  // Check this page object set as parent and existing page object returned.
  const widgetA3InsideB = widgetB.getPageObject(WidgetA, ["cid", "3"]);
  await t.expect(widgetA3InsideB.selector.count).eql(1);
  await t
    .expect(widgetA3InsideB.selector.textContent)
    .eql("Widget A -- 3 inside Widget B");

  // Check this page object set as parent and non-existing page object returned.
  const widgetA3OutsideB = widgetB.getPageObject(WidgetA, ["cid", "4"]);
  await t.expect(widgetA3OutsideB.selector.count).eql(0);
});

test("020 returns correct page object -- case of specific method", async t => {
  const widgetA3 = new WidgetA(["cid", "3"]);
  const widgetA4 = new WidgetA(["cid", "4"]);
  const widgetB = new WidgetB();

  // -- Pre-checks --

  await t.expect(widgetA3.selector.count).eql(1);
  await t.expect(widgetA4.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);

  // -- Checks --

  // Check this page object set as parent and existing page object returned.
  const widgetA3InsideB = widgetB.getWidgetA(["cid", "3"]);
  await t.expect(widgetA3InsideB.selector.count).eql(1);
  await t
    .expect(widgetA3InsideB.selector.textContent)
    .eql("Widget A -- 3 inside Widget B");

  // Check this page object set as parent and non-existing page object returned.
  const widgetA3OutsideB = widgetB.getWidgetA(["cid", "4"]);
  await t.expect(widgetA3OutsideB.selector.count).eql(0);
});

test("030 replaces provided parent page object by this page object", async t => {
  const widgetA1 = new WidgetA(["cid", "4"]);
  const widgetB = new WidgetB();
  const widgetC = new WidgetC();

  // -- Pre-checks --

  await t.expect(widgetA1.selector.count).eql(1);
  await t.expect(widgetB.selector.count).eql(1);
  await t.expect(widgetC.selector.count).eql(1);

  // -- Checks --

  // Check case of direct call.
  const widgetA1InsideB = widgetB.getPageObject(WidgetA, widgetC, ["cid", "1"]);
  await t.expect(widgetA1InsideB.selector.count).eql(1);
  await t
    .expect(widgetA1InsideB.selector.textContent)
    .eql("Widget A -- 1 inside Widget B");

  // Check case of specific method.
  const widgetA2InsideB = widgetB.getWidgetA(widgetC, ["cid", "2"]);
  await t.expect(widgetA2InsideB.selector.count).eql(1);
  await t
    .expect(widgetA2InsideB.selector.textContent)
    .eql("Widget A -- 2 inside Widget B");
});

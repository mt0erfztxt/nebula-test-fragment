import { PageObject } from "../../../../main/page-object";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";

  /**
   * @returns {Object<string, boolean>}
   */
  getStateParts() {
    return Object.assign(super.getStateParts(), {
      foo: false,
      a1: false,
      a2: true
    });
  }
}

class WidgetB extends WidgetA {
  static bemBase = "widgetB";
  static displayName = "WidgetB";
}

class WidgetC extends WidgetB {
  static bemBase = "widgetC";
  static displayName = "WidgetC";

  /**
   * @returns {Object<string, boolean>}
   */
  getStateParts() {
    return Object.assign(super.getStateParts(), { foo: true, c: false });
  }
}

fixture("PageObject#getStateParts()").page(__dirname + "/index.html");

test("010 returns page object's state parts -- case without override", async t => {
  await t
    .expect(new WidgetB().getStateParts())
    .eql({ cid: false, foo: false, a1: false, a2: true });
});

test("020 returns page object's state parts -- case with override", async t => {
  await t
    .expect(new WidgetC().getStateParts())
    .eql({ cid: false, foo: true, a1: false, a2: true, c: false });
});

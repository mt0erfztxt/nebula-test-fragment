import PageObject from "../../../../main/pageObject";

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";

  /**
   * @returns {Object<string, boolean>}
   */
  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      foo: { simple: false, writable: false },
      a1: { simple: true, writable: false },
      a2: { simple: true, writable: true }
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
  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      foo: { simple: false, writable: true },
      c: { simple: true, writable: false }
    });
  }
}

fixture("PageObject#getStateSpec()")
  .page(`${__dirname}/index.html`)
  .beforeEach(async t => await t.maximizeWindow());

test("010 returns page object's state parts -- case without override", async t => {
  await t.expect(new WidgetB().getStateSpec()).eql({
    cid: { simple: false, writable: false },
    foo: { simple: false, writable: false },
    a1: { simple: true, writable: false },
    a2: { simple: true, writable: true }
  });
});

test("020 returns page object's state parts -- case with override", async t => {
  await t.expect(new WidgetC().getStateSpec()).eql({
    cid: { simple: false, writable: false },
    foo: { simple: false, writable: true },
    a1: { simple: true, writable: false },
    a2: { simple: true, writable: true },
    c: { simple: true, writable: false }
  });
});

import { SelectorTransformationAlias } from "../../../../main/abstract-page-object";
import { BemBase } from "../../../../main/bem";
import { PageObject } from "../../../../main/page-object";
import { filterByText } from "../../../../main/selector";

const appRootPath = require("app-root-path");

function buildPagePath(testId: string): string {
  return (
    appRootPath.path + `/src/test/testcafe/020-page-object/010-constructor/${testId}.html`
  );
}

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

  /**
   * Adds 'label' and 'text' selector transformation aliases.
   */
  transformSelector(
    selectorTransformationAlias: SelectorTransformationAlias,
    selector: Selector,
    bemBase: BemBase
  ) {
    selector = super.transformSelector(
      selectorTransformationAlias,
      selector,
      bemBase
    );

    const [n, v] = selectorTransformationAlias;

    if (!["label", "text"].includes(n)) {
      return selector;
    }

    if ("label" === n || "text" === n) {
      selector = filterByText(selector, v as RegExp | string);
    }

    return selector;
  }
}

fixture("PageObject");

test.page(buildPagePath("010"))(
  "010 created with correct BEM base",
  async t => {
    const widgetA = new WidgetA();
    await t.expect(widgetA.bemBase.toString()).eql("widgetA");
    await t.expect(widgetA.bemBase.frozen).ok();
  }
);

test.page(buildPagePath("020"))(
  "020 can be created without selector transformations at all",
  async t => {
    const widgetA = new WidgetA();
    await t.expect(widgetA.selector.count).eql(2);
    await t.expect(widgetA.selector.nth(0).textContent).eql("Widget A -- 1");
    await t.expect(widgetA.selector.nth(1).textContent).eql("Widget A -- 2");
  }
);

test.page(buildPagePath("025"))(
  "025 can be created using selector transformation function",
  async t => {
    const widgetA2 = new WidgetA((s, b) =>
      s.filter(b.setMod(["foo"]).toQuerySelector())
    );
    await t.expect(widgetA2.selector.count).eql(1);
    await t.expect(widgetA2.selector.nth(0).textContent).eql("Widget A -- 2");

    const widgetA3 = new WidgetA(s => filterByText(s, /A -- 3/));
    await t.expect(widgetA3.selector.count).eql(1);
    await t.expect(widgetA3.selector.nth(0).textContent).eql("Widget A -- 3");

    const widgetA = new WidgetA(s => s.withText("No such element"));
    await t.expect(widgetA.selector.count).eql(0);

    // -- Check failure --

    let isThrown = false;
    try {
      await t.expect(widgetA3.selector.textContent).eql("foo");
    } catch (e) {
      isThrown = true;
      await t
        .expect(e.errMsg)
        .match(/.+expected 'Widget A -- 3' to deeply equal 'foo'/);
    }
    await t.expect(isThrown).ok();
  }
);

test.page(buildPagePath("030"))(
  "030 parent page object can be provided as first selector transformation",
  async t => {
    // Without parent.
    const widgetA1 = new WidgetA();
    await t.expect(widgetA1.selector.textContent).eql("Widget A -- 1");
    await t.expect(widgetA1.selector.parent(0).tagName).eql("body");

    // With parent.
    const widgetB = new WidgetB();
    const widgetA2 = new WidgetA(widgetB);
    await t.expect(widgetA2.selector.textContent).eql("Widget A -- 2");
    await t.expect(widgetA2.selector.parent(0).tagName).eql("div");
    await t.expect(widgetA2.selector.parent(0).classNames).eql(["widgetB"]);

    // Throws if not first.
    let isThrown = false;
    try {
      new WidgetA(s => filterByText(s, /A -- 2/), widgetB);
    } catch (e) {
      isThrown = true;
      await t
        .expect(e.message)
        .eql(
          "WidgetA -- only first selector transformation " +
            "allowed to be parent page object but transformation at index 1 " +
            "is page object"
        );
    }
    await t.expect(isThrown).ok();
  }
);

test.page(buildPagePath("040"))(
  "040 can be created using multiple selector transformations",
  async t => {
    const widgetA23 = new WidgetA(
      (s, b) => s.filter(b.setMod(["foo"]).toQuerySelector()),
      (s, b) => s.filter(b.setMod(["bar"]).toQuerySelector())
    );
    await t.expect(widgetA23.selector.count).eql(2);
    await t.expect(widgetA23.selector.nth(0).textContent).eql("Widget A -- 2");
    await t.expect(widgetA23.selector.nth(1).textContent).eql("Widget A -- 3");

    const widgetA3 = new WidgetA(
      (s, b) => s.filter(b.setMod(["foo"]).toQuerySelector()),
      s => filterByText(s, "Widget A -- 3")
    );
    await t.expect(widgetA3.selector.count).eql(1);
    await t.expect(widgetA3.selector.textContent).eql("Widget A -- 3");
  }
);

test.page(buildPagePath("050"))(
  "050 can be created using built-in 'cid' transformation",
  async t => {
    const widgetA2 = new WidgetA(["cid", 101]);
    await t.expect(widgetA2.selector.count).eql(1);
    await t
      .expect(widgetA2.selector.classNames)
      .eql(["widgetA", "widgetA--cid_101"]);
    await t.expect(widgetA2.selector.textContent).eql("Widget A -- 2");

    // -- Check failure --

    let isThrown = false;
    try {
      await t.expect(widgetA2.selector.textContent).eql("Widget A -- 1");
    } catch (e) {
      isThrown = true;
      await t
        .expect(e.errMsg)
        .match(/.+expected 'Widget A -- 2' to deeply equal 'Widget A -- 1'/);
    }
    await t.expect(isThrown).ok();
  }
);

test.page(buildPagePath("060"))(
  "060 can be created using built-in 'idx' transformation",
  async t => {
    const widgetA1 = new WidgetA(["idx", 0]);
    await t.expect(widgetA1.selector.count).eql(1);
    await t.expect(widgetA1.selector.classNames).eql(["widgetA"]);
    await t.expect(widgetA1.selector.textContent).eql("Widget A -- 1");

    const widgetA3 = new WidgetA(["idx", 2]);
    await t.expect(widgetA3.selector.count).eql(1);
    await t.expect(widgetA3.selector.textContent).eql("Widget A -- 3");

    // -- Check failure --

    let isThrown = false;
    try {
      await t.expect(widgetA3.selector.textContent).eql("abc");
    } catch (e) {
      isThrown = true;
      await t
        .expect(e.errMsg)
        .match(/.+expected 'Widget A -- 3' to deeply equal 'abc'/);
    }
    await t.expect(isThrown).ok();
  }
);

test.page(buildPagePath("070"))(
  "070 applies transformations in correct order",
  async t => {
    const widgetA1 = new WidgetA(["cid", "foo"], ["idx", 0]);
    await t.expect(widgetA1.selector.count).eql(1);
    await t
      .expect(widgetA1.selector.classNames)
      .eql(["widgetA", "widgetA--cid_foo"]);
    await t.expect(widgetA1.selector.textContent).eql("Widget A -- 1");

    const widgetA2 = new WidgetA(["cid", "foo"], ["idx", 1]);
    await t.expect(widgetA2.selector.count).eql(1);
    await t
      .expect(widgetA2.selector.classNames)
      .eql(["widgetA", "widgetA--cid_foo"]);
    await t.expect(widgetA2.selector.textContent).eql("Widget A -- 2");

    // With parent.
    const widgetB = new WidgetB();
    const widgetA4 = new WidgetA(widgetB, ["cid", "bar"], ["idx", 1]);
    await t.expect(widgetA4.selector.count).eql(1);
    await t
      .expect(widgetA4.selector.classNames)
      .eql(["widgetA", "widgetA--cid_bar"]);
    await t.expect(widgetA4.selector.textContent).eql("Widget A -- 4");

    // -- Check failure --

    let isThrown = false;
    try {
      await t.expect(widgetA4.selector.textContent).eql("foobar");
    } catch (e) {
      isThrown = true;
      await t
        .expect(e.errMsg)
        .match(/.+expected 'Widget A -- 4' to deeply equal 'foobar'/);
    }
    await t.expect(isThrown).ok();
  }
);

test.page(buildPagePath("080"))(
  "080 can provide additional selector transformation aliases",
  async t => {
    const widgetC1 = new WidgetC(["label", "Widget C -- 1"]);
    await t.expect(widgetC1.selector.count).eql(1);
    await t.expect(widgetC1.selector.classNames).eql(["widgetC"]);
    await t.expect(widgetC1.selector.textContent).eql("Widget C -- 1");

    const widgetC3 = new WidgetC(["text", /C -- 3/]);
    await t.expect(widgetC3.selector.count).eql(1);
    await t
      .expect(widgetC3.selector.classNames)
      .eql(["widgetC", "widgetC--cid_foo"]);
    await t.expect(widgetC3.selector.textContent).eql("Widget C -- 3");

    const widgetC4 = new WidgetC(["cid", "foo"], ["text", /C -- 4/]);
    await t.expect(widgetC4.selector.count).eql(1);
    await t
      .expect(widgetC4.selector.classNames)
      .eql(["widgetC", "widgetC--cid_foo"]);
    await t.expect(widgetC4.selector.textContent).eql("Widget C -- 4");

    const widgetC = new WidgetC(["cid", "bar"], ["text", /C -- 5/]);
    await t.expect(widgetC.selector.count).eql(0);
  }
);

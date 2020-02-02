import is from "@sindresorhus/is";
import { Selector } from "testcafe";
import { BemBase } from "../../../../main/bem";
import { PageObject } from "../../../../main/page-object";

const appRootPath = require("app-root-path");

/**
 * Builds path (as string) to test's HTML file.
 *
 * @param {string} testId Test's id
 * @returns {string}
 */
function buildPagePath(testId) {
  return (
    appRootPath.path +
    `/lib/test/testcafe/010-page-object/010-construction/${testId}.html`
  );
}

class WidgetA extends PageObject {
  static bemBase = "widgetA";
  static displayName = "WidgetA";
}

class WidgetAA extends WidgetA {
  static displayName = "WidgetAA";
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
   *
   * @param {SelectorTransformationAlias} selectorTransformationAlias
   * @param {Selector} selector
   * @param {BemBase} bemBase
   * @returns {Selector}
   */
  transformSelector(selectorTransformationAlias, selector, bemBase) {
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
      if (is.regExp(v)) {
        selector = selector.withText(v);
      } else {
        selector = selector.withExactText(v);
      }
    }

    return selector;
  }
}

fixture("PageObject / Construction");

test.page(buildPagePath("010"))(
  "010 Page object created with correct BEM base",
  async t => {
    // Case when BEM base on class.
    const widgetA = new WidgetA();
    await t.expect(widgetA.bemBase.toString()).eql("widgetA");
    await t.expect(widgetA.bemBase.frozen).ok();
    await t.expect(widgetA.displayName).eql("WidgetA");

    // Case when BEM base on class.
    const widgetAA = new WidgetAA();
    await t.expect(widgetAA.bemBase.toString()).eql("widgetA");
    await t.expect(widgetAA.bemBase.frozen).ok();
    await t.expect(widgetAA.displayName).eql("WidgetAA");
  }
);

test.page(buildPagePath("020"))(
  "020 Page object can be created without selector transformations",
  async t => {
    const widgetA = new WidgetA();
    await t.expect(widgetA.selector.count).eql(2);
    await t.expect(widgetA.selector.nth(0).textContent).eql("Widget A -- 1");
    await t.expect(widgetA.selector.nth(1).textContent).eql("Widget A -- 2");
  }
);

test.page(buildPagePath("025"))(
  "025 Page object can be created using selector transformation function",
  async t => {
    const widgetA2 = new WidgetA((s, b) =>
      s.filter(b.setMod(["foo"]).toQuerySelector())
    );
    await t.expect(widgetA2.selector.count).eql(1);
    await t.expect(widgetA2.selector.nth(0).textContent).eql("Widget A -- 2");

    const widgetA3 = new WidgetA(s => s.withExactText("Widget A -- 3"));
    await t.expect(widgetA3.selector.count).eql(1);
    await t.expect(widgetA3.selector.nth(0).textContent).eql("Widget A -- 3");

    const widgetA = new WidgetA(s => s.withExactText("No such element"));
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
  "030 Page object can be created with parent page object provided as first selector transformation",
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
      new WidgetA(s => s.withText(/A -- 2/), widgetB);
    } catch (e) {
      isThrown = true;
      await t
        .expect(e.message)
        .eql(
          "WidgetA: only first selector transformation allowed to be parent " +
            "page object but transformation at index 1 is page object"
        );
    }
    await t.expect(isThrown).ok();
  }
);

test.page(buildPagePath("040"))(
  "040 Page object can be created using multiple selector transformations",
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
      (s, _) => s.withExactText("Widget A -- 3")
    );
    await t.expect(widgetA3.selector.count).eql(1);
    await t.expect(widgetA3.selector.textContent).eql("Widget A -- 3");
  }
);

// TODO: Test error thrown on invalid input.
test.page(buildPagePath("050"))(
  "050 Page object can be created using built-in 'cid' transformation",
  async t => {
    const widgetA2 = new WidgetA("101");
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

// TODO: Test error thrown on invalid input.
test.page(buildPagePath("060"))(
  "060 Page object can be created using built-in 'idx' transformation",
  async t => {
    const widgetA1 = new WidgetA(0);
    await t.expect(widgetA1.selector.count).eql(1);
    await t.expect(widgetA1.selector.classNames).eql(["widgetA"]);
    await t.expect(widgetA1.selector.textContent).eql("Widget A -- 1");

    const widgetA3 = new WidgetA(2);
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
  "070 Page object created with transformations applied in specified order",
  async t => {
    const widgetA1 = new WidgetA("foo", 0);
    await t.expect(widgetA1.selector.count).eql(1);
    await t
      .expect(widgetA1.selector.classNames)
      .eql(["widgetA", "widgetA--cid_foo"]);
    await t.expect(widgetA1.selector.textContent).eql("Widget A -- 1");

    const widgetA2 = new WidgetA("foo", 1);
    await t.expect(widgetA2.selector.count).eql(1);
    await t
      .expect(widgetA2.selector.classNames)
      .eql(["widgetA", "widgetA--cid_foo"]);
    await t.expect(widgetA2.selector.textContent).eql("Widget A -- 2");

    // With parent.
    const widgetB = new WidgetB();
    const widgetA4 = new WidgetA(widgetB, "bar", 1);
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
  "080 Page object can be created using custom selector transformation aliases",
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

    const widgetC4 = new WidgetC("foo", ["text", /C -- 4/]);
    await t.expect(widgetC4.selector.count).eql(1);
    await t
      .expect(widgetC4.selector.classNames)
      .eql(["widgetC", "widgetC--cid_foo"]);
    await t.expect(widgetC4.selector.textContent).eql("Widget C -- 4");

    const widgetC = new WidgetC("bar", ["text", /C -- 5/]);
    await t.expect(widgetC.selector.count).eql(0);
  }
);

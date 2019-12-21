import { PageObject } from "../../../../main/page-object";
import { filterByText } from "../../../../main/selector";

const appRootPath = require("app-root-path");

function buildPagePath(testId: string): string {
  return (
    appRootPath.path + `/src/test/testcafe/page-object/010-index/${testId}.html`
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

fixture("PageObject");

test.page(buildPagePath("010"))(
  "010 It created with correct BEM base",
  async t => {
    const widgetA = new WidgetA();
    await t.expect(widgetA.bemBase.toString()).eql("widgetA");
    await t.expect(widgetA.bemBase.frozen).ok();
  }
);

test.page(buildPagePath("020"))(
  "020 It can be created without selector transformations at all",
  async t => {
    const widgetA = new WidgetA();
    await t.expect(widgetA.selector.count).eql(2);
    await t.expect(widgetA.selector.nth(0).textContent).eql("Widget A -- 1");
    await t.expect(widgetA.selector.nth(1).textContent).eql("Widget A -- 2");
  }
);

test.page(buildPagePath("025"))(
  "025 It can be created with selector transformation function",
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
  "030 It allow parent page object to be passed as first selector transformation",
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
  }
);

test.page(buildPagePath("040"))(
  "040 It can be created using multiple selector transformations",
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

// test.page(buildPagePath("050"))(
//   "050 It should allow 'locator' argument to be a function",
//   async t => {
//     const f1 = new WidgetA((sel, _) => selector.filterByText(sel, "f1b"));
//
//     await t.expect(f1.selector.count).eql(1);
//     await t.expect(f1.selector.classNames).eql(["f1"]);
//     await t.expect(f1.selector.textContent).eql("f1b");
//
//     // -- Ensure it fails as expected
//
//     let isThrown = false;
//
//     try {
//       await t.expect(f1.selector.textContent).eql("foo");
//     } catch (e) {
//       expect(e.errMsg, "to match", /.+expected 'f1b' to deeply equal 'foo'/);
//
//       isThrown = true;
//     }
//
//     expect(isThrown, "to be true");
//   }
// );
//
// test.page(buildPagePath("060"))(
//   "060 It should allow 'locator' argument to be a list of functions",
//   async t => {
//     const f1 = new WidgetA([
//       (sel, _) => selector.filterByText(sel, "f1b"),
//       (sel, _) => sel.nth(3)
//     ]);
//
//     await t.expect(f1.selector.count).eql(1);
//     await t.expect(f1.selector.classNames).eql(["f1"]);
//     await t.expect(f1.selector.textContent).eql("f1b");
//     await t.expect(f1.selector.getAttribute("data-nth")).eql("3");
//
//     // -- Ensure it fails as expected
//
//     let isThrown = false;
//
//     try {
//       await t.expect(f1.selector.getAttribute("data-nth")).eql("4");
//     } catch (e) {
//       expect(e.errMsg, "to match", /.+expected '3' to deeply equal '4'/);
//
//       isThrown = true;
//     }
//
//     expect(isThrown, "to be true");
//   }
// );
//
// test.page(buildPagePath("070"))(
//   "070 It should allow 'locator' argument to be a POJO with built-in 'cid' transformation",
//   async t => {
//     const f1 = new WidgetA({ cid: "baz" });
//
//     await t.expect(f1.selector.count).eql(1);
//     await t.expect(f1.selector.classNames).eql(["f1", "f1--cid_baz"]);
//     await t.expect(f1.selector.textContent).eql("baz");
//
//     // -- Ensure it fails as expected
//
//     let isThrown = false;
//
//     try {
//       await t.expect(f1.selector.textContent).eql("foo");
//     } catch (e) {
//       expect(e.errMsg, "to match", /.+expected 'baz' to deeply equal 'foo'/);
//
//       isThrown = true;
//     }
//
//     expect(isThrown, "to be true");
//   }
// );
//
// test.page(buildPagePath("080"))(
//   "080 It should allow 'locator' argument to be a POJO with built-in 'cns' transformation",
//   async t => {
//     const f1 = new WidgetA({ cns: "baz" });
//
//     await t.expect(f1.selector.count).eql(1);
//     await t.expect(f1.selector.classNames).eql(["f1", "f1--cns_baz"]);
//     await t.expect(f1.selector.textContent).eql("baz");
//
//     // -- Ensure it fails as expected
//
//     let isThrown = false;
//
//     try {
//       await t.expect(f1.selector.textContent).eql("foo");
//     } catch (e) {
//       expect(e.errMsg, "to match", /.+expected 'baz' to deeply equal 'foo'/);
//
//       isThrown = true;
//     }
//
//     expect(isThrown, "to be true");
//   }
// );
//
// test.page(buildPagePath("090"))(
//   "090 It should allow 'locator' argument to be a POJO with built-in 'idx' transformation",
//   async t => {
//     const f1 = new WidgetA({ idx: 2 });
//
//     await t.expect(f1.selector.count).eql(1);
//     await t.expect(f1.selector.classNames).eql(["f1"]);
//     await t.expect(f1.selector.textContent).eql("baz");
//
//     // -- Ensure it fails as expected
//
//     let isThrown = false;
//
//     try {
//       await t.expect(f1.selector.textContent).eql("abc");
//     } catch (e) {
//       expect(e.errMsg, "to match", /.+expected 'baz' to deeply equal 'abc'/);
//
//       isThrown = true;
//     }
//
//     expect(isThrown, "to be true");
//   }
// );
//
// test.page(buildPagePath("100"))(
//   "100 It should apply built-in transformations in following order 'cns' -> 'cid' -> 'idx'",
//   async t => {
//     const f1 = new WidgetA({ idx: 1, cns: "bar", cid: "11" });
//
//     await t.expect(f1.selector.count).eql(1);
//     await t
//       .expect(f1.selector.classNames)
//       .eql(["f1", "f1--cns_bar", "f1--cid_11"]);
//     await t.expect(f1.selector.textContent).eql("bar 11 1");
//
//     // -- Ensure it fails as expected
//
//     let isThrown = false;
//
//     try {
//       await t.expect(f1.selector.textContent).eql("bar 11 0");
//     } catch (e) {
//       expect(
//         e.errMsg,
//         "to match",
//         /.+expected 'bar 11 1' to deeply equal 'bar 11 0'/
//       );
//
//       isThrown = true;
//     }
//
//     expect(isThrown, "to be true");
//   }
// );
//
// test.page(buildPagePath("100"))(
//   "110 It should allow 'locator' argument to be a list of POJOs",
//   async t => {
//     const f1a = new WidgetA([{ cns: "bar", cid: "11" }, { idx: 2 }]);
//     await t.expect(f1a.selector.count).eql(1);
//     await t
//       .expect(f1a.selector.classNames)
//       .eql(["f1", "f1--cns_bar", "f1--cid_11"]);
//     await t.expect(f1a.selector.textContent).eql("bar 11 2");
//
//     // -- Check that order does matter
//
//     const f1b = new WidgetA([{ idx: 2 }, { cns: "bar", cid: "11" }]);
//     await t.expect(f1b.selector.count).eql(0);
//   }
// );
//
// test.page(buildPagePath("120"))(
//   "120 It should allow 'locator' argument to be a mix of function and POJOs",
//   async t => {
//     const f1 = new WidgetA([(sel, _) => sel.filter('[data-id="bar"]'), { idx: 2 }]);
//
//     await t.expect(f1.selector.count).eql(1);
//     await t.expect(f1.selector.classNames).eql(["f1"]);
//     await t.expect(f1.selector.getAttribute("data-id")).eql("bar");
//     await t.expect(f1.selector.textContent).eql("bar2");
//
//     // -- Ensure it fails as expected
//
//     let isThrown = false;
//
//     try {
//       await t.expect(f1.selector.textContent).eql("foo");
//     } catch (e) {
//       expect(e.errMsg, "to match", /.+expected 'bar2' to deeply equal 'foo'/);
//
//       isThrown = true;
//     }
//
//     expect(isThrown, "to be true");
//   }
// );
//
// test.page(buildPagePath("130"))(
//   "130 It should allow 'locator' argument to have custom tranformations provided by derived fragments",
//   async t => {
//     class F2 extends WidgetA {
//       /**
//        * Allows to select fragment F2 by its text and it can be a string,
//        * a RegExp or a tupple where first element is a string/RegExp and second
//        * is an options (see implementation for details).
//        */
//       transformSelector(transformations, sel, bemBase) {
//         sel = super.transformSelector(transformations, sel, bemBase);
//
//         for (const k in transformations) {
//           if (_.has(transformations, k) && k === "text") {
//             const v = transformations[k];
//             const [val, opts] = _.isArray(v) ? v : [v];
//             sel = selector.filterByText(sel, val, opts);
//           }
//         }
//
//         return sel;
//       }
//     }
//
//     Object.defineProperties(F2, {
//       bemBase: {
//         value: "f2"
//       },
//       displayName: {
//         value: "F2"
//       }
//     });
//
//     const f2a = new F2([{ cid: "1" }, { text: "Otherthing" }]);
//     await t.expect(f2a.selector.count).eql(1);
//     await t.expect(f2a.selector.classNames).eql(["f2", "f2--cid_1"]);
//     await t.expect(f2a.selector.textContent).eql("Otherthing");
//
//     const f2b = new F2([{ cid: "1", text: "Otherthing" }]);
//     await t.expect(f2b.selector.count).eql(1);
//     await t.expect(f2b.selector.classNames).eql(["f2", "f2--cid_1"]);
//     await t.expect(f2b.selector.textContent).eql("Otherthing");
//   }
// );

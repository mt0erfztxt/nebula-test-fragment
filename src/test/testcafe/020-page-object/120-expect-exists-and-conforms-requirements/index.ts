import { Selector } from "testcafe";
import { PageObject } from "../../../../main/page-object";

class Bar extends PageObject {
  static bemBase = "bar";
  static displayName = "Bar";
}

class Foo extends PageObject {
  static bemBase = "foo";
  static displayName = "Foo";
}

// TODO Split long tests.
// TODO Use "Bar 0Buz 0" for 'text' requirements testing.
fixture("PageObject#expectExistsAndConformsRequirements()").page(
  `${__dirname}/index.html`
);

test("010 fails when page object's selector returns number of DOM elements other than one", async t => {
  let isThrown;
  const foo = new Foo(["cid", "non-existent"]);

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(0);

  // -- Checks --

  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements();
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Selector must return exactly one DOM element but it returned 0 of them.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("020 succeeds when page object's selector returns exactly one DOM element and requirements not provided", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements();
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("030 allows to assert that attribute exists -- case of attribute without value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-checked"]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-absent"]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must have 'data-absent' attribute but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("040 allows to assert that attribute not exists -- case of attribute without value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-absent", undefined, true]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-checked", undefined, true]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must not have 'data-checked' attribute but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("050 allows to assert that attribute exists -- case of attribute with value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-id", 42]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-id", 43]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must have 'data-id,43' attribute but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("060 allows to assert that attribute not exists -- case of attribute with value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-id", 43, true]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-id", 42, true]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must not have 'data-id,42' attribute but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("070 allows to assert that set of attributes exist", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-id", 42], ["disabled"]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [["data-id", 42], ["data-absent"]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must have 'data-absent' attribute but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("080 allows to assert that set of attributes not exist", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ["data-absent", undefined, true],
        ["data-id", 43, true]
      ]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: [
        ["data-absent", undefined, true],
        ["data-id", 42, true]
      ]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must not have 'data-id,42' attribute but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("090 accepts not only attribute requirement but attribute name", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: ["data-checked"]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      attributes: ["data-absent"]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must have 'data-absent' attribute but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("100 allows to assert that BEM modifier exists -- case without value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["checked"]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["absent"]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by Foo's selector must have 'absent,' BEM modifier but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("110 allows to assert that BEM modifier not exists -- case without value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["absent", undefined, true]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["checked", undefined, true]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by Foo's selector must not have 'checked,' BEM modifier but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("120 allows to assert that BEM modifier exists -- case with value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["id", "42"]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["id", "43"]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by Foo's selector must have 'id,43' BEM modifier but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("130 allows to assert that BEM modifier not exists -- case with value", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["id", "43", true]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["id", "42", true]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by Foo's selector must not have 'id,42' BEM modifier but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("140 allows to assert that set of BEM modifiers exist", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["id", "42"], ["disabled"]]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [["id", "42"], ["absent"]]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by Foo's selector must have 'absent,' BEM modifier but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("150 allows to assert that set of BEM modifiers not exist", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        ["absent", undefined, true],
        ["id", "43", true]
      ]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: [
        ["absent", undefined, true],
        ["id", "42", true]
      ]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by Foo's selector must not have 'id,42' BEM modifier but it does.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("160 accepts not only BEM modifier requirement but BEM modifier name", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: ["checked"]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      bemModifiers: ["absent"]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by Foo's selector must have 'absent,' BEM modifier but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("170 allows to assert that page object's selector returned DOM element's tag equal specified", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({ tagName: "button" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({ tagName: "div" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Tag of DOM element returned by selector must be 'div' but it is 'button'.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("180 allows to assert that page object's selector returned DOM element have specified text", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success -- string.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({ text: "Button 42" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- string.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({ text: "Button 0" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must be equal 'Button 0'.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check success -- RegExp.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: new RegExp("\\w+ton 42$")
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- RegExp.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: new RegExp("\\w+ton 0$")
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text of DOM element returned by selector must " +
          "match /\\w+ton 0$/: expected 0 to deeply equal 1"
      );
  }
  await t.expect(isThrown).ok();

  // Check failure -- regular expression literal.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: /\w+ton 0$/
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text of DOM element returned by selector must " +
          "match /\\w+ton 0$/: expected 0 to deeply equal 1"
      );
  }
  await t.expect(isThrown).ok();
});

test("190 allows to assert that page object's selector returned DOM element have no specified text", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success -- string.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: ["Button 0", true]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- string.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: ["Button 42", true]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must not be equal 'Button 42'.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check success -- RegExp.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: [new RegExp("\\w+ton 0$"), true]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- RegExp.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: [new RegExp("\\w+ton 42$"), true]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text of DOM element returned by selector must not " +
          "match /\\w+ton 42$/: expected 1 to deeply equal 0"
      );
  }
  await t.expect(isThrown).ok();

  // Check failure -- regular expression literal.
  isThrown = false;
  try {
    await foo.expectExistsAndConformsRequirements({
      text: [/\w+ton 42$/, true]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text of DOM element returned by selector must not " +
          "match /\\w+ton 42$/: expected 1 to deeply equal 0"
      );
  }
  await t.expect(isThrown).ok();
});

test("200 allows to assert that page object's selector returned DOM element have specified text content", async t => {
  let isThrown;
  const bar = new Bar();

  // -- Pre-checks --

  await t.expect(bar.selector.count).eql(1);

  // -- Checks --

  // Check success -- string.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: "Bar 0Buz 0"
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- string.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: "Bar 1Buz 0"
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text content of DOM element returned by selector must be equal 'Bar 1Buz 0'.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check success -- RegExp.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: new RegExp("r 0Buz \\d$")
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- RegExp.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: new RegExp("r \\dBuz 1$")
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text content of DOM element returned by selector " +
          "must match /r \\dBuz 1$/: expected 'Bar 0Buz 0' to match /r \\dBuz 1$/"
      );
  }
  await t.expect(isThrown).ok();

  // Check failure -- regular expression literal.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: /r \dBuz 1$/
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text content of DOM element returned by selector " +
          "must match /r \\dBuz 1$/: expected 'Bar 0Buz 0' to match /r \\dBuz 1$/"
      );
  }
  await t.expect(isThrown).ok();
});

test("210 allows to assert that page object's selector returned DOM element have no specified text content", async t => {
  let isThrown;
  const bar = new Bar();

  // -- Pre-checks --

  await t.expect(bar.selector.count).eql(1);

  // -- Checks --

  // Check success -- string.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: ["Bar 1Buz 1", true]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- string.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: ["Bar 0Buz 0", true]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text content of DOM element returned by selector must not be equal 'Bar 0Buz 0'.*/
      );
  }
  await t.expect(isThrown).ok();

  // Check success -- RegExp.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: [new RegExp("r 1Buz \\d$"), true]
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure -- RegExp.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: [new RegExp("r \\dBuz 0$"), true]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text content of DOM element returned by selector " +
          "must not match /r \\dBuz 0$/: expected 'Bar 0Buz 0' not to match " +
          "/r \\dBuz 0$/"
      );
  }
  await t.expect(isThrown).ok();

  // Check failure -- regular expression literal.
  isThrown = false;
  try {
    await bar.expectExistsAndConformsRequirements({
      textContent: [/r \dBuz 0$/, true]
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .eql(
        "AssertionError: Text content of DOM element returned by selector " +
          "must not match /r \\dBuz 0$/: expected 'Bar 0Buz 0' not to match " +
          "/r \\dBuz 0$/"
      );
  }
  await t.expect(isThrown).ok();
});

test("220 It should handle 'selector' option", async t => {
  const bar = new Bar();

  // -- Pre-checks --

  await t.expect(Selector(".selector-option").count).eql(1);

  // -- Checks --

  await bar.expectExistsAndConformsRequirements(
    { text: "Selector Option" },
    {
      selector: Selector(".selector-option")
    }
  );
});

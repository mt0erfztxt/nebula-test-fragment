import { Selector } from "testcafe";
import { expectHasClassNames } from "../../../../main/selector";

const assert = require("assert");
const appRootPath = require("app-root-path");

fixture("selector.expectHasClassNames()").page(
  appRootPath.path +
    "/src/test/testcafe/selector/expect-has-class-names/index.html"
);

test("010 It should fail when selector does not return DOM elements", async t => {
  let isThrown = false;
  try {
    await expectHasClassNames(".non-existent", ["foo"]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Selector must return exactly one DOM element but '0' of them returned.*/
      );
  }
  assert.ok(isThrown);
});

test("020 It should fail when selector return more than one DOM element", async t => {
  let isThrown = false;
  try {
    await expectHasClassNames(".a", ["a"]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Selector must return exactly one DOM element but '2' of them returned.*/
      );
  }
  assert.ok(isThrown);
});

test("030 It should fail when selector must have no class names at all but it does", async t => {
  const sel = Selector("article");
  await t.expect(sel.exists).ok();

  let isThrown = false;
  try {
    await expectHasClassNames(sel, []);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Selector must have no class names but it have 'something, other'.*/
      );
  }
  assert.ok(isThrown);
});

test("040 It should succeed when selector must have no class names at all and it doesn't", async t => {
  const sel = Selector("span");
  await t.expect(sel.exists).ok();
  await t.expect(sel.textContent).eql("Nothing special");

  let isThrown = false;
  try {
    await expectHasClassNames(sel, []);
  } catch (e) {
    isThrown = true;
  }
  assert.strictEqual(isThrown, false);
});

test("050 It should fail when selector must have class name but it doesn't", async t => {
  let isThrown = false;
  try {
    await expectHasClassNames(".b", [["bar"], ["foo"]]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(/.*Selector must have 'foo' class name but it doesn't.*/);
  }
  assert.ok(isThrown);
});

test("060 It should succeed when selector must have class name and it does", async () => {
  let isThrown = false;
  try {
    await expectHasClassNames(".b", ["bar", "bar1"]);
  } catch (e) {
    isThrown = true;
  }
  assert.strictEqual(isThrown, false);
});

test("070 It should fail when selector must have no class name but it does", async t => {
  let isThrown = false;
  try {
    await expectHasClassNames(".b", [["bar1", true]]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(/.*Selector must have no 'bar1' class name but it does.*/);
  }
  assert.ok(isThrown);
});

test("080 It should succeed when selector must have no class name and it doesn't", async () => {
  let isThrown = false;
  try {
    await expectHasClassNames(".b", ["bar", "bar0", ["foo", true]]);
  } catch (e) {
    isThrown = true;
  }
  assert.strictEqual(isThrown, false);
});

test("090 It should fail when selector must have only specified class names but it doesn't", async t => {
  let isThrown = false;
  try {
    await expectHasClassNames(".b", ["b", "bar", "bar0", "bar1"], {
      only: true
    });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Selector must have only 'b, bar, bar0, bar1' class names but it have 'b, bar, bar0, bar1, bar2'.*/
      );
  }
  assert.ok(isThrown);
});

test("100 It should succeed when selector must have only specified class names and it does", async () => {
  let isThrown;

  isThrown = false;
  try {
    await expectHasClassNames(
      ".b",
      [["b"], ["bar"], ["bar0"], ["bar1"], ["bar2"]],
      {
        only: true
      }
    );
  } catch (e) {
    isThrown = true;
  }
  assert.strictEqual(isThrown, false);

  // Check that class names that must not present are excluded from list of
  // class names selector must only have.
  isThrown = false;
  try {
    await expectHasClassNames(
      ".b",
      [["b"], ["bar"], ["bar0"], ["bar1"], ["bar2"], ["foo", true]],
      { only: true }
    );
  } catch (e) {
    isThrown = true;
  }
  assert.strictEqual(isThrown, false);
});

test("110 It should allow each class name spec to be a class name or a tuple of class name and optional negation", async () => {
  let isThrown = false;
  try {
    await expectHasClassNames(".b", [
      "b",
      "bar",
      ["bar1"],
      ["bar2", false],
      ["foo", true]
    ]);
  } catch (e) {
    isThrown = true;
  }
  assert.strictEqual(isThrown, false);
});

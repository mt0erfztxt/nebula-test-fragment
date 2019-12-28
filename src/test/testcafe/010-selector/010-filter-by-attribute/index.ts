const appRootPath = require("app-root-path");
import { Selector } from "testcafe";

import { filterByAttribute } from "../../../../main/selector";

fixture("selector.filterByAttribute()").page(
  appRootPath.path +
    "/src/test/testcafe/010-selector/010-filter-by-attribute/index.html"
);

test("010 It should allow filter selector by absence of attribute", async t => {
  // -- Pre-checks --

  // Selector returns all elements in test group.
  const selector = Selector(".test-010");
  await t.expect(selector.count).eql(2);

  // No element with 'data-non-existent' attribute exists in test group.
  const filteredSelector1 = filterByAttribute(selector, ["data-non-existent"]);
  await t.expect(filteredSelector1.count).eql(0);

  // -- Checks --

  const filteredSelector2 = filterByAttribute(selector, [
    "data-non-existent",
    undefined,
    true
  ]);
  await t.expect(filteredSelector2.count).eql(2);

  const filteredSelector3 = filterByAttribute(selector, [
    "data-attr010",
    undefined,
    true
  ]);
  await t.expect(filteredSelector3.count).eql(1);
  await t.expect(filteredSelector3.textContent).eql("Test 010 | No attributes");
});

test("020 It should allow filter selector by presence of attribute", async t => {
  // -- Pre-checks --

  // Selector returns all elements in test group.
  const selector = Selector(".test-020");
  await t.expect(selector.count).eql(2);

  // -- Checks --

  const filteredSelector1 = filterByAttribute(selector, ["data-attr020"]);
  await t.expect(filteredSelector1.count).eql(1);
  await t.expect(filteredSelector1.textContent).eql("Test 020 | data-attr020");
});

test("030 It should allow filter selector using both attribute name and value", async t => {
  // -- Pre-checks --

  // Selector returns all elements in test group.
  const sel = Selector(".test-030");
  await t.expect(sel.count).eql(5);

  // -- Checks --

  // RegExp value (literal).
  const filteredSel1a = filterByAttribute(sel, ["data-attr030", /foo/]);
  await t.expect(filteredSel1a.count).eql(2);
  await t.expect(filteredSel1a.nth(0).textContent).eql("Test 030 | foo");
  await t.expect(filteredSel1a.nth(1).textContent).eql("Test 030 | foobar");

  // RegExp value (constructor).
  const filteredSel1b = filterByAttribute(sel, ["data-attr030", new RegExp("foo")]);
  await t.expect(filteredSel1b.count).eql(2);
  await t.expect(filteredSel1b.nth(0).textContent).eql("Test 030 | foo");
  await t.expect(filteredSel1b.nth(1).textContent).eql("Test 030 | foobar");

  // RegExp value + isNot.
  const filteredSel2 = filterByAttribute(sel, ["data-attr030", /.*bar$/, true]);
  await t.expect(filteredSel2.count).eql(4);
  await t.expect(filteredSel2.nth(0).textContent).eql("Test 030 | ");
  await t.expect(filteredSel2.nth(1).textContent).eql("Test 030 | false");
  await t.expect(filteredSel2.nth(2).textContent).eql("Test 030 | 42");
  await t.expect(filteredSel2.nth(3).textContent).eql("Test 030 | foo");

  // Boolean value.
  const filteredSel3 = filterByAttribute(sel, ["data-attr030", false]);
  await t.expect(filteredSel3.count).eql(1);
  await t.expect(filteredSel3.textContent).eql("Test 030 | false");

  // Number value.
  const filteredSel4 = filterByAttribute(sel, ["data-attr030", 42]);
  await t.expect(filteredSel4.count).eql(1);
  await t.expect(filteredSel4.textContent).eql("Test 030 | 42");

  // String value.
  const filteredSel5 = filterByAttribute(sel, ["data-attr030", "foo"]);
  await t.expect(filteredSel5.count).eql(1);
  await t.expect(filteredSel5.textContent).eql("Test 030 | foo");

  // Non-RegExp value + isNot.
  const filteredSel6 = filterByAttribute(sel, ["data-attr030", "foo", true]);
  await t.expect(filteredSel6.count).eql(4);
  await t.expect(filteredSel2.nth(0).textContent).eql("Test 030 | ");
  await t.expect(filteredSel6.nth(1).textContent).eql("Test 030 | false");
  await t.expect(filteredSel6.nth(2).textContent).eql("Test 030 | 42");
  await t.expect(filteredSel6.nth(3).textContent).eql("Test 030 | foobar");
});

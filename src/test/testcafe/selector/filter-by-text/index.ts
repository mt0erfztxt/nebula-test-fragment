import { Selector } from "testcafe";
import { filterByText } from "../../../../main/selector";

const appRootPath = require("app-root-path");

fixture("selector.filterByText()").page(
  appRootPath.path + "/src/test/testcafe/selector/filter-by-text/index.html"
);

test("010 It filters selector by text", async t => {
  let sel;

  const allThings2 = Selector(".thing2");
  await t.expect(allThings2.count).eql(5);

  sel = filterByText(allThings2, "Text 1");
  await t.expect(sel.count).eql(1);

  sel = filterByText(allThings2, "Text 2");
  await t.expect(sel.count).eql(2);
});

test("020 It allows text to be a regular expression", async t => {
  // RegExp as literal.
  const sel1 = filterByText("div", /^4.*/);
  await t.expect(sel1.count).eql(2);
  await t.expect(sel1.nth(0).textContent).eql("4 Text");
  await t.expect(sel1.nth(1).textContent).eql("4");

  // RegExp as constructor.
  const sel2 = filterByText("div", new RegExp("^4.*"));
  await t.expect(sel2.count).eql(2);
  await t.expect(sel2.nth(0).textContent).eql("4 Text");
  await t.expect(sel2.nth(1).textContent).eql("4");
});

test("030 It stringifies text when it is not a string or regular expression", async t => {
  // Boolean.
  const sel1 = filterByText("div", false);
  await t.expect(sel1.count).eql(1);
  await t.expect(sel1.nth(0).textContent).eql("false");

  // Number.
  const sel2 = filterByText("div", 4);
  await t.expect(sel2.count).eql(1);
  await t.expect(sel2.nth(0).textContent).eql("4");
});

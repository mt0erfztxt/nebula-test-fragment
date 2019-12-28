import { Selector } from "testcafe";
import { expectDomElementsCountIs } from "../../../../main/selector";

const fooItemSelector = Selector(".foo__item");

fixture("PageObject#expectDomElementsCountIs()").page(
  `${__dirname}/index.html`
);

test("010 fails when selector not returned specified count of DOM elements", async t => {
  let isThrown;

  // -- Pre-checks --

  await t.expect(fooItemSelector.count).eql(3);

  // -- Checks --

  isThrown = false;
  try {
    await expectDomElementsCountIs(fooItemSelector, 2);
  } catch (e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*expected 3 to deeply equal 2.*/);
  }
  await t.expect(isThrown).ok();
});

test("020 succeeded when selector returned specified count of DOM elements", async t => {
  let isThrown;

  // -- Pre-checks --

  await t.expect(fooItemSelector.count).eql(3);

  // -- Checks --

  isThrown = false;
  try {
    await expectDomElementsCountIs(fooItemSelector, 3);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("030 uses assertion provided in options", async t => {
  let isThrown;

  // -- Pre-checks --

  await t.expect(fooItemSelector.count).eql(3);

  // -- Checks --

  isThrown = false;
  try {
    await expectDomElementsCountIs(fooItemSelector, 3, { assertion: "lt" });
  } catch (e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*expected 3 to be below 3.*/);
  }
  await t.expect(isThrown).ok();

  isThrown = false;
  try {
    await expectDomElementsCountIs(fooItemSelector, 3, { assertion: "lte" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("040 allows assertion to be negated using options", async t => {
  let isThrown;

  // -- Pre-checks --

  await t.expect(fooItemSelector.count).eql(3);

  // -- Checks --

  isThrown = false;
  try {
    await expectDomElementsCountIs(fooItemSelector, 2, { isNot: true });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  isThrown = false;
  try {
    await expectDomElementsCountIs(fooItemSelector, 3, {
      assertion: "lte",
      isNot: true
    });
  } catch (e) {
    isThrown = true;
    await t.expect(e.errMsg).match(/.*expected 3 to be above 3.*/);
  }
  await t.expect(isThrown).ok();
});

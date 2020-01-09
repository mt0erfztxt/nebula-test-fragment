import { Selector } from "testcafe";
import { PageObject } from "../../../../main/page-object";

class Foo extends PageObject {
  static bemBase = "foo";
  static displayName = "Foo";
}

fixture("PageObject#expectTextIs()").page(`${__dirname}/index.html`);

test("010 asserts on DOM element's text -- case without negation flag", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectTextIs("Foo");
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectTextIs("Bar");
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must be equal 'Bar'.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("020 asserts on DOM element's text -- case with negation flag", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectTextIs([/Bar/, true]);
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectTextIs([/Foo/, true]);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must not match \/Foo\/.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("030 handles 'selector' option", async t => {
  let isThrown;
  const foo = new Foo();
  const bar = Selector(".bar");

  // -- Pre-checks --

  await t.expect(foo.selector.count).eql(1);
  await t.expect(bar.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await foo.expectTextIs("Bar", { selector: bar });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await foo.expectTextIs("Foo", { selector: bar });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must be equal 'Foo'.*/
      );
  }
  await t.expect(isThrown).ok();
});

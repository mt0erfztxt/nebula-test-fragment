import { Selector } from "testcafe";
import { PageObject } from "../../../../main/page-object";

class Lnk extends PageObject {
  static bemBase = "lnk";
  static displayName = "Lnk";
}

fixture("PageObject#expectIsLink()").page(`${__dirname}/index.html`);

test("010 asserts on DOM element's tag", async t => {
  let isThrown;
  const lnk1 = new Lnk(["cid", "1"]);
  const lnk2 = new Lnk(["cid", "2"]);

  // -- Pre-checks --

  await t.expect(lnk1.selector.count).eql(1);
  await t.expect(lnk2.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await lnk1.expectIsLink();
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await lnk2.expectIsLink();
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Tag of DOM element returned by selector must be 'a' but it is 'div'.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("020 handles 'href' option", async t => {
  let isThrown;
  const lnk1 = new Lnk(["cid", "1"]);

  // -- Pre-checks --

  await t.expect(lnk1.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await lnk1.expectIsLink({ href: /^index\.html$/ });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await lnk1.expectIsLink({ href: /^ndex\.html$/ });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*DOM element returned by selector must have 'href,\/\^ndex\\.html\$\/' attribute but it doesn't.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("030 handles 'text' option", async t => {
  let isThrown;
  const lnk1 = new Lnk(["cid", "1"]);

  // -- Pre-checks --

  await t.expect(lnk1.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await lnk1.expectIsLink({ text: "Link 1" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await lnk1.expectIsLink({ text: "Link 2" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must be equal 'Link 2'.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("040 handles 'selector' option", async t => {
  let isThrown;
  const lnk1 = new Lnk(["cid", "1"]);
  const lnk3 = Selector(".foobar-lnk");

  // -- Pre-checks --

  await t.expect(lnk1.selector.count).eql(1);
  await t.expect(lnk3.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await lnk1.expectIsLink({ selector: lnk3, text: "Link 3" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await lnk1.expectIsLink({ selector: lnk3, text: "Link 2" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must be equal 'Link 2'.*/
      );
  }
  await t.expect(isThrown).ok();
});

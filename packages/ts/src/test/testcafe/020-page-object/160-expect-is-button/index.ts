import { Selector } from "testcafe";
import { PageObject } from "../../../../main/page-object";

class Btn extends PageObject {
  static bemBase = "btn";
  static displayName = "Btn";
}

fixture("PageObject#expectIsButton()").page(`${__dirname}/index.html`);

test("010 asserts on DOM element's tag", async t => {
  let isThrown;
  const btn1 = new Btn(["cid", "1"]);
  const btn2 = new Btn(["cid", "2"]);

  // -- Pre-checks --

  await t.expect(btn1.selector.count).eql(1);
  await t.expect(btn2.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await btn1.expectIsButton();
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await btn2.expectIsButton();
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Tag of DOM element returned by selector must be 'button' but it is 'div'.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("020 handles 'text' option", async t => {
  let isThrown;
  const btn1 = new Btn(["cid", "1"]);

  // -- Pre-checks --

  await t.expect(btn1.selector.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await btn1.expectIsButton({ text: "Button 1" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await btn1.expectIsButton({ text: "Button 2" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must be equal 'Button 2'.*/
      );
  }
  await t.expect(isThrown).ok();
});

test("030 handles 'selector' option", async t => {
  let isThrown;
  const btn1 = new Btn(["cid", "1"]);
  const btn3 = Selector(".foobar-button");

  // -- Pre-checks --

  await t.expect(btn1.selector.count).eql(1);
  await t.expect(btn3.count).eql(1);

  // -- Checks --

  // Check success.
  isThrown = false;
  try {
    await btn1.expectIsButton({ selector: btn3, text: "Button 3" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  // Check failure.
  isThrown = false;
  try {
    await btn1.expectIsButton({ selector: btn3, text: "Button 2" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(
        /.*Text of DOM element returned by selector must be equal 'Button 2'.*/
      );
  }
  await t.expect(isThrown).ok();
});

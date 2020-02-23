import { Selector, t } from "testcafe";
import PageObject from "../../../../main/page-object";

const display = Selector("#display");
const resetDisplayButton = Selector(".btn--cid_reset");

const expectClickedTimesIs = async n => {
  await t.expect(display.textContent).eql(`Clicked times: ${n}`);
};

const resetDisplay = async () => {
  await t.click(resetDisplayButton);
  await expectClickedTimesIs(0);
};

const Btn = class extends PageObject {
  static bemBase = "btn";
  static displayName = "Btn";
};

fixture("PageObject#click()")
  .page(`${__dirname}/index.html`)
  .beforeEach(() => resetDisplay());

test("010 clicks on page object's selector by default", async t => {
  const btnAddOne = new Btn("addOne");
  const btnAddTen = new Btn("addTen");

  // -- Pre-checks --

  await expectClickedTimesIs(0);
  await t.expect(btnAddOne.selector.count).eql(1);
  await t.expect(btnAddTen.selector.count).eql(1);

  // -- Checks --

  await btnAddOne.click();
  await expectClickedTimesIs(1);

  await btnAddTen.click();
  await expectClickedTimesIs(11);
});

test("020 clicks on selector provided in 'options'", async t => {
  const btnAddOne = new Btn("addOne");
  const btnAddTen = new Btn("addTen");

  // -- Pre-checks --

  await expectClickedTimesIs(0);
  await t.expect(btnAddOne.selector.count).eql(1);
  await t.expect(btnAddTen.selector.count).eql(1);

  // -- Checks --

  await btnAddOne.click({ selector: btnAddTen.selector });
  await expectClickedTimesIs(10);
});

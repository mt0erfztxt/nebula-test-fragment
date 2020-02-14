import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import { BemBase } from "../../../../main/bem";
import { PageObject } from "../../../../main/page-object";

class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  /**
   * @type {BemBase}
   */
  #inputElementBemBase;

  /**
   * @type {Selector}
   */
  #inputElementSelector;

  /**
   * @returns {BemBase}
   */
  get inputElementBemBase() {
    if (!this.#inputElementBemBase) {
      this.#inputElementBemBase = this.bemBase.clone().setElt("input");
    }

    return this.#inputElementBemBase;
  }

  /**
   * @returns {Selector}
   */
  get inputElementSelector() {
    if (!this.#inputElementSelector) {
      this.#inputElementSelector = this.selector.find(
        this.inputElementBemBase.toQuerySelector()
      );
    }

    return this.#inputElementSelector;
  }

  /**
   * @returns {Object<string, boolean>}
   */
  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      disabled: false,
      value: true
    });
  }

  /**
   * @returns {Promise<boolean>}
   */
  async getDisabled() {
    return this.inputElementSelector.hasAttribute("disabled");
  }

  /**
   * @returns {Promise<string>}
   */
  async getValue() {
    return this.inputElementSelector.value;
  }

  /**
   * Sets 'Value' part of fragment's state.
   *
   * @param {*} newValue
   * @returns {Promise<void>}
   */
  async setValue(newValue) {
    if (is.nullOrUndefined(newValue)) {
      return;
    }

    if (is.emptyString(newValue)) {
      await t.selectText(this.inputElementSelector).pressKey("delete");
    }

    await t.typeText(this.inputElementSelector, newValue, {
      paste: true,
      replace: true
    });
  }
}

fixture("PageObject#expectStateToSatisfy()").page(`${__dirname}/index.html`);

test("010 asserts that page object's state satisfies 'expectedState' -- case of success", async t => {
  let isThrown;
  const textInput = new TextInput();

  try {
    await textInput.expectStateToSatisfy({
      cid: undefined,
      disabled: false,
      value: "42"
    });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

test("020 asserts that page object's state satisfies 'expectedState' -- case of failure", async t => {
  let isThrown;
  const textInput = new TextInput();

  try {
    await textInput.expectStateToSatisfy({
      cid: undefined,
      disabled: true,
      value: "42"
    });
  } catch (e) {
    await t.expect(e.name).eql("UnexpectedError");
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

import { Selector } from "testcafe";
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
}

fixture("PageObject#getState()").page(`${__dirname}/index.html`);

test("010 throws on invalid input -- case of validity", async t => {
  let isThrown;
  const textInput = new TextInput();

  try {
    await textInput.getState("disabled", true, "value");
  } catch (e) {
    await t
      .expect(e.message)
      .eql(
        "TextInput: item at index 1 in 'statePartNames' must be a " +
          "non-blank string but it doesn't -- boolean true"
      );
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("020 throws on invalid input -- case of meaningfulness", async t => {
  let isThrown;
  const textInput = new TextInput();

  try {
    await textInput.getState("disabled", "value", "foobar");
  } catch (e) {
    await t
      .expect(e.message)
      .eql(
        "TextInput: item 'foobar' at index 2 in 'statePartNames' must be a " +
          "supported state part name but it doesn't -- cid,disabled,value"
      );
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("030 returns page object's state -- case of all state parts", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.inputElementSelector.count).eql(1);

  // -- Checks --

  const state = await textInput.getState();
  await t.expect(state).eql({
    cid: undefined,
    disabled: true,
    value: "42"
  });
});

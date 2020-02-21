import expect from "unexpected";
import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import { BemBase } from "../../../../main/bem";
import PageObject from "../../../../main/page-object";

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

fixture("PageObject#setState()").page(`${__dirname}/index.html`);

test("010 does nothing when 'newState' is null or undefined", async t => {
  const textInput = new TextInput();
  const curState = await textInput.getState();

  await textInput.setState();

  const newState = await textInput.getState();
  await t.expect(curState).eql(newState);
});

test("020 throws on invalid input -- case of validity", async t => {
  let isThrown;
  const textInput = new TextInput();

  try {
    await textInput.setState(42);
  } catch (e) {
    await t
      .expect(e.message)
      .eql(
        "TextInput: 'newState' must be a plain object but it doesn't -- " +
          "number 42"
      );
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("030 throws on invalid input -- case of meaningfulness", async t => {
  let isThrown;
  const textInput = new TextInput();

  try {
    await textInput.setState({ focused: true });
  } catch (e) {
    await t
      .expect(e.message)
      .eql(
        "TextInput: 'Focused' state part is not one of supported state " +
          "parts -- cid,disabled,value"
      );
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("040 throws when state part setter not implemented", async t => {
  let isThrown;
  const TextInputFoo = class extends PageObject {
    static bemBase = "textInput";
    static displayName = "TextInputFoo";

    /**
     * @returns {Object<string, boolean>}
     */
    getStateSpec() {
      return Object.assign(super.getStateSpec(), { disabled: true });
    }
  };

  isThrown = false;
  const textInputFoo = new TextInputFoo();

  try {
    await textInputFoo.setState({ disabled: false });
  } catch (e) {
    await t
      .expect(e.message)
      .eql("TextInputFoo: must have 'setDisabled' method but it doesn't");
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("050 sets new state", async () => {
  const textInput = new TextInput();

  expect(await textInput.getState(), "to satisfy", {
    disabled: false,
    value: "42"
  });

  await textInput.setState({ disabled: true, value: "foo" });
  expect(await textInput.getState(), "to satisfy", {
    disabled: false,
    value: "foo"
  });
});

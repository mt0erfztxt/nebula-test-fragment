import PageObject from "nebula-test-fragment";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      value: false
    });
  }

  /**
   * Returns 'Value' part of page object's state.
   *
   * @returns {Promise<string>}
   */
  async getValue() {
    return this.getStatePartHelper("value", {
      defaultValue: "foobar",
      simple: false,
      src: "bemModifier"
    });
  }
}

import PageObject from "nebula-test-fragment";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  /**
   * Returns 'Enabled' part of page object's state.
   *
   * @returns {Promise<boolean>}
   */
  async getEnabled() {
    return this.getStatePartHelper("data-enabled", {
      simple: true,
      src: "bemModifier"
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

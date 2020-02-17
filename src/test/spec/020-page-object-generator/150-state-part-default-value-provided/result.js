import PageObject from "nebula-test-fragment";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

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

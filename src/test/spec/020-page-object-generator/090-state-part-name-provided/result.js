import PageObject from "nebula-test-fragment";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  /**
   * Returns 'Disabled' part of page object's state.
   *
   * @returns {Promise<boolean>}
   */
  async getDisabled() {
    return this.getStatePartHelper("disabled", {
      simple: true,
      src: "bemModifier"
    });
  }
}

import PageObject from "nebula-test-fragment";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  /**
   * Returns 'DataChecked' part of page object's state.
   *
   * @returns {Promise<string | undefined>}
   */
  async getDataChecked() {
    return this.getStatePartHelper("data-checked", {
      simple: false,
      src: "bemModifier"
    });
  }
}

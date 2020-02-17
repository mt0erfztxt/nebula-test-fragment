import PageObject from "nebula-test-fragment";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  /**
   * Returns 'Active' part of page object's state.
   *
   * @returns {Promise<boolean>}
   */
  async getActive() {
    return this.getStatePartHelper("data-active", {
      simple: true,
      src: "bemModifier"
    });
  }
}
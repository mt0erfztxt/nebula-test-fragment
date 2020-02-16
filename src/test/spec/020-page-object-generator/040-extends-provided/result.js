import ProvidedPageObject from "../../040-extends-provided/provided-page-object";

export default class TextInput extends ProvidedPageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  /**
   * Returns 'Active' part of page object's state.
   *
   * @returns {Promise<boolean>}
   */
  async getActive() {
    return this.getStatePartHelper("active", {
      simple: true,
      src: "bemModifier"
    });
  }
}

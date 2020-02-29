import PageObject from "nebula-test-fragment/lib/page-object";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      disabled: false
    });
  }

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

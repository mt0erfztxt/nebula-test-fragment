import PageObject from "nebula-test-fragment/lib/pageObject";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      active: false
    });
  }

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

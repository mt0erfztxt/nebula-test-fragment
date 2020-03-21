import PageObject from "nebula-test-fragment/lib/main/pageObject";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      value: { simple: false, writable: false }
    });
  }

  /**
   * Returns 'Value' part of page object's state.
   *
   * @returns {Promise<string | undefined>}
   */
  async getValue() {
    return this.getStatePartHelper("value", {
      simple: false,
      src: "attribute"
    });
  }
}

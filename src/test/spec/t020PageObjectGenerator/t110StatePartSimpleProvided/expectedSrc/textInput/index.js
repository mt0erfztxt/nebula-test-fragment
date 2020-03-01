import PageObject from "nebula-test-fragment/lib/main/pageObject";

export default class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      dataChecked: false
    });
  }

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

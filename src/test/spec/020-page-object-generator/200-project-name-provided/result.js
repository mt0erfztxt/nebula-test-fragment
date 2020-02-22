import PageObject from "nebula-test-fragment";

export default class TextInput extends PageObject {
  static bemBase = "myProject-textInput";
  static displayName = "myProject-TextInput";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      enabled: false
    });
  }

  /**
   * Returns 'Enabled' part of page object's state.
   *
   * @returns {Promise<boolean>}
   */
  async getEnabled() {
    return this.getStatePartHelper("enabled", {
      simple: true,
      src: "bemModifier"
    });
  }
}

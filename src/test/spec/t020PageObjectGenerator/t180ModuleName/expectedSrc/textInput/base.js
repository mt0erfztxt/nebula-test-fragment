import PageObject from "nebula-test-fragment/lib/main/pageObject";

export default class TextInputBase extends PageObject {
  static bemBase = "";
  static displayName = "TextInputBase";

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

import PageObject from "nebula-test-fragment/lib/page-object";

export default class InputBase extends PageObject {
  static bemBase = "";
  static displayName = "InputBase";

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

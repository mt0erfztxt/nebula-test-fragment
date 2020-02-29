import PageObject from "nebula-test-fragment/lib/page-object";

export default class BarBase extends PageObject {
  static bemBase = "";
  static displayName = "BarBase";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      bar: false
    });
  }

  /**
   * Returns 'Bar' part of page object's state.
   *
   * @returns {Promise<boolean>}
   */
  async getBar() {
    return this.getStatePartHelper("bar", {
      simple: true,
      src: "bemModifier"
    });
  }
}

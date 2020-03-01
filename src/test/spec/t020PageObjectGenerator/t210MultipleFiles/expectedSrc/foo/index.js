import PageObject from "nebula-test-fragment/lib/main/pageObject";

export default class Foo extends PageObject {
  static bemBase = "foo";
  static displayName = "Foo";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      foo: false
    });
  }

  /**
   * Returns 'Foo' part of page object's state.
   *
   * @returns {Promise<boolean>}
   */
  async getFoo() {
    return this.getStatePartHelper("foo", {
      simple: true,
      src: "bemModifier"
    });
  }
}

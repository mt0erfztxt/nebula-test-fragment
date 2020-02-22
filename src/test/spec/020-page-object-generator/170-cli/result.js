import PageObject from "nebula-test-fragment/lib/page-object";

export default class MyWidget extends PageObject {
  static bemBase = "myWidget";
  static displayName = "MyWidget";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      foo: false
    });
  }

  /**
   * Returns 'Foo' part of page object's state.
   *
   * @returns {Promise<string>}
   */
  async getFoo() {
    return this.getStatePartHelper("foo", {
      defaultValue: "bar",
      simple: false,
      src: "bemModifier"
    });
  }
}

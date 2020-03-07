import PageObject from "../../../../main/pageObject";

class Foo extends PageObject {
  static bemBase = "foo";
  static displayName = "Foo";

  getStateSpec() {
    return Object.assign(super.getStateSpec(), {
      disabled: { simple: true, writable: false },
      realSize: { simple: false, writable: false },
      trulyAwesome: { simple: true, writable: false },
      value: { simple: false, writable: false }
    });
  }

  /**
   * @returns {Promise<boolean>}
   */
  async getDisabled() {
    return this.getStatePartHelper("disabled");
  }

  /**
   * @returns {Promise<string>}
   */
  async getRealSize() {
    return this.getStatePartHelper("realSize", {
      simple: false
    });
  }

  /**
   * @returns {Promise<boolean>}
   */
  async getTrulyAwesome() {
    return this.getStatePartHelper("trulyAwesome");
  }

  /**
   * @returns {Promise<string>}
   */
  async getValue() {
    return this.getStatePartHelper("value", {
      simple: false
    });
  }
}

fixture("PageObject#expect()")
  .page(`${__dirname}/index.html`)
  .beforeEach(async t => {
    await t.maximizeWindow();
  });

test("010 throws on invalid input -- case without not", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Checks --

  isThrown = false;
  try {
    await foo.expect(" ");
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "Foo: 'expectation' must contain state part name but it doesn't -- " +
          "string  "
      );
  }
  await t.expect(isThrown).ok();
});

test("020 throws on invalid input -- case with not", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Checks --

  isThrown = false;
  try {
    await foo.expect(" not");
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "Foo: 'expectation' must contain state part name but it doesn't -- " +
          "string  not"
      );
  }
  await t.expect(isThrown).ok();
});

test("030 asserts on page object's state part -- case of simple, one word named state part", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Checks --

  await foo.expect("disabled");

  isThrown = false;
  try {
    await foo.expect("not disabled");
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("040 asserts on page object's state part -- case of simple, many words named state part", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Checks --

  await foo.expect("not trulyAwesome");
  await foo.expect("truly Not Awesome");
  await foo.expect("truly Awesome not");

  isThrown = false;
  try {
    await foo.expect("truly awesome");
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("050 asserts on page object's state part -- case of not simple, one word named state part", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Checks --

  await foo.expect("value", "42");

  isThrown = false;
  try {
    await foo.expect("value not ", "42");
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

test("060 asserts on page object's state part -- case of not simple, many words named state part", async t => {
  let isThrown;
  const foo = new Foo();

  // -- Checks --

  await foo.expect("realSize not", "42");
  await foo.expect("real size not", "42");
  await foo.expect("  real  not Size ", "42");

  isThrown = false;
  try {
    await foo.expect("real size", "42");
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).ok();
});

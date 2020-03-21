import { Selector } from "testcafe";
import PageObject from "../../../../main/pageObject";

fixture("PageObject#getPageObjectHelper()")
  .page(`${__dirname}/index.html`)
  .beforeEach(async t => {
    await t.maximizeWindow();
  });

test("010 returns page object with parent set to this page object -- case of page object", async t => {
  const ChildOfFoo = class extends PageObject {
    static bemBase = "childOfFoo";
    static displayName = "ChildOfFoo";
  };

  const Foo = class extends PageObject {
    static bemBase = "foo";
    static displayName = "Foo";

    /**
     * @param {NTF.PageObjectConstructorParams} args
     * @returns {ChildOfFoo}
     */
    getChild(...args) {
      return this.getPageObjectHelper(ChildOfFoo, ...args);
    }
  };

  const Bar = class extends PageObject {
    static bemBase = "bar";
    static displayName = "Bar";
  };

  const bar = new Bar();
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(Selector(".childOfFoo--cid_a").count).eql(2);
  await t.expect(bar.selector.count).eql(1);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  const a1 = foo.getChild(bar, "a");
  await t.expect(a1.selector.textContent).eql("ChildOfFoo a");

  const a2 = foo.getChild("a");
  await t.expect(a2.selector.textContent).eql("ChildOfFoo a");
});

test("015 returns page object with parent set to this page object -- case of TestCafe selector", async t => {
  const ChildOfFoo = class extends PageObject {
    static bemBase = "childOfFoo";
    static displayName = "ChildOfFoo";
  };

  const Foo = class extends PageObject {
    static bemBase = "foo";
    static displayName = "Foo";

    /**
     * @param {NTF.PageObjectConstructorParams} args
     * @returns {ChildOfFoo}
     */
    getChild(...args) {
      return this.getPageObjectHelper(ChildOfFoo, ...args);
    }
  };

  const bar = Selector(".bar");
  const foo = new Foo();

  // -- Pre-checks --

  await t.expect(Selector(".childOfFoo--cid_a").count).eql(2);
  await t.expect(bar.count).eql(1);
  await t.expect(foo.selector.count).eql(1);

  // -- Checks --

  const a1 = foo.getChild(bar, "a");
  await t.expect(a1.selector.textContent).eql("ChildOfFoo a");

  const a2 = foo.getChild("a");
  await t.expect(a2.selector.textContent).eql("ChildOfFoo a");
});

test("020 throws when returned value is of type other than PageObject or its descendant", async t => {
  const ChildOfFoo = class {
    static bemBase = "childOfFoo";
    static displayName = "ChildOfFoo";
  };

  const Foo = class extends PageObject {
    static bemBase = "foo";
    static displayName = "Foo";

    /**
     * @param {NTF.PageObjectConstructorParams} args
     * @returns {ChildOfFoo}
     */
    getChild(...args) {
      return this.getPageObjectHelper(ChildOfFoo, ...args);
    }
  };

  let isThrown;
  const foo = new Foo();

  isThrown = false;
  try {
    await foo.getChild("a");
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "Foo: 'class ChildOfFoo {}' must be a page object class but it " +
          "doesn't -- Object"
      );
  }
  await t.expect(isThrown).ok();
});

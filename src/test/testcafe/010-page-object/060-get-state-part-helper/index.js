import { PageObject } from "../../../../main/page-object";

class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";
}

fixture("PageObject#getStatePartHelper()").page(`${__dirname}/index.html`);

test("010 work for simple attribute", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const disabledAttrVal = await textInput.getStatePartHelper("data-disabled", {
    simple: true,
    src: "attribute"
  });
  await t.expect(disabledAttrVal).eql(true);

  const readonlyAttrVal = await textInput.getStatePartHelper("readonly", {
    simple: true,
    src: "attribute"
  });
  await t.expect(readonlyAttrVal).eql(false);
});

test("020 work for full attribute", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const dataFooAttrVal = await textInput.getStatePartHelper("value", {
    simple: false,
    src: "attribute"
  });
  await t.expect(dataFooAttrVal).eql("1");

  const typeAttrVal = await textInput.getStatePartHelper("type", {
    src: "attribute"
  });
  await t.expect(typeAttrVal).notEql("checkbox");
});

test("030 work for simple BEM modifier", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const mod1BemModVal = await textInput.getStatePartHelper("mod1", {
    simple: true
  });
  await t.expect(mod1BemModVal).eql(true);

  const mod9BemModVal = await textInput.getStatePartHelper("mod9", {
    simple: true
  });
  await t.expect(mod9BemModVal).eql(false);
});

test("040 work for full BEM modifier", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const mod2BemModVal = await textInput.getStatePartHelper("mod2", {
    simple: false,
    src: "bemModifier"
  });
  await t.expect(mod2BemModVal).eql("2");

  const mod3BemModVal = await textInput.getStatePartHelper("mod3", {
    src: "bemModifier"
  });
  await t.expect(mod3BemModVal).notEql("2");

  const mod4BemModVal = await textInput.getStatePartHelper("mod4", {
    simple: false
  });
  await t.expect(mod4BemModVal).eql(undefined);
});

test("050 throws when 'name' is not valid", async t => {
  let isThrown;
  const textInput = new TextInput();

  // -- Checks --

  isThrown = false;
  try {
    await textInput.getStatePartHelper(true);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "TextInput: 'name' must be a non-blank string but it doesn't -- " +
          "boolean true"
      );
  }
  await t.expect(isThrown).ok();
});

test("060 throws when 'options' is not valid", async t => {
  let isThrown;
  const textInput = new TextInput();

  // -- Checks --

  isThrown = false;
  try {
    await textInput.getStatePartHelper("foobar", 42);
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "TextInput: 'options' must be a plain object but it doesn't -- " +
          "number 42"
      );
  }
  await t.expect(isThrown).ok();
});

test("070 throws when 'options.defaultValue' is not valid", async t => {
  let isThrown;
  const textInput = new TextInput();

  // -- Checks --

  isThrown = false;
  try {
    await textInput.getStatePartHelper("foobar", { defaultValue: undefined });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();

  isThrown = false;
  try {
    await textInput.getStatePartHelper("foobar", { defaultValue: "" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "TextInput: 'options.defaultValue' must be a non-blank string but " +
          "it doesn't -- string "
      );
  }
  await t.expect(isThrown).ok();
});

test("080 throws when 'options.simple' is not valid", async t => {
  let isThrown;
  const textInput = new TextInput();

  // -- Checks --

  isThrown = false;
  try {
    await textInput.getStatePartHelper("foobar", { simple: 42 });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "TextInput: 'options.simple' must be a boolean but it doesn't -- " +
          "number 42"
      );
  }
  await t.expect(isThrown).ok();
});

test("090 throws when 'options.src' is not valid", async t => {
  let isThrown;
  const textInput = new TextInput();

  // -- Checks --

  isThrown = false;
  try {
    await textInput.getStatePartHelper("foobar", { src: "unsupported" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.message)
      .eql(
        "TextInput: 'options.src' must be one of supported values but it " +
          "doesn't -- string unsupported"
      );
  }
  await t.expect(isThrown).ok();
});

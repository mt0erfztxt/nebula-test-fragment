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

  const disabledAttrVal = await textInput.getStatePartHelper("disabled", {
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

  const mod4BemModVal = await textInput.getStatePartHelper("mod4");
  await t.expect(mod4BemModVal).eql(undefined);
});

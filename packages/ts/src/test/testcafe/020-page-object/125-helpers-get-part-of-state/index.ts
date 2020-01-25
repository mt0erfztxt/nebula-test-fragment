import { getPartOfState, PageObject } from "../../../../main/page-object";

class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";
}

fixture("PageObject helpers -- getPartOfState()").page(
  `${__dirname}/index.html`
);

test("010 work for simple attribute", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const disabledAttrVal = (await getPartOfState(textInput, "disabled", {
    simple: true,
    src: "attribute"
  })) as boolean;
  await t.expect(disabledAttrVal).eql(true);

  const readonlyAttrVal = (await getPartOfState(textInput, "readonly", {
    simple: true,
    src: "attribute"
  })) as boolean;
  await t.expect(readonlyAttrVal).eql(false);
});

test("020 work for full attribute", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const dataFooAttrVal = (await getPartOfState(textInput, "value", {
    simple: false,
    src: "attribute"
  })) as string | undefined;
  await t.expect(dataFooAttrVal).eql("1");

  const typeAttrVal = (await getPartOfState(textInput, "type", {
    src: "attribute"
  })) as string | undefined;
  await t.expect(typeAttrVal).notEql("checkbox");
});

test("030 work for simple BEM modifier", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const mod1BemModVal = (await getPartOfState(textInput, "mod1", {
    simple: true
  })) as boolean;
  await t.expect(mod1BemModVal).eql(true);

  const mod9BemModVal = (await getPartOfState(textInput, "mod9", {
    simple: true
  })) as boolean;
  await t.expect(mod9BemModVal).eql(false);
});

test("040 work for full BEM modifier", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  const mod2BemModVal = (await getPartOfState(textInput, "mod2", {
    simple: false,
    src: "bemModifier"
  })) as string | undefined;
  await t.expect(mod2BemModVal).eql("2");

  const mod3BemModVal = (await getPartOfState(textInput, "mod3", {
    src: "bemModifier"
  })) as string | undefined;
  await t.expect(mod3BemModVal).notEql("2");

  const mod4BemModVal = (await getPartOfState(textInput, "mod4")) as
    | string
    | undefined;
  await t.expect(mod4BemModVal).eql(undefined);
});

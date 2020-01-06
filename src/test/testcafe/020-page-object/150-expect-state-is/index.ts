import { PageObject, PageObjectState } from "../../../../main/page-object";

type TextInputState = PageObjectState & {
  disabled?: boolean;
  value: number | string | undefined;
};

class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  async getState(): Promise<TextInputState> {
    return {
      ...(await super.getState()),
      disabled: await this.getDisabled(),
      value: await this.getValue()
    };
  }

  async getDisabled(): Promise<boolean> {
    return this.selector.hasAttribute("disabled");
  }

  async getValue(): Promise<string> {
    return (await this.selector.value) || "";
  }
}

fixture("PageObject#expectStateIs()").page(`${__dirname}/index.html`);

test("010 fails when page object's state doesn't equal specified", async t => {
  let isThrown;
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await textInput.expectStateIs({ value: "foo" });
  } catch (e) {
    isThrown = true;
    await t
      .expect(e.errMsg)
      .match(/.*TextInput's state doesn't equal expected.*/);
  }
  await t.expect(isThrown).ok();
});

test("020 succeeds when page object's state equal specified", async t => {
  let isThrown;
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.selector.count).eql(1);

  // -- Checks --

  isThrown = false;
  try {
    await textInput.expectStateIs({ disabled: true, value: "42" });
  } catch (e) {
    isThrown = true;
  }
  await t.expect(isThrown).notOk();
});

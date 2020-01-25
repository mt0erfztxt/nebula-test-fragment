import { Selector } from "testcafe";
import { BemBase } from "../../../../main/bem";
import { PageObject, PageObjectState } from "../../../../main/page-object";

type TextInputState = PageObjectState & { disabled: boolean; value: string };

class TextInput extends PageObject {
  static bemBase = "textInput";
  static displayName = "TextInput";

  private _inputElementBemBase: BemBase;
  private _inputElementSelector: Selector;

  get inputElementBemBase(): BemBase {
    if (!this._inputElementBemBase) {
      this._inputElementBemBase = this.bemBase.clone().setElt("input");
    }

    return this._inputElementBemBase;
  }

  get inputElementSelector(): Selector {
    if (!this._inputElementSelector) {
      this._inputElementSelector = this.selector.find(
        this.inputElementBemBase.toQuerySelector()
      );
    }

    return this._inputElementSelector;
  }

  async getState(): Promise<TextInputState> {
    return {
      ...(await super.getState()),
      disabled: await this.getDisabled(),
      value: await this.getValue()
    };
  }

  async getDisabled(): Promise<boolean> {
    return this.inputElementSelector.hasAttribute("disabled");
  }

  async getValue(): Promise<string> {
    return (await this.inputElementSelector.value) || "";
  }
}

fixture("PageObject#getState()").page(`${__dirname}/index.html`);

test("010 returns page object's state including state up to grand page object's state in inheritance chain", async t => {
  const textInput1 = new TextInput(["idx", 0]);
  const textInput2 = new TextInput(["cid", "foo"]);

  // -- Pre-checks --

  await t.expect(textInput1.inputElementSelector.count).eql(1);
  await t.expect(textInput2.inputElementSelector.count).eql(1);

  // -- Checks --

  // Check without 'cid'.
  await t.expect(await textInput1.getState()).eql({
    disabled: true,
    value: "42"
  });

  // Check with 'cid'.
  await t.expect(await textInput2.getState()).eql({
    cid: "foo",
    disabled: false,
    value: "42"
  });
});

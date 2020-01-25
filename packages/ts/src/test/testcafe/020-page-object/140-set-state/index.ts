import { Selector, t } from "testcafe";
import { BemBase } from "../../../../main/bem";
import { PageObject, PageObjectState } from "../../../../main/page-object";

type TextInputState = PageObjectState & {
  disabled?: boolean;
  value: number | string;
};

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

  async setState(textInputState: TextInputState): Promise<void> {
    super.setState(textInputState);
    await this.setValue(textInputState.value);
  }

  async setValue(value: number | string): Promise<void> {
    await t.typeText(this.inputElementSelector, value.toString(), {
      paste: true,
      replace: true
    });
  }
}

fixture("PageObject#setState()").page(`${__dirname}/index.html`);

test("010 sets page object's state", async t => {
  const textInput = new TextInput();

  // -- Pre-checks --

  await t.expect(textInput.inputElementSelector.count).eql(1);
  await t.expect(textInput.inputElementSelector.value).eql("foobar");

  // -- Checks --

  const result = await textInput.setState({ value: 42 });
  await t.expect(result).eql(undefined);
  await t.expect(textInput.inputElementSelector.value).eql("42");
});

import _ from 'lodash';
import expect from 'unexpected';
import { t } from 'testcafe';

import Fragment from '../../../../src/fragment1';
import Options from "../../../../src/options";
import utils from "../../../../src/utils";

class TextInput extends Fragment {

  /**
   * BEM base for fragment's 'input' element.
   *
   * @return {BemBase}
   */
  get inputElementBemBase() {
    if (!this._inputElementBemBase) {
      this._inputElementBemBase = this
        .cloneBemBase()
        .setElt('input');
    }

    return this._inputElementBemBase;
  }

  /**
   * TestCafe selector for fragment's 'input' element.
   *
   * @return {Selector}
   */
  get inputElementSelector() {
    if (!this._inputElementSelector) {
      this._inputElementSelector = this
        .selector
        .find(`.${this.inputElementBemBase}`);
    }

    return this._inputElementSelector;
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  getStateParts(options) {
    const { onlyWritable } = new Options(options, {
      defaults: {
        onlyWritable: false
      }
    });
    const writableParts = _.concat(
      super.getStateParts(onlyWritable),
      ['value']
    );

    if (onlyWritable) {
      return writableParts;
    }
    else {
      return _.concat(writableParts, [
        'disabled'
      ]);
    }
  }

  /**
   * Obtains 'Disabled' part of fragment's state and returns it.
   *
   * @param {Options} [options] Options
   * @return {Promise<Boolean>}
   */
  async getDisabledPartOfState(options) {
    return this.inputElementSelector.hasAttribute('disabled');
  }

  /**
   * Obtains 'Value' part of fragment's state and returns it.
   *
   * @param {Options} [options] Options
   * @return {Promise<String>}
   */
  async getValuePartOfState(options) {
    return this.inputElementSelector.value;
  }

  /**
   * Sets 'Value' part of fragment's state.
   *
   * @param {*} value New value for 'Value' part of fragment's state. `undefined` means no change and `null` and empty string sets value of text input to ''
   * @param {Options} [options] Options, object that can contain any options for TestCafe `typeText` action, plus custom options
   * @param {boolean} [options.paste=true] See TestCafe `typeText` action for details
   * @param {boolean} [options.replace=true] See TestCafe `typeText` action for details
   * @return {Promise<*>} 'Value' part of fragment's state after set state operation is done.
   * @throws {TypeError} When parameters aren't valid or input value can't be changed.
   */
  async setValuePartOfState(value, options) {

    // `undefined` is noop.
    if (_.isUndefined(value)) {
      return this.getValuePartOfState(options);
    }

    // `null` or empty string means clear input.
    if (_.isNull(value) || utils.isEmptyString(value)) {
      await t
        .selectText(this.inputElementSelector)
        .pressKey('delete');
      return '';
    }

    await t.typeText(
      this.inputElementSelector,
      value,
      new Options(options, {
        defaults: {
          paste: true,
          replace: true
        }
      })
    );

    return value;
  }
}

Object.defineProperties(TextInput, {
  bemBase: {
    value: 'textInput'
  },
  displayName: {
    value: 'TextInput'
  }
});

fixture('Fragment :: 140 #expectStateIs()')
  .page(__dirname + '/index.html');

test("010 It should throw error when 'stateOrId' argument is not a plain object or a non-blank string", async () => {
  const textInput = new TextInput();

  let isThrown = false;

  try {
    await textInput.expectStateIs(42);
  }
  catch (e) {
    const message = "'stateOrId' argument must be a plain object or a non-blank string but it is Number (42)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when 'stateOrId' argument points to non-existent state", async () => {
  const textInput = new TextInput();
  textInput._persistedStates['42'] = null;
  
  let isThrown = false;

  try {
    await textInput.expectStateIs('42');
  }
  catch (e) {
    const message = "State to match must be a plain object but it is #Null (null)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when fragment's current state does not match specified state - case of passed in state", async () => {
  const textInput = new TextInput();

  let isThrown = false;

  try {
    await textInput.expectStateIs({ value: 'foo' });
  }
  catch (e) {
    const errMsgPattern = /.*'TextInput' fragment's current state doesn't match expected.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when fragment's current state does not match specified state - case of persisted state", async () => {
  const textInput = new TextInput();
  textInput._persistedStates['42'] = { value: '42' };
  
  let isThrown = false;

  try {
    await textInput.expectStateIs('42');
  }
  catch (e) {
    const errMsgPattern = /.*'TextInput' fragment's current state doesn't match expected.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should not throw error when fragment's current state does match specified state - case of passed in state", async () => {
  const textInput = new TextInput();

  let isThrown = false;

  try {
    await textInput.expectStateIs({ disabled: true, value: '42' });
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("060 It should not throw error when fragment's current state does match specified state - case of persisted state", async () => {
  const textInput = new TextInput();
  textInput._persistedStates['42'] = { disabled: true, value: '42' };
  
  let isThrown = false;

  try {
    await textInput.expectStateIs('42');
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

import _ from 'lodash';
import appRootPath from 'app-root-path';
import expect from 'unexpected';
import {t} from 'testcafe';

import {Fragment} from '../../../src';
import utils from "../../../src/utils";

fixture `Fragment :: 120 #expectStateIs()`
  .page(appRootPath.path + '/test/fixtures/fragment/120-expect-state-is.html');

class TextInput extends Fragment {

  /**
   * Creates new text input fragment.
   *
   * @param {?object} [spec] - TextInput fragment specification
   * @param {?Options} [opts] - TextInput fragment Options
   * @param {Options} [opts.BarFragmentOpts] - Opts for `TextInput` fragment used in this fragment
   * @param {object} [opts.BarFragmentSpec] - Spec for `TextInput` fragment used in this fragment
   */
  constructor(spec, opts) {
    const {initializedOpts, initializedSpec, isInstance} = TextInput.initializeFragmentSpecAndOpts(spec, opts);

    if (isInstance === true) {
      return spec;
    }

    super(initializedSpec, initializedOpts);
    return this;
  }

  /**
   * BEM base for fragment's 'input' element.
   *
   * @return {BemBase}
   */
  get inputElementBemBase() {
    if (!this._inputElementBemBase) {
      this._inputElementBemBase = this.cloneBemBase().setElt('input');
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
      this._inputElementSelector = this.selector.find(`.${this.inputElementBemBase}`);
    }

    return this._inputElementSelector;
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  getStateParts(options) {
    const opts = utils.initializeOptions(options, {defaults: {onlyWritable: false}});
    const {onlyWritable} = opts;
    const parentParts = super.getStateParts(onlyWritable);
    const writableParts = _.concat(parentParts, ['value']);

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
   * @param {Options} [options] - Options
   * @return {Promise<string>}
   */
  async getDisabledPartOfState(options) {
    return this.inputElementSelector.hasAttribute('disabled');
  }

  /**
   * Obtains 'Value' part of fragment's state and returns it.
   *
   * @param {Options} [options] - Options
   * @return {Promise<string>}
   */
  async getValuePartOfState(options) {
    return this.inputElementSelector.value;
  }

  /**
   * Sets 'Value' part of fragment's state.
   *
   * @param {*} value - New value for 'Value' part of fragment's state. `undefined` means no change and `null` and empty string sets value of text input to ''
   * @param {Options} [options] - Options object that can contain any options for TestCafe `typeText` action, plus custom options
   * @param {boolean} [options.paste=true] - See TestCafe `typeText` action for details
   * @param {boolean} [options.replace=true] - See TestCafe `typeText` action for details
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

    const opts = utils.initializeOptions(options, {defaults: {paste: true, replace: true}});
    await t.typeText(this.inputElementSelector, value, opts);

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

test("010 It should throw error when 'stateOrId' argument is not a plain object or non-blank string", async () => {
  let isThrown = false;
  const textInput = new TextInput();

  try {
    await textInput.expectStateIs(42);
  }
  catch (e) {
    const message = "'stateOrId' argument must be a plain object or non-blank string but it is Number (42)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when 'stateOrId' argument points to non-existent state", async () => {
  let isThrown = false;
  const textInput = new TextInput();

  textInput._persistedStates['42'] = null;

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
  let isThrown = false;
  const textInput = new TextInput();

  try {
    await textInput.expectStateIs({value: 'foo'});
  }
  catch (e) {
    const errMsgPattern = /.*'TextInput' fragment's current state doesn't match expected.*/;
    expect(e.errMsg, 'to match', errMsgPattern);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when fragment's current state does not match specified state - case of persisted state", async () => {
  let isThrown = false;
  const textInput = new TextInput();

  textInput._persistedStates['42'] = {value: '42'};

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
  let isThrown = false;
  const textInput = new TextInput();

  try {
    await textInput.expectStateIs({disabled: true, value: '42'});
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

test("060 It should not throw error when fragment's current state does match specified state - case of persisted state", async () => {
  let isThrown = false;
  const textInput = new TextInput();

  textInput._persistedStates['42'] = {disabled: true, value: '42'};

  try {
    await textInput.expectStateIs('42');
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
});

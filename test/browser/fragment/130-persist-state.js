import _ from 'lodash';
import appRootPath from 'app-root-path';
import expect from 'unexpected';

import Fragment from '../../../src/fragment';
import utils from "../../../src/utils";

fixture `Fragment :: 130 persistState()`
  .page(appRootPath.path + '/test/fixtures/fragment/130-persist-state.html');

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
    const { initializedOpts, initializedSpec, isInstance } = TextInput.initializeFragmentSpecAndOpts(spec, opts);

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
    const opts = utils.initializeOptions(options, {
      defaults: {
        onlyWritable: false
      }
    });
    const { onlyWritable } = opts;
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
}

Object.defineProperties(TextInput, {
  bemBase: {
    value: 'textInput'
  },
  displayName: {
    value: 'TextInput'
  }
});

test("010 It should throw error when 'id' argument is not a non-blank string", async () => {
  let isThrown = false;
  const textInput = new TextInput();

  try {
    await textInput.persistState('');
  }
  catch (e) {
    const message = "'id' argument must be a non-blank string but it is String ()";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should throw error when 'state' argument is not a nil or plain object", async () => {
  let isThrown = false;
  const textInput = new TextInput();

  try {
    await textInput.persistState('42', 'foo');
  }
  catch (e) {
    const message = "'state' argument must be a nil or plain object but it is String (foo)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should persist state as-is when 'state' argument is a plain object", async () => {
  let isThrown = false;
  const textInput = new TextInput();
  const stateToPersist = { value: 'foo' };

  try {
    await textInput.persistState('42', stateToPersist);
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
  expect(textInput._persistedStates['42'] === stateToPersist, 'to be true');
  expect(textInput._persistedStates['42'], 'to equal', { value: 'foo' });
});

test("040 It should persist fragment's current state when 'state' argument is a nil", async () => {
  let isThrown = false;
  const textInput = new TextInput();
  const currentState = { disabled: true, value: '42' };

  await textInput.expectStateIs(currentState);

  try {
    await textInput.persistState('42');
  }
  catch (e) {
    isThrown = true;
  }

  expect(isThrown, 'to be false');
  expect(textInput._persistedStates['42'] !== currentState, 'to be true');
  expect(textInput._persistedStates['42'], 'to equal', currentState);
});

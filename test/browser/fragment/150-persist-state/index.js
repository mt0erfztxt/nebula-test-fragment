import _ from 'lodash';
import expect from 'unexpected';

import Fragment from '../../../../src/fragment';
import Options from "../../../../src/options";

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
}

Object.defineProperties(TextInput, {
  bemBase: {
    value: 'textInput'
  },
  displayName: {
    value: 'TextInput'
  }
});

fixture('Fragment :: 150 #persistState()')
  .page(__dirname + '/index.html');

test("010 It should throw error when 'id' argument is not a non-blank string", async () => {
  const textInput = new TextInput();

  let isThrown = false;

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

test("020 It should throw error when 'state' argument is not a nil or a plain object", async () => {
  const textInput = new TextInput();

  let isThrown = false;

  try {
    await textInput.persistState('42', 'foo');
  }
  catch (e) {
    const message = "'state' argument must be a nil or a plain object but it is String (foo)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should persist state as-is when 'state' argument is a plain object", async () => {
  const textInput = new TextInput();
  const stateToPersist = { value: 'foo' };

  let isThrown = false;

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
  const textInput = new TextInput();
  const currentState = { disabled: true, value: '42' };
  
  await textInput.expectStateIs(currentState);

  let isThrown = false;

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

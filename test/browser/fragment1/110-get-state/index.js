import _ from 'lodash';
import expect from 'unexpected';
import { t } from 'testcafe';

import Fragment from '../../../../src/fragment1';
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

fixture('Fragment :: 110 #getState()')
  .page(__dirname + '/index.html');

test("010 It should throw error when fragment's '#getStateParts()' implemented incorrectly", async () => {
  class Foo extends Fragment {
    getStateParts(options) {
      return {};
    }
  }

  Object.defineProperties(Foo, {
    bemBase: {
      value: 'foo'
    },
    displayName: {
      value: 'Foo'
    }
  });

  let isThrown = false;
  const foo = new Foo();

  try {
    await foo.getState();
  }
  catch (e) {
    const message = "'Foo#getStateParts()' must return an array of state parts but it return Object ([object Object])";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("020 It should return fragment's current state", async () => {
  const textInput = new TextInput();
  await t.expect(textInput.inputElementSelector.count).eql(1);

  const currentState = await textInput.getState();
  expect(currentState, 'to equal', {
    disabled: true,
    value: '42'
  });
});

test("030 It should throw error when 'onlyParts' option is not a nil or array", async () => {
  const textInput = new TextInput();

  let message;
  let isThrown = false;

  // -- 1

  try {
    await textInput.getState({ omitParts: 'foo' });
  }
  catch (e) {
    message = "'omitParts' option must be a nil or array of non-blank strings but it is String (foo)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // -- 2

  try {
    await textInput.getState({ omitParts: ['foo', 11] });
  }
  catch (e) {
    message = "'omitParts' option must be a nil or array of non-blank strings but it is Array (foo,11)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when 'onlyParts' option is not a nil or array", async () => {
  const textInput = new TextInput();

  let message;
  let isThrown = false;

  // -- 1

  try {
    await textInput.getState({ onlyParts: 'foo' });
  }
  catch (e) {
    message = "'onlyParts' option must be a nil or array of non-blank strings but it is String (foo)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  // -- 1

  try {
    await textInput.getState({ onlyParts: ['foo', 11] });
  }
  catch (e) {
    message = "'onlyParts' option must be a nil or array of non-blank strings but it is Array (foo,11)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should respect 'onlyParts' option", async () => {
  const textInput = new TextInput();
  await t.expect(textInput.inputElementSelector.count).eql(1);

  const currentState = await textInput.getState({ onlyParts: ['value'] });
  expect(currentState, 'to equal', { value: '42' });
});

test("060 It should respect 'omitParts' option", async () => {
  const textInput = new TextInput();
  await t.expect(textInput.inputElementSelector.count).eql(1);

  const currentState = await textInput.getState({ omitParts: ['value'] });
  expect(currentState, 'to equal', { disabled: true });
});

test("070 It should allow both 'onlyParts' and 'omitParts' options to be used simultaneously", async () => {
  const textInput = new TextInput();
  await t.expect(textInput.inputElementSelector.count).eql(1);

  const currentState = await textInput.getState({
    omitParts: ['value'],
    onlyParts: ['value']
  });
  expect(currentState, 'to equal', {});
});

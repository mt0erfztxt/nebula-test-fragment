import _ from 'lodash';
import appRootPath from 'app-root-path';
import expect from 'unexpected';
import {t} from 'testcafe';

import {Fragment} from '../../../src';
import utils from "../../../src/utils";

fixture `Fragment :: 090 #getState()`
  .page(appRootPath.path + '/test/fixtures/fragment/090-get-state.html');

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
}

Object.defineProperties(TextInput, {
  bemBase: {
    value: 'textInput'
  },
  displayName: {
    value: 'TextInput'
  }
});

test("010 It should throw error when fragment's 'getStateParts()' implemented incorrectly", async () => {
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

test("030 It should throw error when 'options.onlyParts' argument is not a nil or array", async () => {
  let message;
  let isThrown = false;
  const textInput = new TextInput();

  try {
    await textInput.getState({omitParts: 'foo'});
  }
  catch (e) {
    message = "'options.omitParts' argument must be a nil or array of non-blank strings but it is String (foo)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  try {
    await textInput.getState({omitParts: ['foo', 11]});
  }
  catch (e) {
    message = "'options.omitParts' argument must be a nil or array of non-blank strings but it is Array (foo,11)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when 'options.onlyParts' argument is not a nil or array", async () => {
  let message;
  let isThrown = false;
  const textInput = new TextInput();

  try {
    await textInput.getState({onlyParts: 'foo'});
  }
  catch (e) {
    message = "'options.onlyParts' argument must be a nil or array of non-blank strings but it is String (foo)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');

  try {
    await textInput.getState({onlyParts: ['foo', 11]});
  }
  catch (e) {
    message = "'options.onlyParts' argument must be a nil or array of non-blank strings but it is Array (foo,11)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should respect 'options.onlyParts' argument", async () => {
  const textInput = new TextInput();
  await t.expect(textInput.inputElementSelector.count).eql(1);

  const currentState = await textInput.getState({onlyParts: ['value']});
  expect(currentState, 'to equal', {
    value: '42'
  });
});

test("060 It should respect 'options.omitParts' argument", async () => {
  const textInput = new TextInput();
  await t.expect(textInput.inputElementSelector.count).eql(1);

  const currentState = await textInput.getState({omitParts: ['value']});
  expect(currentState, 'to equal', {
    disabled: true
  });
});

test("070 It should allow both 'options.onlyParts' and 'options.omitParts' arguments to be used simultaneously", async () => {
  const textInput = new TextInput();
  await t.expect(textInput.inputElementSelector.count).eql(1);

  const currentState = await textInput.getState({omitParts: ['value'], onlyParts: ['value']});
  expect(currentState, 'to equal', {});
});

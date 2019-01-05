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

    const opts = new Options(options, {
      defaults: {
        paste: true,
        replace: true
      }
    });
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

fixture('Fragment :: 120 #setState()')
  .page(__dirname + '/index.html');

test("010 It should return current state when 'newState' argument is 'undefined'", async () => {
  const textInput = new TextInput();
  const curState = await textInput.getState();
  const newState = await textInput.setState(void(0));
  expect(newState, 'to equal', curState);
});

test("020 It should throw error when 'newState' argument is set but it is not a plain object", async () => {
  const textInput = new TextInput();

  let isThrown = false;

  try {
    await textInput.setState('foo');
  }
  catch (e) {
    const message = "'newState' argument must be a plain object but it is String (foo)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("030 It should throw error when fragment's 'getStateParts()' implemented incorrectly", async () => {
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

  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.setState({ value: null });
  }
  catch (e) {
    const message = "'Foo#getStateParts()' must return an array of state parts but it return Object ([object Object])";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("040 It should throw error when setter for specified part of state is not implemented", async () => {
  class Foo extends Fragment {
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
        return _.concat(writableParts, []);
      }
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

  const foo = new Foo();

  let isThrown = false;

  try {
    await foo.setState({ value: 'foo' });
  }
  catch (e) {
    const message = "'Foo#setValuePartOfState' must be a function but it is #Undefined (undefined)";
    expect(e.message, 'to equal', message);
    isThrown = true;
  }

  expect(isThrown, 'to be true');
});

test("050 It should set new state", async (t) => {
  const textInput = new TextInput();
  await t
    .expect(textInput.inputElementSelector.hasAttribute('disabled'))
    .notOk();
  await t
    .expect(textInput.inputElementSelector.value)
    .eql('42');

  const newState = await textInput.setState({ disabled: true, value: 'foo' });
  await t
    .expect(textInput.inputElementSelector.hasAttribute('disabled'))
    .notOk();
  await t
    .expect(textInput.inputElementSelector.value)
    .eql('foo');
  expect(newState, 'to equal', {
    // No 'Disabled' part of state here because it's a read-only part.
    // disabled: false,
    value: 'foo'
  });
});

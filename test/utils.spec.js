import expect from 'unexpected';

import utils from '../src/utils';

describe('utils', () => {
  describe('initializeOptions()', () => {
    it("should throw when `value` argument is set but not of type `Options`", () => {
      expect(
        () => utils.initializeOptions(42),
        'to throw',
        "'value' argument must be a nil or of type Options but it is Number (42)"
      );
    });

    it("should throw when `options` argument is set but is not of type `Options`", () => {
      expect(
        () => utils.initializeOptions({}, false),
        'to throw',
        "'options' argument must be a nil or of type Options but it is Boolean (false)"
      );
    });

    it("should throw error when `options.defaults` argument is not nil but not a function or a plain object", () => {
      expect(
        () => utils.initializeOptions({}, {defaults: 'defaults'}),
        'to throw',
        "'options.defaults' argument must be a function or a plain object but it is String (defaults)"
      );
    });

    it("should return plain object when `value` argument is a nil", () => {
      expect(utils.initializeOptions(void(0)), 'to equal', {});
      expect(utils.initializeOptions(null), 'to equal', {});
    });

    it("should return cloned `value` argument when it is a plain object", () => {
      const passedInValue = {foo: 'bar'};
      const returnedValue = utils.initializeOptions(passedInValue);
      expect(returnedValue !== passedInValue, 'to be true');
      expect(returnedValue, 'to equal', passedInValue);
    });

    it("should return plain object with defaults in-place when `option.default` argument is a function", () => {
      const defaultsFn = (v, o) => {
        expect(v, 'to equal', {foo: 'bar'});
        expect(o.defaults === defaultsFn, 'to be true');
        return {fiz: 'buz'};
      };
      expect(
        utils.initializeOptions({foo: 'bar'}, {defaults: defaultsFn}),
        'to equal',
        {
          foo: 'bar',
          fiz: 'buz'
        }
      );
    });

    it("should return plain object with defaults in-place when `option.default` argument is a plain object", () => {
      expect(
        utils.initializeOptions({}, {defaults: {foo: 1}}),
        'to equal',
        {
          foo: 1
        }
      );
    });

    it("should throw error when 'options.validator' argument is set but it is not a function", () => {
      expect(
        () => utils.initializeOptions({}, {validator: true}),
        'to throw',
        new TypeError("'options.validator' argument must be a function but it is Boolean (true)")
      );
    });

    it("should throw error when 'options.validator' argument is a function and validation failed", () => {
      const validationMsg = "A validation error message";
      const validator = (r) => {
        expect(r, 'to equal', {foo: 'bar', some: 'thing'});
        return validationMsg
      };
      expect(
        () => utils.initializeOptions(
          {foo: 'bar'},
          {
            defaults: {some: 'thing'},
            validator
          }
        ),
        'to throw',
        new TypeError("'value' argument is of type Options but validation failed with error - " + validationMsg)
      );
    });

    it("should return plain object when 'options.validator' argument is a function and validation succeeded", () => {
      const validator = () => null;
      expect(
        utils.initializeOptions({foo: 'bar'}, {validator}),
        'to equal',
        {
          foo: 'bar'
        }
      );
    });
  });

  describe('isEmptyString()', () => {
    it("should return `true` when passed in `value` argument is an empty string", () => {
      expect(utils.isEmptyString(''), 'to be', true);
    });

    it("should return `false` when passed in `value` argument is not an empty string", () => {
      expect(utils.isEmptyString(' '), 'to be', false);
      expect(utils.isEmptyString('1'), 'to be', false);
      expect(utils.isEmptyString(1), 'to be', false);
      expect(utils.isEmptyString(false), 'to be', false);
      expect(utils.isEmptyString({}), 'to be', false);
    });
  });

  describe('isNonEmptyString()', () => {
    it("should return `true` when passed in `value` argument is a non-empty string", () => {
      expect(utils.isNonEmptyString(' '), 'to be', true);
      expect(utils.isNonEmptyString('1'), 'to be', true);
    });

    it("should return `false` when passed in `value` argument is not an empty string", () => {
      expect(utils.isNonEmptyString(''), 'to be', false);
      expect(utils.isNonEmptyString(1), 'to be', false);
      expect(utils.isNonEmptyString(false), 'to be', false);
      expect(utils.isNonEmptyString({}), 'to be', false);
    });
  });

  describe('isOptions()', () => {
    it("should return `true` when passed in `value` argument is of type `Options`", () => {
      expect(utils.isOptions({}), 'to be', true);
    });

    it("should return `false` when passed in `value` argument is not of type `Options`", () => {
      expect(utils.isOptions(42), 'to be', false);
      expect(utils.isOptions('foo'), 'to be', false);
      expect(utils.isOptions(false), 'to be', false);
    });

    it("should throw error when passed in `value` argument is not of type `Options` and `throwWhenFalse` argument is truthy", () => {
      expect(
        () => utils.isOptions(42, true),
        'to throw',
        new TypeError("'value' argument must be of type Options but it is Number (42)")
      );
      expect(
        () => utils.isOptions(42, 1),
        'to throw',
        new TypeError("'value' argument must be of type Options but it is Number (42)")
      );
    });
  });

  describe('isString()', () => {
    it("should return `true` when passed in `value` argument is a string", () => {
      expect(utils.isString(''), 'to be', true);
      expect(utils.isString(' '), 'to be', true);
      expect(utils.isString('1'), 'to be', true);
      expect(utils.isString(String(1)), 'to be', true);
    });

    it("should return `false` when passed in `value` argument is not a string", () => {
      expect(utils.isString(1), 'to be', false);
      expect(utils.isString(false), 'to be', false);
      expect(utils.isString({}), 'to be', false);
    });
  });

  describe('maybeOptions()', () => {
    it("should return `true` when passed in `value` argument is a nil or of type `Options`", () => {
      expect(utils.maybeOptions(void(0)), 'to be true');
      expect(utils.maybeOptions(null), 'to be true');
      expect(utils.maybeOptions({}), 'to be true');
    });

    it("should return `false` when passed in `value` argument is not a nil or not of type `Options`", () => {
      expect(utils.maybeOptions(42), 'to be', false);
      expect(utils.maybeOptions('foo'), 'to be', false);
      expect(utils.maybeOptions(false), 'to be', false);
    });

    it("should throw error when passed in `value` argument is not a nil or not of type `Options` and `throwWhenFalse` argument is truthy", () => {
      expect(
        () => utils.maybeOptions(42, true),
        'to throw',
        new TypeError("'value' argument must be a nil or of type Options but it is Number (42)")
      );
      expect(
        () => utils.maybeOptions(42, 1),
        'to throw',
        new TypeError("'value' argument must be a nil or of type Options but it is Number (42)")
      );
    });
  });
});

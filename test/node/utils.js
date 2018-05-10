import expect from 'unexpected';

import utils from '../../src/utils';

describe('utils', () => {
  describe("buildTestCafeAssertionName()", function () {
    it("should throw error when `assertionName` argument is not non-blank string", function () {
      expect(
        () => utils.buildTestCafeAssertionName(),
        'to throw',
        new TypeError("'assertionName' argument must be a non-blank string but it is #Undefined (undefined)")
      );
      expect(
        () => utils.buildTestCafeAssertionName(''),
        'to throw',
        new TypeError("'assertionName' argument must be a non-blank string but it is String ()")
      );
      expect(
        () => utils.buildTestCafeAssertionName('  '),
        'to throw',
        new TypeError("'assertionName' argument must be a non-blank string but it is String (  )")
      );
      expect(
        () => utils.buildTestCafeAssertionName(true),
        'to throw',
        new TypeError("'assertionName' argument must be a non-blank string but it is Boolean (true)")
      );
    });

    it("should throw error when `assertionName` argument is not non-blank string", function () {
      expect(
        () => utils.buildTestCafeAssertionName('nonExistentAssertionName'),
        'to throw',
        new TypeError("TestCafe doesn't provide 'nonExistentAssertionName' assertion")
      );
    });

    it("should handle 'eql' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('eql'), 'to equal', 'eql');
      expect(utils.buildTestCafeAssertionName(' eql  '), 'to equal', 'eql');
      expect(utils.buildTestCafeAssertionName('eql', {isNot: true}), 'to equal', 'notEql');
    });

    it("should handle 'notEql' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('notEql'), 'to equal', 'notEql');
      expect(utils.buildTestCafeAssertionName(' notEql  '), 'to equal', 'notEql');
      expect(utils.buildTestCafeAssertionName('notEql', {isNot: true}), 'to equal', 'eql');
    });

    it("should handle 'ok' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('ok'), 'to equal', 'ok');
      expect(utils.buildTestCafeAssertionName(' ok  '), 'to equal', 'ok');
      expect(utils.buildTestCafeAssertionName('ok', {isNot: true}), 'to equal', 'notOk');
    });

    it("should handle 'notOk' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('notOk'), 'to equal', 'notOk');
      expect(utils.buildTestCafeAssertionName(' notOk  '), 'to equal', 'notOk');
      expect(utils.buildTestCafeAssertionName('notOk', {isNot: true}), 'to equal', 'ok');
    });

    it("should handle 'contains' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('contains'), 'to equal', 'contains');
      expect(utils.buildTestCafeAssertionName(' contains  '), 'to equal', 'contains');
      expect(utils.buildTestCafeAssertionName('contains', {isNot: true}), 'to equal', 'notContains');
    });

    it("should handle 'notContains' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('notContains'), 'to equal', 'notContains');
      expect(utils.buildTestCafeAssertionName(' notContains  '), 'to equal', 'notContains');
      expect(utils.buildTestCafeAssertionName('notContains', {isNot: true}), 'to equal', 'contains');
    });

    it("should handle 'typeOf' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('typeOf'), 'to equal', 'typeOf');
      expect(utils.buildTestCafeAssertionName(' typeOf  '), 'to equal', 'typeOf');
      expect(utils.buildTestCafeAssertionName('typeOf', {isNot: true}), 'to equal', 'notTypeOf');
    });

    it("should handle 'notTypeOf' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('notTypeOf'), 'to equal', 'notTypeOf');
      expect(utils.buildTestCafeAssertionName(' notTypeOf  '), 'to equal', 'notTypeOf');
      expect(utils.buildTestCafeAssertionName('notTypeOf', {isNot: true}), 'to equal', 'typeOf');
    });

    it("should handle 'gt' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('gt'), 'to equal', 'gt');
      expect(utils.buildTestCafeAssertionName(' gt  '), 'to equal', 'gt');
      expect(utils.buildTestCafeAssertionName('gt', {isNot: true}), 'to equal', 'lte');
    });

    it("should handle 'gte' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('gte'), 'to equal', 'gte');
      expect(utils.buildTestCafeAssertionName(' gte  '), 'to equal', 'gte');
      expect(utils.buildTestCafeAssertionName('gte', {isNot: true}), 'to equal', 'lt');
    });

    it("should handle 'lt' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('lt'), 'to equal', 'lt');
      expect(utils.buildTestCafeAssertionName(' lt  '), 'to equal', 'lt');
      expect(utils.buildTestCafeAssertionName('lt', {isNot: true}), 'to equal', 'gte');
    });

    it("should handle 'lte' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('lte'), 'to equal', 'lte');
      expect(utils.buildTestCafeAssertionName(' lte  '), 'to equal', 'lte');
      expect(utils.buildTestCafeAssertionName('lte', {isNot: true}), 'to equal', 'gt');
    });

    it("should handle 'within' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('within'), 'to equal', 'within');
      expect(utils.buildTestCafeAssertionName(' within  '), 'to equal', 'within');
      expect(utils.buildTestCafeAssertionName('within', {isNot: true}), 'to equal', 'notWithin');
    });

    it("should handle 'notWithin' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('notWithin'), 'to equal', 'notWithin');
      expect(utils.buildTestCafeAssertionName(' notWithin  '), 'to equal', 'notWithin');
      expect(utils.buildTestCafeAssertionName('notWithin', {isNot: true}), 'to equal', 'within');
    });

    it("should handle 'match' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('match'), 'to equal', 'match');
      expect(utils.buildTestCafeAssertionName(' match  '), 'to equal', 'match');
      expect(utils.buildTestCafeAssertionName('match', {isNot: true}), 'to equal', 'notMatch');
    });

    it("should handle 'notMatch' assertion correctly", function () {
      expect(utils.buildTestCafeAssertionName('notMatch'), 'to equal', 'notMatch');
      expect(utils.buildTestCafeAssertionName(' notMatch  '), 'to equal', 'notMatch');
      expect(utils.buildTestCafeAssertionName('notMatch', {isNot: true}), 'to equal', 'match');
    });
  });

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

  describe('isNonBlankString()', () => {
    it("should return `true` when passed in `value` argument is a non-blank string", () => {
      expect(utils.isNonBlankString('1'), 'to be', true);
      expect(utils.isNonBlankString('1  '), 'to be', true);
      expect(utils.isNonBlankString(' 1'), 'to be', true);
      expect(utils.isNonBlankString(' 1  '), 'to be', true);
    });

    it("should return `false` when passed in `value` argument is not a non-blank string", () => {
      expect(utils.isNonBlankString(''), 'to be', false);
      expect(utils.isNonBlankString(' '), 'to be', false);
      expect(utils.isNonBlankString(1), 'to be', false);
      expect(utils.isNonBlankString(false), 'to be', false);
      expect(utils.isNonBlankString({}), 'to be', false);
    });
  });

  describe('isNonEmptyString()', () => {
    it("should return `true` when passed in `value` argument is a non-empty string", () => {
      expect(utils.isNonEmptyString(' '), 'to be', true);
      expect(utils.isNonEmptyString('1'), 'to be', true);
    });

    it("should return `false` when passed in `value` argument is not a non-empty string", () => {
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

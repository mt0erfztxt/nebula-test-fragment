import expect from 'unexpected';

import utils from '../../../src/utils';

describe("utils", function() {
  describe("asArray()", function() {
    it("should return passed in `value` as-is when it's an array", function() {
      const v = ['foo', 'bar', 42];
      expect(utils.asArray(v) === v, 'to be true');
    });

    it("should return passed in `value` wrapped in array when it's not an array", function() {
      const v = 42;
      expect(utils.asArray(v), 'to equal', [v]);
    });
  });

  describe("buildTestCafeAssertionName()", function() {
    it("should throw error when `assertionName` argument is not non-blank string", function() {
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

    it("should throw error when `assertionName` argument is not non-blank string", function() {
      expect(
        () => utils.buildTestCafeAssertionName('nonExistentAssertionName'),
        'to throw',
        new TypeError("TestCafe doesn't provide 'nonExistentAssertionName' assertion")
      );
    });

    it("should handle 'eql' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('eql'), 'to equal', 'eql');
      expect(utils.buildTestCafeAssertionName(' eql  '), 'to equal', 'eql');
      expect(utils.buildTestCafeAssertionName('eql', { isNot: true }), 'to equal', 'notEql');
    });

    it("should handle 'notEql' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('notEql'), 'to equal', 'notEql');
      expect(utils.buildTestCafeAssertionName(' notEql  '), 'to equal', 'notEql');
      expect(utils.buildTestCafeAssertionName('notEql', { isNot: true }), 'to equal', 'eql');
    });

    it("should handle 'ok' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('ok'), 'to equal', 'ok');
      expect(utils.buildTestCafeAssertionName(' ok  '), 'to equal', 'ok');
      expect(utils.buildTestCafeAssertionName('ok', { isNot: true }), 'to equal', 'notOk');
    });

    it("should handle 'notOk' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('notOk'), 'to equal', 'notOk');
      expect(utils.buildTestCafeAssertionName(' notOk  '), 'to equal', 'notOk');
      expect(utils.buildTestCafeAssertionName('notOk', { isNot: true }), 'to equal', 'ok');
    });

    it("should handle 'contains' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('contains'), 'to equal', 'contains');
      expect(utils.buildTestCafeAssertionName(' contains  '), 'to equal', 'contains');
      expect(utils.buildTestCafeAssertionName('contains', { isNot: true }), 'to equal', 'notContains');
    });

    it("should handle 'notContains' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('notContains'), 'to equal', 'notContains');
      expect(utils.buildTestCafeAssertionName(' notContains  '), 'to equal', 'notContains');
      expect(utils.buildTestCafeAssertionName('notContains', { isNot: true }), 'to equal', 'contains');
    });

    it("should handle 'typeOf' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('typeOf'), 'to equal', 'typeOf');
      expect(utils.buildTestCafeAssertionName(' typeOf  '), 'to equal', 'typeOf');
      expect(utils.buildTestCafeAssertionName('typeOf', { isNot: true }), 'to equal', 'notTypeOf');
    });

    it("should handle 'notTypeOf' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('notTypeOf'), 'to equal', 'notTypeOf');
      expect(utils.buildTestCafeAssertionName(' notTypeOf  '), 'to equal', 'notTypeOf');
      expect(utils.buildTestCafeAssertionName('notTypeOf', { isNot: true }), 'to equal', 'typeOf');
    });

    it("should handle 'gt' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('gt'), 'to equal', 'gt');
      expect(utils.buildTestCafeAssertionName(' gt  '), 'to equal', 'gt');
      expect(utils.buildTestCafeAssertionName('gt', { isNot: true }), 'to equal', 'lte');
    });

    it("should handle 'gte' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('gte'), 'to equal', 'gte');
      expect(utils.buildTestCafeAssertionName(' gte  '), 'to equal', 'gte');
      expect(utils.buildTestCafeAssertionName('gte', { isNot: true }), 'to equal', 'lt');
    });

    it("should handle 'lt' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('lt'), 'to equal', 'lt');
      expect(utils.buildTestCafeAssertionName(' lt  '), 'to equal', 'lt');
      expect(utils.buildTestCafeAssertionName('lt', { isNot: true }), 'to equal', 'gte');
    });

    it("should handle 'lte' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('lte'), 'to equal', 'lte');
      expect(utils.buildTestCafeAssertionName(' lte  '), 'to equal', 'lte');
      expect(utils.buildTestCafeAssertionName('lte', { isNot: true }), 'to equal', 'gt');
    });

    it("should handle 'within' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('within'), 'to equal', 'within');
      expect(utils.buildTestCafeAssertionName(' within  '), 'to equal', 'within');
      expect(utils.buildTestCafeAssertionName('within', { isNot: true }), 'to equal', 'notWithin');
    });

    it("should handle 'notWithin' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('notWithin'), 'to equal', 'notWithin');
      expect(utils.buildTestCafeAssertionName(' notWithin  '), 'to equal', 'notWithin');
      expect(utils.buildTestCafeAssertionName('notWithin', { isNot: true }), 'to equal', 'within');
    });

    it("should handle 'match' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('match'), 'to equal', 'match');
      expect(utils.buildTestCafeAssertionName(' match  '), 'to equal', 'match');
      expect(utils.buildTestCafeAssertionName('match', { isNot: true }), 'to equal', 'notMatch');
    });

    it("should handle 'notMatch' assertion correctly", function() {
      expect(utils.buildTestCafeAssertionName('notMatch'), 'to equal', 'notMatch');
      expect(utils.buildTestCafeAssertionName(' notMatch  '), 'to equal', 'notMatch');
      expect(utils.buildTestCafeAssertionName('notMatch', { isNot: true }), 'to equal', 'match');
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
});

import expect from 'unexpected';

import utils from '../src/utils';

describe('utils', function () {
  describe('initializeOptions()', function () {
    it("should throw when `value` argument is set but not of type Options", function () {
      expect(function () {
          utils.initializeOptions(42);
        }, 'to throw', "'value' must be an undefined or of type Options but it is Number (42)"
      );
    });

    it("should throw when `options` argument is set but is not of type Options", function () {
      expect(function () {
          utils.initializeOptions({}, false);
        }, 'to throw', "'options' must be of type Options but it is Boolean (false)"
      );
    });

    it("should throw when `options.defaults` argument isn't nil but not a POJO", function () {
      expect(function () {
          utils.initializeOptions({}, {defaults: 'defaults'});
        }, 'to throw', "'options.defaults' must be a plain object but it is String (defaults)"
      );
    });

    it("should return POJO when `subject` is a nil", function () {
      expect(utils.initializeOptions(), 'to equal', {});
      expect(utils.initializeOptions(null), 'to equal', {});
    });

    it("should return POJO same as `subject` when it's a POJO", function () {
      expect(utils.initializeOptions({option1: 1}), 'to equal', {option1: 1});
    });

    it('should return POJO with defaults applied when `option.default` is set', function () {
      expect(utils.initializeOptions({}, {defaults: {option1: 1}}), 'to equal', {option1: 1});
    });
  });

  describe('isEmptyString()', function () {
    it("should return `true` when passed in `subject` is an empty string", function () {
      expect(utils.isEmptyString(''), 'to be', true);
    });

    it("should return `false` when passed in `subject` isn't an empty string", function () {
      expect(utils.isEmptyString(' '), 'to be', false);
      expect(utils.isEmptyString('1'), 'to be', false);
      expect(utils.isEmptyString(1), 'to be', false);
      expect(utils.isEmptyString(false), 'to be', false);
      expect(utils.isEmptyString({}), 'to be', false);
    });
  });

  describe('isNonEmptyString()', function () {
    it("should return `true` when passed in `subject` is a non-empty string", function () {
      expect(utils.isNonEmptyString(' '), 'to be', true);
      expect(utils.isNonEmptyString('1'), 'to be', true);
    });

    it("should return `false` when passed in `subject` isn't an empty string", function () {
      expect(utils.isNonEmptyString(''), 'to be', false);
      expect(utils.isNonEmptyString(1), 'to be', false);
      expect(utils.isNonEmptyString(false), 'to be', false);
      expect(utils.isNonEmptyString({}), 'to be', false);
    });
  });

  describe('isOptions()', function () {
    it("should return `true` when passed in `subject` is a null", function () {
      expect(utils.isOptions(null), 'to be', true);
    });

    it("should return `true` when passed in `subject` is a plain object", function () {
      expect(utils.isOptions({}), 'to be', true);
    });

    it("should return `false` otherwise", function () {
      expect(utils.isOptions(42), 'to be', false);
      expect(utils.isOptions('foo'), 'to be', false);
      expect(utils.isOptions(false), 'to be', false);
    });

    it("should throw error when `throwWhenFalse` argument is truthy and `subject` is not of type Options", function () {
      expect(function () {
          utils.isOptions(42, true);
        }, 'to throw', "'subject' must be of type Options but it is Number (42)"
      );
    });
  });

  describe('isString()', function () {
    it("should return `true` when passed in `subject` is a string", function () {
      expect(utils.isString(''), 'to be', true);
      expect(utils.isString(' '), 'to be', true);
      expect(utils.isString('1'), 'to be', true);
      expect(utils.isString(String(1)), 'to be', true);
    });

    it("should return `false` when passed in `subject` isn't a string", function () {
      expect(utils.isString(1), 'to be', false);
      expect(utils.isString(false), 'to be', false);
      expect(utils.isString({}), 'to be', false);
    });
  });
});

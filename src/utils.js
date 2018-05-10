import _ from 'lodash';
import typeOf from 'typeof--';

/**
 * Options - just a plain object.
 *
 * @typedef {object} Options
 */

const utils = {
  initializeOptions,
  isEmptyString,
  isNonBlankString,
  isNonEmptyString,
  isOptions,
  isString,
  maybeOptions
};

/**
 * Initializes passed in `value` as `Options` object.
 *
 * @param {?*} value - Value to initialize
 * @param {?Options} [options] - Options
 * @param {function|object} [options.defaults] - Defaults for key-value pairs not provided in `value` or a function that accepts `value` and `options` and returns such defaults
 * @param {function} [options.validator] - Validates resulting value before it would be returned. Accepts resulting value and must return `null` in case of successful validation
 * @returns {Options} Initialized, and optionally validated, `Options` object.
 * @throws {TypeError} When arguments are not valid or validation failed.
 */
function initializeOptions(value, options) {
  if (!maybeOptions(options)) {
    throw new TypeError(
      `'options' argument must be a nil or of type Options but it is ${typeOf(options)} (${options})`
    );
  }

  const opts = options || {};
  const {defaults, validator} = opts;

  if (!maybeOptions(value)) {
    throw new TypeError(
      `'value' argument must be a nil or of type Options but it is ${typeOf(value)} (${value})`
    );
  }

  if (!(_.isNil(defaults) || _.isPlainObject(defaults) || _.isFunction(defaults))) {
    throw new TypeError(
      `'options.defaults' argument must be a function or a plain object but it is ${typeOf(defaults)} (${defaults})`
    );
  }

  const chosenDefaults = _.isFunction(defaults) ? defaults(value, opts) : defaults;
  const result = _.defaults({}, value, chosenDefaults);

  if (validator) {
    if (!_.isFunction(validator)) {
      throw new TypeError(
        `'options.validator' argument must be a function but it is ${typeOf(validator)} (${validator})`
      );
    }

    const validationMessage = validator(result);

    if (!_.isNull(validationMessage)) {
      throw new TypeError(
        "'value' argument is of type Options but validation failed with error - " + validationMessage
      );
    }
  }

  return result;
}

/**
 * Returns `true` when passed in `value` is an empty string, otherwise returns
 * `false`.
 *
 * @param {*} value - Subject that must be tested
 * @returns {boolean}
 */
function isEmptyString(value) {
  return (isString(value) && value.length === 0);
}

/**
 * Returns `true` when passed in `value` is a non-blank string, otherwise
 * returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @returns {boolean}
 */
function isNonBlankString(value) {
  return (isString(value) && _.trim(value).length > 0);
}

/**
 * Returns `true` when passed in `value` is a non-empty string, otherwise
 * returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return (isString(value) && value.length > 0);
}

/**
 * Returns `true` when passed in `value` is of type `Options`, otherwise
 * returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @param {boolean} [throwWhenFalse=false] - When truthy an error would be thrown instead of returning `false`
 * @returns {boolean}
 * @throws {TypeError} When `throwWhenFalse` is truthy and `value` doesn't pass test.
 */
function isOptions(value, throwWhenFalse = false) {
  if (_.isPlainObject(value)) {
    return true;
  }
  else {
    if (throwWhenFalse) {
      throw new TypeError(
        `'value' argument must be of type Options but it is ${typeOf(value)} (${value})`
      );
    }

    return false;
  }
}

/**
 * Returns `true` when `value` is a string, otherwise returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @returns {boolean}
 */
function isString(value) {
  return (Object.prototype.toString.call(value) === '[object String]');
}

/**
 * Returns `true` when passed in `value` is nil or of type `Options`, otherwise
 * returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @param {boolean} [throwWhenFalse=false] - When truthy an error would be thrown instead of returning `false`
 * @returns {boolean}
 * @throws {TypeError} When `throwWhenFalse` is truthy and `value` doesn't pass test.
 */
function maybeOptions(value, throwWhenFalse = false) {
  if ((_.isNil(value) || isOptions(value))) {
    return true;
  }
  else {
    if (throwWhenFalse) {
      throw new TypeError(
        `'value' argument must be a nil or of type Options but it is ${typeOf(value)} (${value})`
      );
    }

    return false;
  }
}

export default utils;
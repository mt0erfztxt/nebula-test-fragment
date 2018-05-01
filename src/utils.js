import _ from 'lodash';
import typeOf from 'typeof--';

/**
 * Options object - a plain object.
 *
 * @typedef {object} Options
 */

const utils = {
  initializeOptions,
  isEmptyString,
  isNonEmptyString,
  isOptions,
  isString
};

/**
 * Initializes passed in value as `Options` object.
 *
 * @param {*} [value] - Value to initialize
 * @param {?Options} [options] - Options for initialization
 * @param {object} [options.defaults] - Default values not provided in `value`
 * @returns {Options} Initialized `Options` object.
 * @throws {TypeError} When arguments are not valid.
 */
function initializeOptions(value, options) {
  if (!(isOptions(options) || _.isUndefined(options))) {
    throw new TypeError(
      `'options' must be of type Options but it is ${typeOf(options)} (${options})`
    );
  }

  const opts = options || {};
  const {defaults} = opts;

  if (!(isOptions(value) || _.isUndefined(value))) {
    throw new TypeError(
      `'value' must be an undefined or of type Options but it is ${typeOf(value)} (${value})`
    );
  }

  if (!(_.isNil(defaults) || _.isPlainObject(defaults))) {
    throw new TypeError(
      `'options.defaults' must be a plain object but it is ${typeOf(defaults)} (${defaults})`
    );
  }

  return _.assign({}, value, defaults);
}


/**
 * Returns `true` when passed in subject is an empty string, otherwise returns
 * `false`.
 *
 * @param {*} subject - Subject that must be tested whether it's an empty string or not
 * @returns {boolean}
 */
function isEmptyString(subject) {
  return (isString(subject) && subject.length === 0);
}

/**
 * Returns `true` when passed in subject is a non-empty string, otherwise
 * returns `false`.
 *
 * @param {*} subject - Subject that must be tested whether it's a non-empty string or not
 * @returns {boolean}
 */
function isNonEmptyString(subject) {
  return (isString(subject) && subject.length > 0);
}

/**
 * Returns `true` when subject is of type `Options`, otherwise returns `false`.
 *
 * @param {*} subject - Subject that must be tested
 * @param {boolean} [throwWhenFalse=false] - When truthy an error would be thrown instead of returning `false`.
 * @returns {boolean}
 * @throws {TypeError} When `throwWhenFalse` is truthy and `subject` is not of type `Options`.
 */
function isOptions(subject, throwWhenFalse = false) {
  if ((_.isNull(subject) || _.isPlainObject(subject))) {
    return true;
  }
  else {
    if (throwWhenFalse) {
      throw new TypeError(
        `'subject' must be of type Options but it is ${typeOf(subject)} (${subject})`
      );
    }

    return false;
  }
}

/**
 * Returns `true` when subject is a string, otherwise returns `false`.
 *
 * @param {*} subject - Subject that must be tested whether it's a string or not
 * @returns {boolean}
 */
function isString(subject) {
  return (Object.prototype.toString.call(subject) === '[object String]');
}
export default utils;
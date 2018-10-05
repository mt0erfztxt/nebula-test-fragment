import _ from 'lodash';
import { lcFirst, ucFirst } from 'change-case';
import typeOf from 'typeof--';

import Options from './options';

const testCafeAssertionNames = [
  'eql',
  'notEql',
  'ok',
  'notOk',
  'contains',
  'notContains',
  'typeOf',
  'notTypeOf',
  'gt',
  'gte',
  'lt',
  'lte',
  'within',
  'notWithin',
  'match',
  'notMatch'
];

const utils = {
  asArray,
  buildTestCafeAssertionName,
  isEmptyString,
  isNonBlankString,
  isNonEmptyString,
  isString,
  Options
};

/**
 * When `value` is an array it returned as-is, otherwise it wrapped in array
 * and returned.
 * 
 * @param {*} value 
 * @returns {Arraya}
 */
function asArray(value) {
  if (_.isArray(value)) {
    return value;
  }
  else {
    return [value];
  }
}

/**
 * Checks that TestCafe provides assertion with specified name and returns it.
 * Note that check is done after whitespaces trimmed down from both sides of
 * `assertionName` argument. Also see `options` for available transformations
 * and etc.
 *
 * @param {string} assertionName - Name of TestCafe assertion
 * @param {?Options} [options] - Options
 * @param {boolean} [options.isNot=false] - When truthy assertion name would be negated, for example, 'eql' would be toggled to 'notEql'
 * @returns {string} Returns TestCafe assertion name
 * @throws {TypeError} When arguments aren't valid.
 */
function buildTestCafeAssertionName(assertionName, options) {
  const opts = new Options(options, { defaults: { isNot: false } });
  const { isNot } = opts;

  if (!isNonBlankString(assertionName)) {
    throw new TypeError(
      `'assertionName' argument must be a non-blank string but it is ${typeOf(assertionName)} (${assertionName})`
    );
  }

  assertionName = _.trim(assertionName);

  if (!_.includes(testCafeAssertionNames, assertionName)) {
    throw new TypeError(
      `TestCafe doesn't provide '${assertionName}' assertion`
    );
  }

  if (isNot) {
    if (assertionName === 'gt') {
      assertionName = 'lte';
    }
    else if (assertionName === 'gte') {
      assertionName = 'lt';
    }
    else if (assertionName === 'lt') {
      assertionName = 'gte';
    }
    else if (assertionName === 'lte') {
      assertionName = 'gt';
    }
    else if (_.startsWith(assertionName, 'not')) {
      assertionName = assertionName.substr(3);
      assertionName = lcFirst(assertionName);
    }
    else {
      assertionName = ucFirst(assertionName);
      assertionName = 'not' + assertionName;
    }
  }

  return assertionName;
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
 * Returns `true` when `value` is a string, otherwise returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @returns {boolean}
 */
function isString(value) {
  return (Object.prototype.toString.call(value) === '[object String]');
}

export default utils;

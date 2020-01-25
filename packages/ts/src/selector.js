import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import { Selector, t } from 'testcafe';
import typeOf from 'typeof--';

import Options from "./options";
import utils from './utils';

/**
 * Asserts that TestCafe selector initialized using `selectorInitializer` have
 * specified (CSS) class names. Note that TestCafe's auto wait feature used
 * to test for presence/absence of each (CSS) class name of `classNames`.
 *
 * @param {*} selectorInitializer - Initializer for TestCafe selector. See TestCafe's `Selector` for more info. Note that selector must return exactly one DOM node, otherwise error would be thrown
 * @param {array|string} classNames - (CSS) Class names which selector must have. Examples: 'className', ['className'], [['className']], [['className', false]], [['className', true]], [['className'], ['other-class-name', true]]. In case of array, passing truthy value as second element of `classNames` array item allows to assert that selector doesn't have specified (CSS) class name
 * @param {?Options} [options] - Options
 * @param {boolean} [options.only=false] - When truthy selector must have only (CSS) class names specified in `classNames` argument
 * @throws {TypeError} When arguments aren't valid.
 */
async function expectHasClassNames(selectorInitializer, classNames, options) {
  if (!(utils.isNonBlankString(classNames) || _.isArray(classNames))) {
    throw new TypeError(
      `'classNames' argument must be a non-blank string or array but it is ${typeOf(classNames)} (${classNames})`
    );
  }

  const opts = new Options(options, { defaults: { only: false } });
  const { only } = opts;

  const sel = Selector(selectorInitializer);
  await t.expect(sel.count).eql(1, "Selector must return only one DOM element but it doesn't");

  // `classNames` argument allowed to be a string but we work with array.
  classNames = _.isArray(classNames) ? classNames : [classNames];

  // ---------------------------------------------------------------------------
  // Handling case when selector must not have CSS classes at all
  // ---------------------------------------------------------------------------

  if (_.isEmpty(classNames)) {
    await t
      .expect(sel.classNames)
      .eql([''], `Selector must not have (CSS) class names but it does`);

    return;
  }

  // ---------------------------------------------------------------------------
  // Handling case when selector must have/haven't specified CSS classes
  // ---------------------------------------------------------------------------

  const classNamesMustPresent = [];

  for (const item of classNames) {
    if (!(utils.isNonBlankString(item) || _.isArray(item))) {
      throw new TypeError(
        `Item of 'classNames' array argument must be a non-blank string or array but it is` +
        ` ${typeOf(item)} (${item})`
      );
    }

    let className = item;
    let isNot = false;

    if (_.isArray(item)) {
      [className, isNot = false] = item;
    }

    if (!utils.isNonBlankString(className)) {
      throw new TypeError(
        `First element of array item of 'classNames' array argument must be a non-blank string but it is` +
        ` ${typeOf(className)} (${className})`
      );
    }

    if (!_.isBoolean(isNot)) {
      throw new TypeError(
        `Second element of array item of 'classNames' array argument must be a nil or boolean but it is` +
        ` ${typeOf(isNot)} (${isNot})`
      );
    }

    if (!isNot) {
      classNamesMustPresent.push(className);
    }

    const assertionName = utils.buildTestCafeAssertionName('ok', { isNot });
    const message =
      `Selector must ${isNot ? 'not have' : 'have'} '${className}' (CSS) class name ` +
      `but it ${isNot ? 'does' : "doesn't"}`;

    await t.expect(sel.hasClass(className))[assertionName](message);
  }

  if (only) {
    const classNamesMustPresentTxt = _.join(classNamesMustPresent, ', ');
    const selClassNames = await sel.classNames;
    const selClassNamesTxt = _.join(selClassNames, ', ');

    await t
      .expect(selClassNames.length)
      .eql(
        classNamesMustPresent.length,
        `Selector must have only '${classNamesMustPresentTxt}' (CSS) class names but it have '${selClassNamesTxt}'`
      );
  }
}

/**
 * Accepts TestCafe selector initializer and creates new selector filtered by
 * attribute.
 *
 * @param {*} selectorInitializer - Anything that TestCafe accepts as its `Selector` initializer
 * @param {string[]|string} attribute - Attribute to filter by. Must be an array where first element is an attribute name, which must be a non-blank string, and second is optional attribute value. When it's a nil then selector would be filtered by existence of attribute. When it's a regular expression then selector would be filtered by matching its value to that regular expression. Otherwise selector would be filtered by strict equality of attribute value to stringified version of that value. When attribute has no value (a nil value) then just string of attribute name can be passed instead. Examples: ['foo', /.*bar$/], ['cid', 1], ['disabled'], 'disabled
 * @param {Options} [options] - Options
 * @param {boolean} [options.isNot=false] - When `true` then filter condition would be negated, for example, calling it with 'value', 123, `false` would return selector with only DOM nodes that doesn't have 'value' attribute with value equal '123'
 * @returns {Selector}
 */
function filterByAttribute(selectorInitializer, attribute, options) {
  const opts = new Options(options, { defaults: { isNot: false } });
  const { isNot } = opts;

  let attrName = attribute;
  let attrValue = null;

  if (_.isArray(attribute)) {
    [attrName, attrValue] = attribute;
  }

  if (!utils.isNonBlankString(attrName)) {
    throw new TypeError(
      `Attribute name must be a non-blank string but it is ${typeOf(attrName)} (${attrName})`
    );
  }

  return Selector(selectorInitializer).filter(
    (node) => {
      if (!node.hasAttribute(attrName)) {
        return !!isNot;
      }

      if (attrValue === void(0) || attrValue === null) {
        return !isNot;
      }

      const attr = node.getAttribute(attrName);

      // When attribute value is `RegExp` we use match otherwise we use string equality.
      if (attrValue.test && attrValue.exec && (attrValue.ignoreCase || attrValue.ignoreCase === false)) {
        const matches = attrValue.test(attr);
        return isNot ? !matches : matches;
      }
      else {
        return isNot ? (attr !== (attrValue + '')) : (attr === (attrValue + ''));
      }
    }, { attrName, attrValue, isNot } // dependencies
  );
}

/**
 * Accepts TestCafe selector initializer and creates new selector filtered by
 * `text`. It's a wrapper around TestCafe's `withText` selector that provides
 * filtering by text equality. Needed because currently TestCafe's `withText`
 * always filters by regular expression matching.
 *
 * @param {*} selectorInitializer - Anything that TestCafe accepts as initializer for `Selector`
 * @param {*} text - Text to equal/match. When it's not a string/RegExp it would be stringified beforehand
 * @param {?Options} [options] - Options
 * @param {boolean} [options.isNot=false] - When truthy then filter would be negated. Not implemented yet
 * @returns {object} Returns TestCafe selector.
 */
function filterByText(selectorInitializer, text, options) {
  const opts = new Options(options, { defaults: { isNot: false } });
  const { isNot } = opts;

  if (isNot) {
    throw new Error(
      `'options.isNot' argument functionality is not implemented yet`
    );
  }

  // TestCafe (v0.16.2) always converts `withText` argument to `RegExp` and so
  // we must use workaround to use string equality.
  const textAsRegExp = _.isRegExp(text) ?
    text : new RegExp(`^${escapeStringRegexp('' + text)}$`);

  return Selector(selectorInitializer).withText(textAsRegExp);
}

const selector = {
  expectHasClassNames,
  filterByAttribute,
  filterByText
};

export default selector;

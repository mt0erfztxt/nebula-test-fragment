import { Selector, t } from "testcafe";
import is from "@sindresorhus/is";

import { testCafeAssertion, ValidationResult } from "./utils";

/**
 * Represents class name.
 *
 * Valid class name is a non-blank string.
 *
 * @example
 * "TextInput"
 */
export type ClassName = string;

export function validateClassName(
  className: ClassName
): ValidationResult<ClassName> {
  if (className.trim().length === 0) {
    return {
      error: `Class name must be non-blank string but it is '${className}'`,
      value: className
    };
  } else {
    return { value: className };
  }
}

/**
 * Represents class name spec.
 *
 * Tuple variant allows form of **not** class name.
 *
 * @example
 * "TextInput"
 * ["TextInput"] // same as ["TextInput", false]
 * ["TextInput", true] // not "TextInput"
 */
export type ClassNameSpec = [ClassName, boolean?];

export function validateClassNameSpec(
  classNameSpec: ClassNameSpec
): ValidationResult<ClassNameSpec> {
  const [className, isNot = false] = classNameSpec;
  const { error, value } = validateClassName(className);
  if (error) {
    return { error: `Class name spec -- ${error}`, value: classNameSpec };
  } else {
    return { value: [value, isNot] };
  }
}

/**
 * Asserts that selector have (no) specified class names.
 * @param selectorInitializer Anything TestCafe's `Selector` accepts as initializer
 * @param classNames
 * @param options
 */
export async function expectHasClassNames(
  selectorInitializer: any,
  classNames: [ClassName | ClassNameSpec],
  options: { only: boolean } = { only: false }
): Promise<void> {
  const sel = Selector(selectorInitializer);

  const selLen = await sel.count;
  await t
    .expect(selLen)
    .eql(
      1,
      `Selector must return exactly one DOM element but '${selLen}' of them returned`
    );

  // ---------------------------------------------------------------------------
  // Handling case when selector must not have class names at all
  // ---------------------------------------------------------------------------

  if (is.emptyArray(classNames)) {
    const selClassNames = await sel.classNames;
    await t
      .expect(selClassNames)
      .eql(
        [""],
        "Selector must have no class names but it have '" +
          `${selClassNames.join(", ")}'`
      );

    return;
  }

  // ---------------------------------------------------------------------------
  // Handling case when selector must have/haven't specified class names
  // ---------------------------------------------------------------------------

  const mustPresentClassNames = [];

  for (const item of classNames) {
    const classNameSpec: ClassNameSpec = is.string(item) ? [item] : item;
    const { error, value } = validateClassNameSpec(classNameSpec);
    if (error) {
      throw new Error(error);
    }

    const [className, isNot = false] = value;
    const assertion = testCafeAssertion("ok", { isNot });
    const message =
      "Selector must have" +
      (isNot ? " no " : " ") +
      `'${className}' class name but it ` +
      (isNot ? "does" : "doesn't");

    if (!isNot) {
      mustPresentClassNames.push(className);
    }

    // @ts-ignore
    await t.expect(sel.hasClass(className1))[assertion](message);
  }

  if (options.only) {
    const classNamesMustPresentTxt = mustPresentClassNames.join(", ");
    const selClassNames = await sel.classNames;
    const selClassNamesTxt = selClassNames.join(", ");
    await t
      .expect(selClassNames.length)
      .eql(
        mustPresentClassNames.length,
        `Selector must have only '${classNamesMustPresentTxt}' class names ` +
          `but it have '${selClassNamesTxt}'`
      );
  }
}

/**
 * Represents attribute name.
 *
 * Valid attribute name is a non-blank string.
 *
 * @example
 * "id"
 * "data-foobar"
 */
export type AttributeName = string;

/**
 * Represents attribute value.
 */
export type AttributeValue = boolean | number | RegExp | string | undefined;

/**
 * Represents attribute spec.
 */
export type AttributeSpec = AttributeName | [AttributeName, AttributeValue?];

export function validateAttributeName(
  attributeName: AttributeName
): ValidationResult<AttributeName> {
  if (is.string(attributeName) && attributeName.trim().length === 0) {
    return {
      error:
        `Attribute name must be a non-blank string but it is ` +
        `'${is(attributeName)}' -- ${attributeName}`,
      value: attributeName
    };
  } else {
    return {
      value: attributeName
    };
  }
}

export function validateAttributeSpec(
  attributeSpec: AttributeSpec
): ValidationResult<AttributeSpec> {
  const [attrName] = is.array(attributeSpec) ? attributeSpec : [attributeSpec];
  const { error, value } = validateAttributeName(attrName);
  if (is.undefined(error)) {
    return { value };
  } else {
    return { error, value: attributeSpec };
  }
}

/**
 * Accepts TestCafe's `Selector` initializer and creates new selector filtered
 * by attribute specified attribute spec.
 *
 * @param selectorInitializer Anything TestCafe's `Selector` accepts as initializer
 * @param attributeSpec Used to filter TestCafe's `Selector` created using `selectorInitializer` parameter by specified attribute spec [N, V?]. When V is `undefined` -- filtering would be done by presence of N in selector's attributes, when regular expression -- filtering would be done by matching selector attribute's value to V, otherwise filtering would be done by strict equality of selector attribute's value to string version of V. When V is `undefined` just N can be passed.
 * @param [options] Options
 * @param [options.isNot=false] When `true` then filter condition would be negated, see examples
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'cid' with value equal '1'
 * filterByAttribute(["cid", 1]) // same as calling with ["cid", "1"],
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'disabled' with any value or even without it
 * filterByAttribute(["disabled", undefined]) // same as calling with ["disabled"] or "disabled"
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'foo' with value matches regular expression /.*bar$/
 * filterByAttribute(["foo", /.*bar$/])
 *
 * @example
 * // Filter selector to return only DOM nodes that have no attribute named 'value' with value equal '123'
 * filterByAttribute(["value", 123], { isNot: true })
 */
export function filterByAttribute(
  selectorInitializer: any,
  attributeSpec: AttributeSpec,
  options: { isNot?: boolean } = { isNot: false }
): Selector {
  const { error, value } = validateAttributeSpec(attributeSpec);
  if (!is.undefined(error)) {
    throw new Error(error);
  }

  const { isNot } = options;
  const attrName: AttributeName = value[0];
  const attrValue: AttributeValue = value[1];

  return Selector(selectorInitializer).filter(
    node => {
      if (!node.hasAttribute(attrName)) {
        return !!options.isNot;
      }

      if (is.nullOrUndefined(attrValue)) {
        return !options.isNot;
      }

      const val = node.getAttribute(attrName);
      if (is.regExp(attrValue)) {
        const matches = is.null_(val) ? false : attrValue.test(val);
        return isNot ? !matches : matches;
      } else {
        const attrValAsStr = attrValue + "";
        return isNot ? attrValAsStr !== val : attrValAsStr === val;
      }
    },
    { attrName, attrValue, isNot } // dependencies
  );
}

import { Selector, t } from "testcafe";
import is from "@sindresorhus/is";

import { testCafeAssertion, validationResult, ValidationResult } from "./utils";

/**
 * Represents class name.
 *
 * Valid class name is a non-blank string.
 *
 * @example
 * "TextInput"
 */
export type ClassName = string;

export function validateClassName(className: ClassName): ValidationResult {
  return validationResult(
    !is.emptyStringOrWhitespace(className),
    `Class name must be non-blank string but it is '${className}'`
  );
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
export type ClassNameSpec = ClassName | [ClassName, boolean?];

export function validateClassNameSpec(classNameSpec: ClassNameSpec): ValidationResult {
  return validateClassName(
    is.string(classNameSpec) ? classNameSpec : classNameSpec[0]
  );
}

/**
 * Asserts that selector have (no) specified class names.
 * @param selectorInitializer Anything TestCafe's `Selector` accepts as initializer
 * @param classNameSpecs
 * @param options
 */
export async function expectHasClassNames(
  selectorInitializer: any,
  classNameSpecs: ClassNameSpec[],
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

  if (is.emptyArray(classNameSpecs)) {
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

  for (const classNameSpec of classNameSpecs) {
    const { valid, error } = validateClassNameSpec(classNameSpec);
    if (!valid) {
      throw new Error(error);
    }

    let className: string, isNot;
    if (is.string(classNameSpec)) {
      className = classNameSpec;
      isNot = false;
    } else {
      [className, isNot = false] = classNameSpec;
    }

    if (!isNot) {
      mustPresentClassNames.push(className);
    }

    const message =
      "Selector must have" +
      (isNot ? " no " : " ") +
      `'${className}' class name but it ` +
      (isNot ? "does" : "doesn't");

    // @ts-ignore
    await t.expect(sel.hasClass(className))[
      testCafeAssertion("ok", {
        isNot
      })
    ](message);
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

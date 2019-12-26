import is from "@sindresorhus/is";
import {
  AbstractPageObject,
  SelectorTransformationAlias
} from "./abstract-page-object";
import { BemBase } from "./bem";

export class PageObject extends AbstractPageObject {
  static bemBase: string = "";
  static displayName: string = "PageObject";

  /**
   * Adds 'cid' and 'idx' selector transformation aliases.
   */
  transformSelector(
    selectorTransformationAlias: SelectorTransformationAlias,
    selector: Selector,
    bemBase: BemBase
  ): Selector {
    const [n, v] = selectorTransformationAlias;

    if (!["cid", "idx"].includes(n)) {
      return selector;
    }

    if ("cid" === n) {
      if (is.boolean(v) || is.number(v) || (is.string(v) && v.trim().length)) {
        selector = selector.filter(
          bemBase
            .clone()
            .setMod(["cid", "" + v])
            .toQuerySelector()
        );
      } else {
        throw new Error(
          `${this.displayName} -- Built-in 'cid' transformation must be a ` +
            `boolean, number or non-blank string but it is '${is(v)}' -- ${v}`
        );
      }
    } else if ("idx" === n) {
      if (is.integer(v) && v >= 0) {
        /*
         * NOTE: Don't use `Selector.nth()` because it doesn't work properly,
         * namely, when you try to call `nth()` later, for example, in
         * following transformation, selector would be reset to state
         * before `nth()` call in 'idx' transformation. Perhaps this is a
         * bug, but tested only in TestCafe '0.16.2'. This misbehavior was
         * discovered first time in '060-specs-composition' tests.
         *
         * THIS WOULD NOT WORK PROPERLY!!!
         * selector = selector.nth(v);
         */
        selector = selector.filter((_, idx) => idx === v, { v });
      } else {
        throw new Error(
          `${this.displayName} -- Built-in 'idx' transformation must be an ` +
            `integer greater than or equal zero but it is '${is(v)}' -- ${v}`
        );
      }
    }

    return selector;
  }

  /**
   * Asserts that page object is found in specified parent at specified index.
   *
   * @param parent Parent page object
   * @param idx Position at which this page object must be found in parent to pass assertion. Must be an integer greater or equal zero
   * @param [options] Options
   * @param [options.equalityCheck] Same as in {@link PageObject#expectIsEqual}
   */
  async expectIndexInParentIs(
    parent: PageObject,
    idx: number,
    options?: {
      equalityCheck?: (l: PageObject, r: PageObject) => Promise<void>;
    }
  ) {
    if (!(is.integer(idx) && idx >= 0)) {
      throw new Error(
        `'idx' of ${this.displayName} must be an integer greater or equal ` +
          `zero but it is ${idx}`
      );
    }

    const pageObjectAtIdx = new (this.constructor as typeof PageObject)(
      parent,
      ["idx", idx]
    );
    await this.expectIsEqual(pageObjectAtIdx, options);
  }
}

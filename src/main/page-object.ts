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
    selectorTransformationAlias: SelectorTransformationAlias & {
      cid: string;
      idx: number;
    },
    selector: Selector,
    bemBase: BemBase
  ): Selector {
    const requestedTransformations = Object.keys(selectorTransformationAlias);

    // Handle 'cid' (component id) transformation.
    if (requestedTransformations.includes("cid")) {
      const v = selectorTransformationAlias.cid;

      if (is.string(v) && v.trim().length) {
        selector = selector.filter(
          bemBase
            .clone()
            .setMod(["cid", v])
            .toQuerySelector()
        );
      } else {
        throw new Error(
          `${this.displayName} -- Built-in 'cid' transformation must be a ` +
            `non-blank string but it is '${is(v)}' -- ${v}`
        );
      }
    }

    // Handle 'idx' transformation. It respects 'cid' transformation and so
    // applied after it.
    if (requestedTransformations.includes("idx")) {
      const v = selectorTransformationAlias.idx;

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
}

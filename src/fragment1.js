import _ from 'lodash';

import BaseFragment from './base-fragment';
import utils from './utils';

const BaseClass = BaseFragment.makeFragmentClass(BaseFragment, {
  stateParts: [
    ['cid', { isBoolean: false }],
    ['cns', { isBoolean: false }]
  ]
});

class Fragment extends BaseClass {

  /**
   * Transforms fragment's selector.
   * 
   * NOTE: Don't use `this.selector` here because that cause infinite loop!!!
   * TODO: Maybe add a guard that `this.selector` doesn't used or unbind `this`
   *       in `#_transformSelector()`?
   * 
   * @param {Object} transformations A transformations to apply. Each key:value pair is a transformation
   * @param {Selector} selector Selector to transform
   * @param {BemBase} bemBase Fragment's BEM base
   */
  transformSelector(transformations, selector, bemBase) {
    const requestedTransformations = _
      .chain(transformations)
      .keys()
      .filter(_.has)
      .value();

    // TODO Need to find a way to obtain list of all available transformations
    //      in fragment's hierarchy first. Maybe it can be passed as fourth
    //      argument or method like `Fragment#getPartsOfState()` can be used.
    // const unsupportedTransformationsNames = _.filter(
    //   requestedTransformations,
    //   (v) => !_.includes(['cid', 'cns', 'idx'], v)
    // );
    // 
    // if (!_.isEmpty(unsupportedTransformationsNames)) {
    //   throw new TypeError(
    //     `${this.displayName}#transformSelector(): unsupported ` +
    //     `transformation(-s) '${unsupportedTransformationsNames}'`
    //   );
    // }

    // Handle 'cns' (component namespace) transformation.
    if (_.includes(requestedTransformations, 'cns')) {
      const v = transformations.cns;

      // TODO Use `isNonBlankString`
      if (!utils.isNonEmptyString(v)) {
        throw new TypeError(
          `${this.displayName}#transformSelector(): Built-in 'cns' ` +
          `transformation must be a non-empty string but it is ` +
          `${typeOf(v)} (${v})`
        );
      }

      selector = selector
        .filter(`.${bemBase.setMod(['cns', v], { fresh: true })}`);
    }

    // Handle 'cid' (component id) transformation.
    if (_.includes(requestedTransformations, 'cid')) {
      const v = transformations.cid;

      // TODO Use `isNonBlankString`
      if (!utils.isNonEmptyString(v)) {
        throw new TypeError(
          `${this.displayName}#transformSelector(): Built-in 'cid'  ` +
          `transformation must be a non-empty string but it is ` +
          `${typeOf(v)} (${v})`
        );
      }

      selector = selector
        .filter(`.${bemBase.setMod(['cid', v], { fresh: true })}`);
    }

    // Handle 'idx' transformation. It respects 'cns' and 'cid' transformations
    //  and so applied after them.
    if (_.includes(requestedTransformations, 'idx')) {
      const v = transformations.idx;

      if (_.isInteger(v) && v >= 0) {
        /*
         * NOTE Don't use `Selector.nth()` because it doesn't work properly,
         * namely, when you try to call `nth()` later, for example, in
         * following transformation, selector would be reseted to state
         * before `nth()` call in 'idx' transformation. Perhaps this is a
         * bug, but tested only in TestCafe '0.16.2'. This misbehavior was
         * discovered first time in '060-specs-composition' tests.
         *
         * THIS WOULD NOT WORK PROPERLY!!!
         * selector = selector.nth(v);
         */
        selector = selector
          .filter((_, idx) => idx === v, { v });
      }
      else {
        throw new TypeError(
          `${this.displayName}#transformSelector(): Built-in 'idx' ` +
          `transformation must be an integer greater than or equal zero ` +
          `but it is ${typeOf(v)} (${v})`
        );
      }
    }

    return selector;
  }
}

Object.defineProperties(Fragment, {
  displayName: {
    value: 'Fragment'
  }
});

export default Fragment;

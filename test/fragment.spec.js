import _ from 'lodash';
import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import {Fragment} from '../src';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

describe("constructor()", function () {
  it("should save `opts` argument under `_originalOpts` instance property", function () {
    const opts = {bemBase: 'a-widget'};
    const fragment = new Fragment(null, opts);
    expect(fragment._originalOpts === opts, 'to be true');
  });

  it("should save `spec` argument under `_originalSpec` instance property", function () {
    const spec = {cid: 'foo'};
    const fragment = new Fragment(spec, {bemBase: 'a-widget'});
    expect(fragment._originalSpec === spec, 'to be true');
  });

  it("should save initialized version of `opts` argument under `_opts` instance property", function () {
    const selectorCustomizer = () => null;
    const opts = {bemBase: 'a-widget', selectorCustomizer};
    const fragment = new Fragment(null, opts);
    expect(fragment._opts, 'to only have keys', ['bemBase']);
    expect(fragment._opts.bemBase.toBemObject(), 'to equal', {blk: 'a-widget', elt: null, mod: null});
  });

  it("should save initialized version of `spec` argument under `_spec` instance property", function () {
    const spec = {idx: 42};
    const fragment = new Fragment(spec, {bemBase: 'a-widget'});
    expect(fragment._spec === spec, 'to be true');
  });

  it("should have instance of BemBase initialized with BEM base saved under `_bemBase` instance property", function () {
    const fragment = new Fragment(null, {bemBase: 'a-widget'});
    expect(fragment._bemBase.toBemString(), 'to equal', 'a-widget');
  });

  it("should throw error when `spec` argument is not a nil or plain object", function () {
    expect(
      () => new Fragment('foo'),
      'to throw',
      new TypeError(
        "Fragment.constructor(): 'spec' argument must be a nil or a plain object but it is String (foo)"
      )
    );
  });

  it("should throw error when `opts` argument is not a nil or of type Options", function () {
    expect(
      () => new Fragment(null, 42),
      'to throw',
      new TypeError(
        "Fragment.constructor(): 'opts' argument must be a nil or of type Options but it is Number (42)"
      )
    );
  });

  it("should throw error when fragment is created from base fragment class and without BEM base passed in `opts.bemBase`", function () {
    expect(
      () => new Fragment(),
      'to throw',
      new TypeError(
        "'Fragment' fragment was created without BEM base"
      )
    );
  });

  it("should throw error when fragment is created from derived fragment class and without BEM base set on derived fragment class or passed in `opts.bemBase`", function () {
    class MyFragment extends Fragment {
      // My fragment.
    }

    Object.defineProperties(MyFragment, {
      displayName: {
        value: 'MyFragment'
      }
    });

    expect(
      () => new MyFragment(),
      'to throw',
      new TypeError(
        "'MyFragment' fragment was created without BEM base"
      )
    );
  });

  it("should throw error when `spec.cns` argument is set to value other then non-empty string", function () {
    expect(
      () => new Fragment({cns: 42}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Built-in 'cns' spec must be a non-empty string but it is Number (42)"
      )
    );
  });

  it("should throw error when `spec.custom` argument is set to value other then function", function () {
    expect(
      () => new Fragment({custom: 42}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Built-in 'custom' spec must be a function but it is Number (42)"
      )
    );
  });

  it("should throw error when `spec.cid` argument is set to value other then non-empty string", function () {
    expect(
      () => new Fragment({cid: 42}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Built-in 'cid' spec must be a non-empty string but it is Number (42)"
      )
    );
  });

  it("should throw error when `spec.cid` argument is set to value other then non-empty string", function () {
    expect(
      () => new Fragment({cid: 42}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Built-in 'cid' spec must be a non-empty string but it is Number (42)"
      )
    );
  });

  it("should throw error when `spec.idx` argument is set to value other then zero or positive integer", function () {
    expect(
      () => new Fragment({idx: '1'}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Built-in 'idx' spec must be an integer greater than or equal zero but it is String (1)"
      )
    );
    expect(
      () => new Fragment({idx: -1}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Built-in 'idx' spec must be an integer greater than or equal zero but it is Number (-1)"
      )
    );
    expect(
      () => new Fragment({idx: 2.5}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Built-in 'idx' spec must be an integer greater than or equal zero but it is Number (2.5)"
      )
    );
  });

  it("should throw error when `spec` argument has not supported specs defined", function () {
    expect(
      () => new Fragment({some: 'thing', other: 'thing'}, {bemBase: 'a-widget'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): Not supported spec(-s) given: some, other"
      )
    );
  });

  it("should have store for persisted states saved under `_persistedStates` instance property and initialized with empty plain object", function () {
    const fragment = new Fragment(null, {bemBase: 'a-widget'});
    expect(fragment._persistedStates, 'to equal', {});
  });

  it("should have initialized TestCafe selector saved under `selector` instance property", function () {
    const fragment = new Fragment(null, {bemBase: 'a-widget'});
    expect(fragment.selector, 'to be ok');
  });

  it("should throw error when `opts.selectorCustomizer` argument is set to value other than function", function () {
    expect(
      () => new Fragment(null, {bemBase: 'a-widget', selectorCustomizer: 'foo'}),
      'to throw',
      new TypeError(
        "Fragment.constructor(): 'opts.selectorCustomizer' argument must be a function but it is String (foo)"
      )
    );
  });

  it("should call `opts.selectorInitializer` argument, when it is a function, with passed in initialized selector, spec and opts, and use its return value as new selector", function () {
    const selectorCustomizerResult = {};
    const opts = {bemBase: 'a-widget'};
    const spec = {cid: 'foo'};
    const selectorCustomizer = (initializedSelector, initializedSpec, initializedOpts) => {
      expect(initializedSelector, 'to be a function');
      expect(initializedSpec, 'to equal', spec);
      expect(initializedOpts, 'to only have keys', ['bemBase']);
      expect(initializedOpts.bemBase.toBemString(), 'to equal', 'a-widget');
      return selectorCustomizerResult;
    };
    const selectorCustomizerSpy = sinon.spy(selectorCustomizer);
    const inst = new Fragment(spec, _.assign({}, opts, {selectorCustomizer: selectorCustomizerSpy}));
    expect(selectorCustomizerSpy, 'was called times', 1);
    expect(inst.selector === selectorCustomizerResult, 'to be true');
  });
});

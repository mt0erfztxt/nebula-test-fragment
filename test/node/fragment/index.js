import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import Fragment from '../../../src/fragment';
import Options from '../../../src/options';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

describe("Fragment", function() {
  describe("constructor()", function() {
    it("010 should throw error when `spec` argument is not a nil or plain object", function() {
      expect(
        () => new Fragment('foo'),
        'to throw',
        new TypeError(
          "Fragment.constructor(): 'spec' argument must be a nil or a plain object but it is String (foo)"
        )
      );
    });

    it("020 should throw error when `opts` argument is not a nil or of type Options", function() {
      expect(
        () => new Fragment(null, 42),
        'to throw',
        new TypeError(
          "Fragment.constructor(): invalid 'opts' argument - 'Options.constructor()': 'initializer' " +
          "argument must be a nil, a plain object, or of type Options but it is Number (42)"
        )
      );
    });

    it("030 should save `opts` argument under `_originalOpts` instance property", function() {
      const opts = { bemBase: 'a-widget' };
      const fragment = new Fragment(null, opts);
      expect(fragment._originalOpts === opts, 'to be true');
    });

    it("040 should save `spec` argument under `_originalSpec` instance property", function() {
      const spec = { cid: 'foo' };
      const fragment = new Fragment(spec, { bemBase: 'a-widget' });
      expect(fragment._originalSpec === spec, 'to be true');
    });

    it("050 should throw error when fragment is created from base fragment class and without BEM base passed in `opts.bemBase`", function() {
      expect(
        () => new Fragment(),
        'to throw',
        new TypeError(
          "'Fragment' fragment was created without BEM base"
        )
      );
    });

    it("060 should throw error when fragment is created from derived fragment class and without BEM base set on derived fragment class or passed in `opts.bemBase`", function() {
      class MyFragment extends Fragment {}

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

    it("070 should save initialized version of `opts` argument under `_opts` instance property", function() {
      const opts = { bemBase: 'a-widget' };
      const fragment = new Fragment(null, opts);
      expect(fragment._opts, 'to only have keys', ['bemBase']);
      expect(fragment._opts.bemBase.toBemObject(), 'to equal', { blk: 'a-widget', elt: null, mod: null });
    });

    it("080 should save initialized version of `spec` argument under `_spec` instance property", function() {
      const spec = { idx: 42 };
      const fragment = new Fragment(spec, { bemBase: 'a-widget' });
      expect(fragment._spec !== spec, 'to be true');
      expect(fragment._spec, 'to equal', spec);
    });

    it("090 should have instance of BemBase initialized with BEM base saved under `_bemBase` instance property", function() {
      const fragment = new Fragment(null, { bemBase: 'a-widget' });
      expect(fragment._bemBase.toBemString(), 'to equal', 'a-widget');
    });

    it("100 should have store for persisted states saved under `_persistedStates` instance property and initialized with empty plain object", function() {
      const fragment = new Fragment(null, { bemBase: 'a-widget' });
      expect(fragment._persistedStates, 'to equal', {});
    });

    it("110 should throw error when `spec.cns` argument is set to value other then non-empty string", function() {
      expect(
        () => new Fragment({ cns: 42 }, { bemBase: 'a-widget' }),
        'to throw',
        new TypeError(
          "Fragment.constructor(): Built-in 'cns' spec must be a non-empty string but it is Number (42)"
        )
      );
    });

    it("120 should throw error when `spec.cid` argument is set to value other then non-empty string", function() {
      expect(
        () => new Fragment({ cid: 42 }, { bemBase: 'a-widget' }),
        'to throw',
        new TypeError(
          "Fragment.constructor(): Built-in 'cid' spec must be a non-empty string but it is Number (42)"
        )
      );
    });

    it("130 should throw error when `spec.cid` argument is set to value other then non-empty string", function() {
      expect(
        () => new Fragment({ cid: 42 }, { bemBase: 'a-widget' }),
        'to throw',
        new TypeError(
          "Fragment.constructor(): Built-in 'cid' spec must be a non-empty string but it is Number (42)"
        )
      );
    });

    it("140 should throw error when `spec.idx` argument is set to value other then integer gte 0", function() {
      expect(
        () => new Fragment({ idx: '1' }, { bemBase: 'a-widget' }),
        'to throw',
        new TypeError(
          "Fragment.constructor(): Built-in 'idx' spec must be an integer greater than or equal zero but it is String (1)"
        )
      );
      expect(
        () => new Fragment({ idx: 2.5 }, { bemBase: 'a-widget' }),
        'to throw',
        new TypeError(
          "Fragment.constructor(): Built-in 'idx' spec must be an integer greater than or equal zero but it is Number (2.5)"
        )
      );
      expect(
        () => new Fragment({ idx: -1 }, { bemBase: 'a-widget' }),
        'to throw',
        new TypeError(
          "Fragment.constructor(): Built-in 'idx' spec must be an integer greater than or equal zero but it is Number (-1)"
        )
      );
    });

    it("150 should throw error when `spec.custom` argument is set to value other then function", function() {
      expect(
        () => new Fragment({ custom: 42 }, { bemBase: 'a-widget' }),
        'to throw',
        new TypeError(
          "Fragment.constructor(): Built-in 'custom' spec must be a function but it is Number (42)"
        )
      );
    });

    it("160 should call `spec.custom` argument, when it is a function, with selector, initialized spec and initialized opts, and use its return value as new selector", function() {
      const customSpecResult = {};
      const opts = { bemBase: 'a-widget', option1: 1 };
      const spec = {};
      const customSpec = (selector, initializedSpec, initializedOpts) => {
        expect(selector, 'to be ok');
        expect(initializedSpec, 'to equal', spec);
        expect(initializedOpts, 'to only have keys', ['bemBase', 'option1']);
        expect(initializedOpts.bemBase.toBemString(), 'to equal', 'a-widget');
        expect(initializedOpts.option1, 'to equal', 1);
        return customSpecResult;
      };
      const customSpecSpy = sinon.spy(customSpec);
      spec.custom = customSpecSpy;
      const inst = new Fragment(spec, opts);
      expect(customSpecSpy, 'was called times', 1);
      expect(inst.selector === customSpecResult, 'to be true');
    });

    it("180 should have initialized TestCafe selector saved under `selector` instance property", function() {
      const fragment = new Fragment(null, { bemBase: 'a-widget' });
      expect(fragment.selector, 'to be ok');
    });
  });

  describe(".initializeFragmentSpecAndOpts()", function() {
    class FragmentA extends Fragment {}

    Object.defineProperties(FragmentA, {
      bemBase: {
        value: 'fragment-a'
      },
      displayName: {
        value: 'FragmentA'
      }
    });

    class FragmentB extends Fragment {
      constructor(spec, opts) {
        const { initializedOpts, initializedSpec, isInstance } = FragmentB.initializeFragmentSpecAndOpts(spec, opts);

        if (isInstance === true) {
          return spec;
        }

        super(initializedSpec, initializedOpts);
        return this;
      }
    }

    Object.defineProperties(FragmentB, {
      bemBase: {
        value: 'fragment-b'
      },
      displayName: {
        value: 'FragmentB'
      }
    });

    it("010 should return plain object with `isInstance` attribute set to `true` when 'spec' argument is already an instance of fragment that must be constructed", function() {
      const instOfB = new FragmentB();
      expect(FragmentB.initializeFragmentSpecAndOpts(instOfB, null), 'to equal', { isInstance: true });
    });

    it("020 should throw error when 'spec' argument is already an instance of fragment but other than that must be constructed", function() {
      const instOfA = new FragmentA();
      expect(
        () => FragmentB.initializeFragmentSpecAndOpts(instOfA, null),
        'to throw',
        new TypeError(
          "'spec' argument can not be an instance of fragment other than FragmentB"
        )
      );
    });

    it("030 should throw error when 'opts' argument is not nil or of type Options", function() {
      expect(
        () => FragmentB.initializeFragmentSpecAndOpts(null, 'opts'),
        'to throw',
        new TypeError(
          "'Options.constructor()': 'initializer' argument must be a nil, a plain object, or of " +
          "type Options but it is String (opts)"
        )
      );
    });

    it("040 should throw error when 'defaults' argument is not a nil or plain object", function() {
      expect(
        () => FragmentB.initializeFragmentSpecAndOpts(null, null, 'defaults'),
        'to throw',
        new TypeError(
          "'defaults' argument must be a nil or a plain object but it is String (defaults)"
        )
      );
    });

    it("050 should throw error when 'defaults.spec' argument is not a nil or plain object", function() {
      expect(
        () => FragmentB.initializeFragmentSpecAndOpts(null, null, { spec: 'spec' }),
        'to throw',
        new TypeError(
          "'defaults.spec' argument must be a nil or a plain object but it is String (spec)"
        )
      );
    });

    it("060 should throw error when 'defaults.opts' argument is not a nil or plain object", function() {
      expect(
        () => FragmentB.initializeFragmentSpecAndOpts(null, null, { opts: 'opts' }),
        'to throw',
        new TypeError(
          "'defaults.opts' argument must be a nil or a plain object but it is String (opts)"
        )
      );
    });

    it("070 should apply spec defaults", function() {
      const spec = { cid: 'qwerty' };
      const defaults = { spec: { cns: 'foo', cid: 'foobar' } };
      const result = FragmentB.initializeFragmentSpecAndOpts(spec, void(0), defaults);
      expect(result, 'to equal', { initializedSpec: { cid: 'qwerty', cns: 'foo' }, initializedOpts: new Options({}) });
      expect(result.initializedSpec !== spec, 'to be true');
    });

    it("080 should apply opts defaults", function() {
      const opts = { option1: 1 };
      const spec = { cid: 'qwerty' };
      const defaults = { opts: { bemBase: 'my-widget', option1: 2 } };
      const result = FragmentB.initializeFragmentSpecAndOpts(spec, opts, defaults);
      expect(result, 'to equal', {
        initializedSpec: { cid: 'qwerty' },
        initializedOpts: new Options({ bemBase: 'my-widget', option1: 1 })
      });
      expect(result.initializedOpts !== opts, 'to be true');
      expect(result.initializedSpec !== spec, 'to be true');
    });
  });
});

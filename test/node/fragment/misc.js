import unexpected from 'unexpected';

import {Fragment} from '../../../src';

const expect = unexpected.clone();

describe("Fragment", function () {
  describe(".isFragment getter", function () {
    it("should return `true`", function () {
      class MyFragment extends Fragment {
      }

      expect(Fragment.isFragment, 'to be true');
      expect(MyFragment.isFragment, 'to be true');
    });
  });

  describe("#bemBase getter", function () {
    it("should return fragment's BEM base instance", function () {
      const fragment = new Fragment(null, {bemBase: 'foo'});
      expect(fragment.bemBase === fragment._bemBase, 'to be true');
    });
  });

  describe("#displayName getter", function () {
    class Foo extends Fragment {
    }

    Object.defineProperties(Foo, {
      bemBase: {
        value: 'foo'
      },
      displayName: {
        value: 'Foo'
      }
    });

    class BarFoo extends Foo {

    }

    Object.defineProperties(BarFoo, {
      bemBase: {
        value: 'barFoo'
      }
    });

    it("should return fragment's display name from fragment's class when it set", function () {
      const foo = new Foo();

      expect(foo.displayName, 'to equal', 'Foo');
    });

    it("should return fragment's display name from fragment's parent class otherwise", function () {
      const barFoo = new BarFoo();

      expect(barFoo.displayName, 'to equal', 'Foo');
    });
  });

  describe("#opts getter", function () {
    it("should return fragment's initialized options", function () {
      const fragment = new Fragment(null, {bemBase: 'foo'});
      expect(fragment.opts === fragment._opts, 'to be true');
    });
  });

  describe("#selector getter", function () {
    it("should return fragment's selector", function () {
      const fragment = new Fragment(null, {bemBase: 'foo'});
      expect(fragment.selector === fragment._selector, 'to be true');
    });
  });

  describe("#spec getter", function () {
    it("should return fragment's initialized specification", function () {
      const fragment = new Fragment({cid: 'bar'}, {bemBase: 'foo'});
      expect(fragment.spec === fragment._spec, 'to be true');
    });
  });

  describe("#cloneBemBase()", function () {
    it("should return new instance of BEM base initialized with fragment's BEM base", function () {
      const fragment = new Fragment(null, {bemBase: 'bar'});
      const clonedBemBase = fragment.cloneBemBase();
      expect(clonedBemBase.toString(), 'to equal', 'bar');
      expect(clonedBemBase.isFinal, 'to be false');
      expect(clonedBemBase.isFrozen, 'to be false');
    });
  });

  describe("#getSomething()", function () {
    class Bar extends Fragment {
    }

    Object.defineProperties(Bar, {
      bemBase: {
        value: 'bar'
      },
      displayName: {
        value: 'Bar'
      }
    });

    class Foo extends Fragment {
    }

    Object.defineProperties(Foo, {
      bemBase: {
        value: 'foo'
      },
      displayName: {
        value: 'Foo'
      },
      BarFragment: {
        value: Bar
      }
    });

    class NotFragment {
    }

    it("should throw error when `FragmentOfSomething` is not a fragment class", function () {
      const foo = new Foo();

      expect(
        () => foo.getSomething(null),
        'to throw',
        new TypeError("'FragmentOfSomething' argument must be a fragment class but it is #Null (null)")
      );

      expect(
        () => foo.getSomething(NotFragment),
        'to throw',
        new TypeError("'FragmentOfSomething' argument must be a fragment class but it is Function (class NotFragment {})")
      );
    });

    it("should throw error when `specOfSomething` already an instance of `Fragment`", function () {
      const bar = new Bar();
      const foo = new Foo();

      expect(
        () => foo.getSomething(Bar, bar),
        'to throw',
        new TypeError("'specOfSomething' argument is a 'Bar' fragment but it must be a fragment specification or nil")
      );
    });

    it("should return new fragment of something and set parent specification by default to this fragment", function () {
      const barOpts = {};
      const barSpec = {};

      const foo = new Foo();

      /**
       *
       * @type {Bar}
       */
      const bar = foo.getSomething(Bar, barSpec, barOpts);

      expect(bar, 'to be a', Bar);
      expect(bar.spec.parent === foo.selector, 'to be true');
    });

    it("should allow parent of new fragment to be set in `specOfSomething` argument", function () {
      const barParent = '.parent';
      const barOpts = {};
      const barSpec = {parent: barParent};

      const foo = new Foo();

      /**
       *
       * @type {Bar}
       */
      const bar = foo.getSomething(Bar, barSpec, barOpts);

      expect(bar, 'to be a', Bar);
      expect(bar.spec.parent === barParent, 'to be true');
    });
  });

  describe("#getSomethingFragment()", function () {
    class Fiz extends Fragment {
    }

    Object.defineProperties(Fiz, {
      bemBase: {
        value: 'fiz'
      },
      displayName: {
        value: 'Fiz'
      }
    });

    class Buz1 extends Fragment {
    }

    Object.defineProperties(Buz1, {
      bemBase: {
        value: 'buz1'
      },
      displayName: {
        value: 'Buz1'
      }
    });

    class Buz2 extends Fragment {
    }

    Object.defineProperties(Buz2, {
      bemBase: {
        value: 'buz2'
      },
      displayName: {
        value: 'Buz2'
      }
    });

    class Das extends Fragment {
    }

    Object.defineProperties(Das, {
      bemBase: {
        value: 'das'
      },
      displayName: {
        value: 'Das'
      }
    });

    class FooParent extends Fragment {
    }

    Object.defineProperties(FooParent, {
      bemBase: {
        value: 'fooParent'
      },
      DasFragment: {
        value: Das
      },
      displayName: {
        value: 'FooParent'
      }
    });

    class Foo extends Fragment {
    }

    Object.defineProperties(Foo, {
      bemBase: {
        value: 'foo'
      },
      displayName: {
        value: 'Foo'
      },
      FizFragment: {
        value: Fiz
      }
    });

    class Bar extends Foo {
    }

    Object.defineProperties(Bar, {
      bemBase: {
        value: 'bar'
      },
      BuzFragment: {
        value: Buz1
      },
      displayName: {
        value: 'Bar'
      }
    });

    it("should check fragment's `opts` first", function () {
      const bar = new Bar(null, {BuzFragment: Buz2});
      expect(bar.getSomethingFragment('Buz', Foo) === Buz2, 'to be true');
    });

    it("should check fragment's `constructor` second", function () {
      const bar = new Bar();
      expect(bar.getSomethingFragment('Buz', Foo) === Buz1, 'to be true');
    });

    it("should check fragment's parent third", function () {
      const bar = new Bar();
      expect(bar.getSomethingFragment('Fiz', Foo) === Fiz, 'to be true');
    });

    it("should not bubble up in fragment hierarchy upper than `RootFragmentOfSomething`", function () {
      const bar = new Bar();
      expect(
        () => bar.getSomethingFragment('Das', Foo),
        'to throw',
        new TypeError("'DasFragment' must be a fragment class but it is #Undefined (undefined)")
      );
    });
  });
});

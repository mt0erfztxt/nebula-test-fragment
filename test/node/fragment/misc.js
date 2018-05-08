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
      const foo = new Foo();
      const barFoo = new BarFoo();

      expect(barFoo.displayName, 'to equal', 'Foo');
    });
  });

  describe("#selector getter", function () {
    it("should return fragment's selector", function () {
      const fragment = new Fragment(null, {bemBase: 'foo'});
      expect(fragment.selector === fragment._selector, 'to be true');
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
});

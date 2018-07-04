import sinon from 'sinon';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';

import bem from '../../src/bem';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

describe("bem", function () {
  describe("isBemName()", () => {
    it("should exist and be a function", () => {
      expect(bem.isBemName, 'to be a', 'function');
    });

    it("should return `false` when `value` argument is not a string", () => {
      expect(bem.isBemName(42), 'to be', false);
    });

    it("should return `false` when `value` argument is not a string that starts with a letter", () => {
      expect(bem.isBemName('1'), 'to be', false);
    });

    it("should return `false` when `value` argument is not a string that ends with a letter or a digit", () => {
      expect(bem.isBemName('a1-'), 'to be', false);
    });

    it("should return `false` when `value` argument is a string but not an alpha-numeric-dashed string", () => {
      expect(bem.isBemName('a__1'), 'to be', false);
      expect(bem.isBemName('a@1'), 'to be', false);
    });

    it("should return `false` when `value` argument is an alpha-numeric-dashed string but have sibling dashes", () => {
      expect(bem.isBemName('some--thing'), 'to be', false);
    });

    it("should return `true` when `value` argument meet all criteria of valid BEM name", () => {
      expect(bem.isBemName('name'), 'to be', true);
      expect(bem.isBemName('name-with-dashes'), 'to be', true);
      expect(bem.isBemName('name-that-ends-with-digit-1'), 'to be', true);
    });
  });

  describe("isBemValue()", () => {
    it("should exist and be a function", () => {
      expect(bem.isBemValue, 'to be a', 'function');
    });

    it("should return `false` when `value` argument is not a string", () => {
      expect(bem.isBemValue(42), 'to be', false);
    });

    it("should return `false` when `value` argument is not a string that ends with a letter or a digit", () => {
      expect(bem.isBemValue('a1-'), 'to be', false);
    });

    it("should return `false` when `value` is a string but not an alpha-numeric-dashed string", () => {
      expect(bem.isBemValue('a__1'), 'to be', false);
      expect(bem.isBemValue('a@1'), 'to be', false);
    });

    it("should return `false` when `value` argument is an alpha-numeric-dashed string but have sibling dashes", () => {
      expect(bem.isBemValue('some--thing'), 'to be', false);
    });

    it("should return `true` when `value` argument meet all criteria of valid BEM name", () => {
      expect(bem.isBemValue('1'), 'to be', true);
      expect(bem.isBemValue('value'), 'to be', true);
      expect(bem.isBemValue('value-with-dashes'), 'to be', true);
      expect(bem.isBemValue('value-that-ends-with-digit-1'), 'to be', true);
      expect(bem.isBemValue('2-value-that-ends-with-digit'), 'to be', true);
    });
  });

  describe("isBemBlock()", function () {
    let isBemNameSpy;

    before(function () {
      isBemNameSpy = sinon.spy(bem, 'isBemName');
    });

    after(function () {
      isBemNameSpy.restore();
    });

    it("should pass `value` argument to `isBemName()` and return its result", function () {
      bem.isBemBlock('foo');
      expect(
        isBemNameSpy,
        'to have a call satisfying',
        {
          args: ['foo'],
          returnValue: true
        });
    });
  });

  describe("isBemElement()", function () {
    let isBemNameSpy;

    before(function () {
      isBemNameSpy = sinon.spy(bem, 'isBemName');
    });

    after(function () {
      isBemNameSpy.restore();
    });

    it("should pass `value` argument to `isBemName()` and return its result", function () {
      bem.isBemElement('bar');
      expect(
        isBemNameSpy,
        'to have a call satisfying',
        {
          args: ['bar'],
          returnValue: true
        }
      );
    });
  });

  describe("isBemModifierName()", function () {
    let isBemNameSpy;

    before(function () {
      isBemNameSpy = sinon.spy(bem, 'isBemName');
    });

    after(function () {
      isBemNameSpy.restore();
    });

    it("should pass `value` argument to `isBemName()` and return its result", function () {
      bem.isBemModifierName('fiz');
      expect(
        isBemNameSpy,
        'to have a call satisfying',
        {
          args: ['fiz'],
          returnValue: true
        }
      );
    });
  });

  describe("isBemModifierValue()", function () {
    let isBemValueSpy;

    before(function () {
      isBemValueSpy = sinon.spy(bem, 'isBemValue');
    });

    after(function () {
      isBemValueSpy.restore();
    });

    it("should pass `value` argument to `isBemValue()` and return its result", function () {
      bem.isBemModifierValue('buz');
      expect(
        isBemValueSpy,
        'to have a call satisfying',
        {
          args: ['buz'],
          returnValue: true
        }
      );
    });
  });

  describe("isBemModifier()", function () {
    it("should return `false` when `value` argument is not an array", function () {
      expect(bem.isBemModifier('fiz'), 'to be false');
    });

    it("should return `false` when `value` argument is an array but its first element is not a BEM name", function () {
      expect(bem.isBemModifier([1]), 'to be false');
    });

    it("should return `false` when `value` argument is an array but its second element is not a nil or a BEM value", function () {
      expect(bem.isBemModifier(['fiz', 1]), 'to be false');
      expect(bem.isBemModifier(['fiz', '']), 'to be false');
      expect(bem.isBemModifier(['fiz', '-buz']), 'to be false');
      expect(bem.isBemModifier(['fiz', 'buz-']), 'to be false');
    });

    it("should return `true` when `value` argument is a BEM modifier", function () {
      expect(bem.isBemModifier(['fiz']), 'to be true');
      expect(bem.isBemModifier(['fiz', void(0)]), 'to be true');
      expect(bem.isBemModifier(['fiz', null]), 'to be true');
      expect(bem.isBemModifier(['fiz', '1']), 'to be true');
      expect(bem.isBemModifier(['fiz', 'buz']), 'to be true');
    });
  });

  describe("checkIsBemObject()", () => {
    it("should exist and be a function", () => {
      expect(bem.checkIsBemObject, 'to be a', 'function');
    });

    it("should throw error when `value` argument is not a plain object", () => {
      expect(
        () => bem.checkIsBemObject(42),
        'to throw',
        "'value' argument must be a plain object but it is Number (42)"
      );
    });

    it("should throw error when `value` argument is an empty plain object", () => {
      expect(
        () => bem.checkIsBemObject({}),
        'to throw',
        "BEM object can not be empty"
      );
    });

    it("should throw error when BEM block is not valid BEM name", () => {
      expect(
        () => bem.checkIsBemObject({blk: true}),
        'to throw',
        "Required 'blk' attribute of BEM object must be a valid BEM name but it is Boolean (true)"
      );
    });

    it("should throw error when optional BEM element is not valid BEM name", () => {
      expect(
        () => bem.checkIsBemObject({blk: 'blk', elt: 101}),
        'to throw',
        "Optional 'elt' attribute of BEM object must be a valid BEM name but it is Number (101)"
      );
    });

    it("should throw error when optional BEM modifier is not an array of required valid BEM name and optional BEM value", () => {
      expect(
        () => bem.checkIsBemObject({blk: 'blk', mod: 101}),
        'to throw',
        "Optional 'mod' attribute of BEM object must be an array of required valid BEM name and optional BEM value but it is Number (101)"
      );
      expect(
        () => bem.checkIsBemObject({blk: 'blk', mod: [true]}),
        'to throw',
        "Required name element of 'mod' attribute array of BEM object must be a BEM name but it is Boolean (true)"
      );
      expect(
        () => bem.checkIsBemObject({blk: 'blk', mod: ['mod', false]}),
        'to throw',
        "Optional value element of 'mod' attribute array of BEM object must be a BEM value but it is Boolean (false)"
      );
    });

    it("should return `value` argument when it is a valid BEM object", () => {
      const blk = {blk: 'blk'};
      const blkElt = {blk: 'blk', elt: 'elt'};
      const blkEltMod1 = {blk: 'blk', elt: 'elt', mod: ['modNam']};
      const blkEltMod2 = {blk: 'blk', elt: 'elt', mod: ['modNam', 'modVal']};
      expect(bem.checkIsBemObject(blk), 'to equal', blk);
      expect(bem.checkIsBemObject(blkElt), 'to equal', blkElt);
      expect(bem.checkIsBemObject(blkEltMod1), 'to equal', blkEltMod1);
      expect(bem.checkIsBemObject(blkEltMod2), 'to equal', blkEltMod2);
    });
  });

  describe("IsBemObject()", function () {
    it("should return `true` when `value` argument is a BEM object", function () {
      expect(bem.isBemObject({blk: 'foo'}), 'to be true');
      expect(bem.isBemObject({blk: 'foo', elt: 'bar'}), 'to be true');
      expect(bem.isBemObject({blk: 'foo', elt: 'bar', mod: ['fiz', 'buz']}), 'to be true');
    });

    it("should return `false` when `value` argument is not a BEM object", function () {
      expect(bem.isBemObject(1), 'to be false');
      expect(bem.isBemObject('foo'), 'to be false');
      expect(bem.isBemObject({some: 'thing'}), 'to be false');
    });
  });

  describe("checkIsBemString()", () => {
    it("should exist and be a function", () => {
      expect(bem.checkIsBemString, 'to be a', 'function');
    });

    it("should throw error when `value` argument is not a string", () => {
      expect(
        () => bem.checkIsBemString(42),
        'to throw',
        "BEM string must be a string but it is Number (42)"
      );
    });

    it("should throw error when `value` argument is an empty string", () => {
      expect(
        () => bem.checkIsBemString(''),
        'to throw',
        "BEM string can't be empty"
      );
    });

    it("should throw error when `value` argument have more than one BEM modifier", () => {
      expect(
        () => bem.checkIsBemString('blk--mod1--mod2_2'),
        'to throw',
        "BEM string can have only one modifier but it has 2 of them (mod1, mod2_2)"
      );
    });

    it("should throw error when `value` argument have more than one value for BEM modifier", () => {
      expect(
        () => bem.checkIsBemString('blk--mod_a_b'),
        'to throw',
        "BEM modifier can have only one value but it has 2 of them (a, b)"
      );
    });

    it("should throw error when `value` argument have BEM modifier which have is not valid BEM name", () => {
      expect(
        () => bem.checkIsBemString('blk--mod@name_val'),
        'to throw',
        "BEM modifier name must be a valid BEM name but it is String (mod@name)"
      );
    });

    it("should not throw error when `value` argument have BEM modifier which have no value", () => {
      expect(() => bem.checkIsBemString('blk--mod'), 'not to throw');
    });

    it("should throw error when `value` argument have BEM modifier which have non-nil value and that value is not valid BEM value", () => {
      expect(
        () => bem.checkIsBemString('blk--mod-name_val-'),
        'to throw',
        "BEM modifier value is optional or must be a BEM value but it is String (val-)"
      );
    });

    it("should throw error when `value`argument have more than one BEM element", () => {
      expect(
        () => bem.checkIsBemString('blk__elt1__elt2__elt3'),
        'to throw',
        "BEM string can have only one element but it has 3 of them (elt1, elt2, elt3)"
      );
    });

    it("should throw error when `value` argument have BEM element which is not valid BEM name", () => {
      expect(
        () => bem.checkIsBemString('blk__elt2-'),
        'to throw',
        "BEM element must be a BEM value but it is String (elt2-)"
      );
    });

    it("should throw error when `value` argument have BEM block which is not valid BEM name", () => {
      expect(
        () => bem.checkIsBemString('blk-'),
        'to throw',
        "BEM block must be a BEM name but it is String (blk-)"
      );
      expect(
        () => bem.checkIsBemString('1blk'),
        'to throw',
        "BEM block must be a BEM name but it is String (1blk)"
      );
      expect(
        () => bem.checkIsBemString('blk_1'),
        'to throw',
        "BEM block must be a BEM name but it is String (blk_1)"
      );
    });

    it("should return `value` argument when it is a valid BEM string", () => {
      const blk = 'blk';
      const blkElt = 'blk__elt';
      const blkEltMod1 = 'blk--mod';
      const blkEltMod2 = 'blk__elt--mod';
      const blkEltMod3 = 'blk--mod-name_mod-value';
      const blkEltMod4 = 'blk__elt--mod-name_mod-value';
      expect(bem.checkIsBemString(blk), 'to equal', blk);
      expect(bem.checkIsBemString(blkElt), 'to equal', blkElt);
      expect(bem.checkIsBemString(blkEltMod1), 'to equal', blkEltMod1);
      expect(bem.checkIsBemString(blkEltMod2), 'to equal', blkEltMod2);
      expect(bem.checkIsBemString(blkEltMod3), 'to equal', blkEltMod3);
      expect(bem.checkIsBemString(blkEltMod4), 'to equal', blkEltMod4);
    });
  });

  describe("isBemString()", function () {
    it("should return `true` when `value` argument is a BEM string", function () {
      expect(bem.isBemString('foo'), 'to be true');
      expect(bem.isBemString('foo__bar'), 'to be true');
      expect(bem.isBemString('foo__bar--fiz_buz'), 'to be true');
    });

    it("should return `false` when `value` argument is not a BEM string", function () {
      expect(bem.isBemString(''), 'to be false');
      expect(bem.isBemString(1), 'to be false');
      expect(bem.isBemString('1'), 'to be false');
      expect(bem.isBemString({}), 'to be false');
    });
  });

  describe("checkIsBemVector()", () => {
    it("should exist and be a function", () => {
      expect(bem.checkIsBemVector, 'to be a', 'function');
    });

    it("should throw error when `value` argument is not an array", () => {
      expect(
        () => bem.checkIsBemVector(42),
        'to throw',
        "BEM vector must be an array but it is Number (42)"
      );
    });

    it("should throw error when `value` argument is an empty array", () => {
      expect(
        () => bem.checkIsBemVector([]),
        'to throw',
        "BEM vector can't be empty"
      );
    });

    it("should throw error when required first element (BEM block) of `value` argument array is not a valid BEM name", () => {
      expect(
        () => bem.checkIsBemVector([2]),
        'to throw',
        "Required first element (block) of BEM vector must be a valid BEM name but it is Number (2)"
      );
      expect(
        () => bem.checkIsBemVector(['']),
        'to throw',
        "Required first element (block) of BEM vector must be a valid BEM name but it is String ()"
      );
      expect(
        () => bem.checkIsBemVector(['1']),
        'to throw',
        "Required first element (block) of BEM vector must be a valid BEM name but it is String (1)"
      );
      expect(
        () => bem.checkIsBemVector(['a-']),
        'to throw',
        "Required first element (block) of BEM vector must be a valid BEM name but it is String (a-)"
      );
    });

    it("should throw error when optional second element (BEM element) of `value` argument array is not a valid BEM name", () => {
      expect(
        () => bem.checkIsBemVector(['blk', 2]),
        'to throw',
        "Optional second element (element) of BEM vector must be a valid BEM name but it is Number (2)"
      );
      expect(
        () => bem.checkIsBemVector(['blk', '']),
        'to throw',
        "Optional second element (element) of BEM vector must be a valid BEM name but it is String ()"
      );
      expect(
        () => bem.checkIsBemVector(['blk', '1']),
        'to throw',
        "Optional second element (element) of BEM vector must be a valid BEM name but it is String (1)"
      );
      expect(
        () => bem.checkIsBemVector(['blk', 'a-']),
        'to throw',
        "Optional second element (element) of BEM vector must be a valid BEM name but it is String (a-)"
      );
    });

    it("should throw error when optional third element (BEM modifier) of `value` argument array is not an array", () => {
      expect(
        () => bem.checkIsBemVector(['blk', null, 2]),
        'to throw',
        "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional value but it is Number (2)"
      );
      expect(
        () => bem.checkIsBemVector(['blk', 'elt', '']),
        'to throw',
        "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional value but it is String ()"
      );
      expect(
        () => bem.checkIsBemVector(['blk', null, '1']),
        'to throw',
        "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional value but it is String (1)"
      );
      expect(
        () => bem.checkIsBemVector(['blk', 'a-']),
        'to throw',
        "Optional second element (element) of BEM vector must be a valid BEM name but it is String (a-)"
      );
    });

    it("should throw error when first element (name) of optional third element (BEM modifier) of `value` argument array is not valid BEM name", () => {
      expect(
        () => bem.checkIsBemVector(['blk', null, ['']]),
        'to throw',
        "Required first (name) element of optional third element (modifier) of BEM vector must be a BEM name but it is String ()"
      );
      expect(() => bem.checkIsBemVector(['blk', null, ['aaa']]), 'not to throw');
    });

    it("should throw error when second element (value) of optional third element (BEM modifier) of `value` argument array is not valid BEM value", () => {
      expect(
        () => bem.checkIsBemVector(['blk', null, ['foo', '_bar']]),
        'to throw',
        "Optional second (value) element of optional third element (modifier) of BEM vector must be a BEM value but it is String (_bar)"
      );
      expect(() => bem.checkIsBemVector(['blk', null, ['foo', 'bar']]), 'not to throw');
      expect(() => bem.checkIsBemVector(['blk', null, ['foo', null]]), 'not to throw');
      expect(() => bem.checkIsBemVector(['blk', null, ['foo', void(0)]]), 'not to throw');
    });

    it("should return `value` argument when it is a valid BEM vector", () => {
      const blk = ['blk'];
      const blkElt = ['blk', 'elt'];
      const blkEltMod1 = ['blk', 'mod'];
      const blkEltMod2 = ['blk', 'elt', ['mod']];
      const blkEltMod3 = ['blk', null, ['mod-name', 'mod-value']];
      const blkEltMod4 = ['blk', 'elt', ['mod-name', 'mod-value']];
      expect(bem.checkIsBemVector(blk), 'to equal', blk);
      expect(bem.checkIsBemVector(blkElt), 'to equal', blkElt);
      expect(bem.checkIsBemVector(blkEltMod1), 'to equal', blkEltMod1);
      expect(bem.checkIsBemVector(blkEltMod2), 'to equal', blkEltMod2);
      expect(bem.checkIsBemVector(blkEltMod3), 'to equal', blkEltMod3);
      expect(bem.checkIsBemVector(blkEltMod4), 'to equal', blkEltMod4);
    });
  });

  describe("isBemVector()", function () {
    it("should return `true` when `value` argument is a BEM vector", function () {
      expect(bem.isBemVector(['foo']), 'to be true');
      expect(bem.isBemVector(['foo', 'bar']), 'to be true');
      expect(bem.isBemVector(['foo', 'bar', ['fiz', 'buz']]), 'to be true');
    });

    it("should return `false` when `value` argument is not a BEM vector", function () {
      expect(bem.isBemVector(1), 'to be false');
      expect(bem.isBemVector('foo'), 'to be false');
      expect(bem.isBemVector([]), 'to be false');
    });
  });

  describe("checkIsBemStructure()", function () {
    it("should return `value` argument as-is when it's a BEM base", function () {
      const inst = new bem.BemBase('foo');
      expect(bem.checkIsBemStructure(inst) === inst, 'to be true');
    });

    it("should throw error when `value` argument is not a plain object, string or an array", function () {
      expect(
        () => bem.checkIsBemStructure(1),
        'to throw',
        new TypeError(
          "'value' argument must be a BEM base, object, string or vector but it is Number (1)"
        )
      );
    });
  });

  describe("toBemObject()", function () {
    it("should convert BEM base to BEM object", function () {
      expect(
        bem.toBemObject(new bem.BemBase('foo')),
        'to equal',
        {
          blk: 'foo',
          elt: null,
          mod: null
        }
      );
    });

    it("should convert BEM vector to BEM object", function () {
      expect(bem.toBemObject(['foo']), 'to equal', {blk: 'foo'});
      expect(bem.toBemObject(['foo', 'bar']), 'to equal', {blk: 'foo', elt: 'bar'});
      expect(bem.toBemObject(['foo', 'bar', ['baz']]), 'to equal', {blk: 'foo', elt: 'bar', mod: ['baz']});
      expect(bem.toBemObject(['foo', 'bar', ['fiz', 'buz']]), 'to equal', {
        blk: 'foo',
        elt: 'bar',
        mod: ['fiz', 'buz']
      });
    });
  });

  describe("toBemString()", function () {
    it("should convert BEM base to BEM string", function () {
      expect(bem.toBemString(new bem.BemBase('foo')), 'to equal', 'foo');
    });

    it("should convert BEM vector to BEM string", function () {
      expect(bem.toBemString(['foo']), 'to equal', 'foo');
      expect(bem.toBemString(['foo', 'bar']), 'to equal', 'foo__bar');
      expect(bem.toBemString(['foo', 'bar', ['baz']]), 'to equal', 'foo__bar--baz');
      expect(bem.toBemString(['foo', 'bar', ['fiz', 'buz']]), 'to equal', 'foo__bar--fiz_buz');
    });

    it("should return `value` argument as-is when it is already a BEM string", function () {
      expect(bem.toBemString('foo'), 'to equal', 'foo');
    });
  });

  describe("toBemVector()", function () {
    it("should convert BEM base to BEM vector", function () {
      expect(bem.toBemVector(new bem.BemBase('foo--bar')), 'to equal', ['foo', null, ['bar']]);
    });

    it("should return `value` argument as-is when it is already a BEM vector", function () {
      const value = ['foo', 'bar'];
      expect(bem.toBemVector(value) === value, 'to be true');
    });
  });

  describe("BemBase class", () => {
    describe("#blk getter", function () {
      it("should return block of instance", function () {
        expect(new bem.BemBase('foo').blk, 'to equal', 'foo');
      });
    });

    describe("#blk setter", function () {
      it("should set block of instance", function () {
        const inst = new bem.BemBase('foo');
        inst.blk = 'bar';
        expect(inst.blk, 'to equal', 'bar');
      });

      it("should throw error when trying to set block to nil or not BEM name", function () {
        expect(
          () => (new bem.BemBase('foo')).blk = void(0),
          'to throw',
          new TypeError(
            "Required 'blk' attribute of BEM object must be a valid BEM name but it is #Undefined (undefined)"
          )
        );
        expect(
          () => (new bem.BemBase('foo')).blk = null,
          'to throw',
          new TypeError(
            "Required 'blk' attribute of BEM object must be a valid BEM name but it is #Null (null)"
          )
        );
        expect(
          () => (new bem.BemBase('foo')).blk = 1,
          'to throw',
          new TypeError(
            "Required 'blk' attribute of BEM object must be a valid BEM name but it is Number (1)"
          )
        );
        expect(
          () => (new bem.BemBase('foo')).blk = '1',
          'to throw',
          new TypeError(
            "Required 'blk' attribute of BEM object must be a valid BEM name but it is String (1)"
          )
        );
      });
    });

    describe("#elt getter", function () {
      it("should return element of instance", function () {
        expect(new bem.BemBase('foo__bar').elt, 'to equal', 'bar');
      });
    });

    describe("#elt setter", function () {
      it("should set block of instance", function () {
        const inst = new bem.BemBase('foo');

        inst.elt = 'bar';
        expect(inst.elt, 'to equal', 'bar');

        inst.elt = void(0);
        expect(inst.elt, 'to be null');

        inst.elt = null;
        expect(inst.elt, 'to be null');
      });

      it("should throw error when trying to set element to not BEM name", function () {
        expect(
          () => (new bem.BemBase('foo__bar')).elt = 1,
          'to throw',
          new TypeError(
            "Optional 'elt' attribute of BEM object must be a valid BEM name but it is Number (1)"
          )
        );
        expect(
          () => (new bem.BemBase('foo__bar')).elt = '1',
          'to throw',
          new TypeError(
            "Optional 'elt' attribute of BEM object must be a valid BEM name but it is String (1)"
          )
        );
      });
    });

    describe("#isFinal getter", function () {
      it("should return 'final' state of instance", function () {
        expect(new bem.BemBase('foo', {isFinal: false}).isFinal, 'to be false');
        expect(new bem.BemBase('foo', {isFinal: true}).isFinal, 'to be true');
      });
    });

    describe("#isFrozen getter", function () {
      it("should return 'frozen' state of instance", function () {
        expect(new bem.BemBase('foo', {isFrozen: false}).isFrozen, 'to be false');
        expect(new bem.BemBase('foo', {isFrozen: true}).isFrozen, 'to be true');
        expect(new bem.BemBase('foo', {isFinal: true, isFrozen: false}).isFrozen, 'to be true');
      });
    });

    describe("#mod getter", function () {
      it("should return modifier of instance", function () {
        expect(new bem.BemBase('foo__bar--biz').mod, 'to equal', ['biz']);
        expect(new bem.BemBase('foo--biz_101').mod, 'to equal', ['biz', '101']);
      });
    });

    describe("#mod setter", function () {
      it("should set modifier of instance", function () {
        const inst = new bem.BemBase('foo');

        expect(inst.mod, 'to be null');

        inst.mod = 'zip';
        expect(inst.mod, 'to equal', ['zip']);

        inst.mod = ['bar'];
        expect(inst.mod, 'to equal', ['bar']);

        inst.mod = ['fiz', 'buz'];
        expect(inst.mod, 'to equal', ['fiz', 'buz']);

        inst.mod = void(0);
        expect(inst.mod, 'to be null');

        inst.mod = null;
        expect(inst.mod, 'to be null');
      });

      it("should throw error when trying to set modifier to not valid value", function () {
        expect(
          () => (new bem.BemBase('foo__bar')).mod = 1,
          'to throw',
          new TypeError(
            "Required name element of 'mod' attribute array of BEM object must be a BEM name but it is Number (1)"
          )
        );
        expect(
          () => (new bem.BemBase('foo__bar')).mod = '1',
          'to throw',
          new TypeError(
            "Required name element of 'mod' attribute array of BEM object must be a BEM name but it is String (1)"
          )
        );
      });
    });

    describe("#_throwWhenIsFinal()", () => {
      it("should exist and be a function", () => {
        expect(new bem.BemBase('foo', {isFinal: true})._throwWhenIsFinal, 'to be a', 'function');
      });

      it("should throw error when instance is final", () => {
        expect(
          () => new bem.BemBase('foo', {isFinal: true})._throwWhenIsFinal(),
          'to throw',
          "Instance is final and can't be changed"
        )
      });

      it("should return instance for chaining otherwise", () => {
        const inst = new bem.BemBase('foo', {isFinal: false});
        expect(inst._throwWhenIsFinal(), 'to equal', inst);
      });
    });

    describe("#_throwWhenIsFrozen()", () => {
      it("should exist and be a function", () => {
        expect(new bem.BemBase('foo', {isFinal: true})._throwWhenIsFrozen, 'to be a', 'function');
      });

      it("should throw when instance is frozen", () => {
        expect(
          () => new bem.BemBase('foo', {isFrozen: true})._throwWhenIsFrozen(),
          'to throw',
          "Instance is frozen and can not be changed"
        );
      });

      it("should return instance for chaining otherwise", () => {
        const inst = new bem.BemBase('foo', {isFrozen: false});
        expect(inst._throwWhenIsFrozen(), 'to equal', inst);
      });
    });

    describe("#freeze()", () => {
      it("should exist and be a function", () => {
        expect(new bem.BemBase('foo').freeze, 'to be a', 'function');
      });

      it("should change instance's 'isFrozen' state to true and return instance for chaining", () => {
        const inst1 = new bem.BemBase('foo', {isFrozen: false});
        const inst2 = new bem.BemBase('foo', {isFrozen: true});

        expect(inst1._isFrozen, 'to be false');
        expect(inst2._isFrozen, 'to be true');

        expect(inst1.freeze(), 'to equal', inst1);
        expect(inst2.freeze(), 'to equal', inst2);

        expect(inst1._isFrozen, 'to be true');
        expect(inst2._isFrozen, 'to be true');
      });
    });

    describe("#unfreeze()", () => {
      it("should exist and be a function", () => {
        expect(new bem.BemBase('foo').unfreeze, 'to be a', 'function');
      });

      it("should throw when instance is final", () => {
        expect(
          () => new bem.BemBase('foo', {isFinal: true}).unfreeze(),
          'to throw',
          "Instance is frozen and that can not be undone because it is also final"
        );
      });

      it("should change instance's 'isFrozen' state to false and return instance for chaining", () => {
        const inst1 = new bem.BemBase('foo', {isFrozen: false});
        const inst2 = new bem.BemBase('foo', {isFrozen: true});

        expect(inst1._isFrozen, 'to be false');
        expect(inst2._isFrozen, 'to be true');

        expect(inst1.unfreeze(), 'to equal', inst1);
        expect(inst2.unfreeze(), 'to equal', inst2);

        expect(inst1._isFrozen, 'to be false');
        expect(inst2._isFrozen, 'to be false');
      });
    });

    describe("#setBlk()", function () {
      it("should throw error when `options` argument is not valid", function () {
        expect(
          () => new bem.BemBase('foo').setBlk('bar', false),
          'to throw',
          new TypeError("'initializer' argument must be a nil, a plain object, or of type Options but it is Boolean (false)")
        );
      });

      it("should throw error when instance is frozen and `options.fresh` argument is falsey", function () {
        expect(
          () => new bem.BemBase('foo', {isFrozen: true}).setBlk('bar', {fresh: false}),
          'to throw',
          new TypeError("Instance is frozen and can not be changed")
        );
      });

      it("should set block of instance to `value` argument and return instance for chaining", function () {
        const inst = new bem.BemBase('foo');
        const passedInValue = 'bar';
        expect(inst.blk, 'to equal', 'foo');
        expect(inst.setBlk(passedInValue) === inst, 'to be true');
        expect(inst.blk, 'to equal', passedInValue);
      });

      it("should return clone of instance with block set to `value` argument when `options.fresh` argument is truthy", function () {
        const inst = new bem.BemBase('foo');
        const passedInValue = 'bar';
        const newInst = inst.setBlk(passedInValue, {fresh: true});
        expect(newInst !== inst, 'to be true');
        expect(newInst.blk, 'to equal', passedInValue);
      });
    });

    describe("#setElt()", function () {
      it("should throw error when `options` argument is not valid", function () {
        expect(
          () => new bem.BemBase('foo').setElt('bar', false),
          'to throw',
          new TypeError("'initializer' argument must be a nil, a plain object, or of type Options but it is Boolean (false)")
        );
      });

      it("should throw error when instance is frozen and `options.fresh` argument is falsey", function () {
        expect(
          () => new bem.BemBase('foo', {isFrozen: true}).setElt('bar', {fresh: false}),
          'to throw',
          new TypeError("Instance is frozen and can not be changed")
        );
      });

      it("should set element of instance to `value` argument and return instance for chaining", function () {
        const inst = new bem.BemBase('foo__bar');
        const passedInValue = 'baz';
        expect(inst.elt, 'to equal', 'bar');
        expect(inst.setElt(passedInValue) === inst, 'to be true');
        expect(inst.elt, 'to equal', passedInValue);
      });

      it("should return clone of instance with element set to `value` argument when `options.fresh` argument is truthy", function () {
        const inst = new bem.BemBase('foo__bar');
        const passedInValue = 'baz';
        const newInst = inst.setElt(passedInValue, {fresh: true});
        expect(newInst !== inst, 'to be true');
        expect(newInst.elt, 'to equal', passedInValue);
      });
    });

    describe("#setMod()", function () {
      it("should throw error when `options` argument is not valid", function () {
        expect(
          () => new bem.BemBase('foo').setMod(['buzzed'], false),
          'to throw',
          new TypeError("'initializer' argument must be a nil, a plain object, or of type Options but it is Boolean (false)")
        );
      });

      it("should throw error when instance is frozen and `options.fresh` argument is falsey", function () {
        expect(
          () => new bem.BemBase('foo', {isFrozen: true}).setMod(['bazzed'], {fresh: false}),
          'to throw',
          new TypeError("Instance is frozen and can not be changed")
        );
      });

      it("should set modifier of instance to `value` argument and return instance for chaining", function () {
        const inst = new bem.BemBase('foo--bar');
        const passedInValue = ['baz'];
        expect(inst.mod, 'to equal', ['bar']);
        expect(inst.setMod(passedInValue) === inst, 'to be true');
        expect(inst.mod, 'to equal', passedInValue);
      });

      it("should return clone of instance with modifier set to `value` argument when `options.fresh` argument is truthy", function () {
        const inst = new bem.BemBase('foo__bar--baz');
        const passedInValue = ['biz'];
        const newInst = inst.setMod(passedInValue, {fresh: true});
        expect(newInst !== inst, 'to be true');
        expect(newInst.mod, 'to equal', passedInValue);
      });
    });

    describe("#toBemObject()", function () {
      it("should return correct BEM object", function () {
        expect(
          new bem.BemBase('foo').toBemObject(),
          'to equal',
          {blk: 'foo', elt: null, mod: null}
        );
        expect(
          new bem.BemBase('foo__bar').toBemObject(),
          'to equal',
          {blk: 'foo', elt: 'bar', mod: null}
        );
        expect(
          new bem.BemBase('foo__bar--baz').toBemObject(),
          'to equal',
          {blk: 'foo', elt: 'bar', mod: ['baz']}
        );
        expect(
          new bem.BemBase('foo__bar--baz_1').toBemObject(),
          'to equal',
          {blk: 'foo', elt: 'bar', mod: ['baz', '1']}
        );
      });
    });

    describe("#toBemString()", function () {
      it("should return correct BEM string", function () {
        expect(
          new bem.BemBase('foo').toBemString(),
          'to equal',
          'foo'
        );
        expect(
          new bem.BemBase('foo__bar').toBemString(),
          'to equal',
          'foo__bar'
        );
        expect(
          new bem.BemBase('foo__bar--baz').toBemString(),
          'to equal',
          'foo__bar--baz'
        );
        expect(
          new bem.BemBase('foo__bar--baz_1').toBemString(),
          'to equal',
          'foo__bar--baz_1'
        );
      });
    });

    describe("#toBemString()", function () {
      it("should return correct BEM string", function () {
        expect(
          new bem.BemBase('foo').toBemString(),
          'to equal',
          'foo'
        );
        expect(
          new bem.BemBase('foo__bar').toBemString(),
          'to equal',
          'foo__bar'
        );
        expect(
          new bem.BemBase('foo__bar--baz').toBemString(),
          'to equal',
          'foo__bar--baz'
        );
        expect(
          new bem.BemBase('foo__bar--baz_1').toBemString(),
          'to equal',
          'foo__bar--baz_1'
        );
      });
    });

    describe("#toBemVector()", function () {
      it("should return correct BEM vector", function () {
        expect(
          new bem.BemBase('foo').toBemVector(),
          'to equal',
          ['foo', null, null]
        );
        expect(
          new bem.BemBase('foo__bar').toBemVector(),
          'to equal',
          ['foo', 'bar', null]
        );
        expect(
          new bem.BemBase('foo__bar--baz').toBemVector(),
          'to equal',
          ['foo', 'bar', ['baz']]
        );
        expect(
          new bem.BemBase('foo__bar--baz_1').toBemVector(),
          'to equal',
          ['foo', 'bar', ['baz', '1']]
        );
      });
    });

    describe("#toString()", function () {
      it("should pass `value` argument to `#toBemString()` and return its result", function () {
        const inst = new bem.BemBase('foo__bar--baz');
        const toStringSpy = sinon.spy(inst, 'toBemString');
        inst.toString();
        expect(
          toStringSpy,
          'to have a call satisfying',
          {
            args: [],
            returnValue: 'foo__bar--baz'
          }
        );
      });
    });
  });
});

import expect from 'unexpected';

import BemBase from '../src/bem-base';

describe('BemBase class', function () {
  describe('_checkBemObj() validates passed in `value`', function () {
    it('should exist and be a function', function () {
      expect(BemBase._checkBemObj, 'to be a', 'function');
    });

    it("should throw when `value` argument isn't a POJO", function () {
      expect(function () {
          BemBase._checkBemObj(42);
        }, 'to throw', "BEM object must be a plain object, but Number (42) is given"
      );
    });

    it("should throw when `value` argument is empty POJO", function () {
      expect(function () {
          BemBase._checkBemObj({});
        }, 'to throw', "BEM object can't be empty"
      );
    });

    it("should throw when BEM block is not valid", function () {
      expect(function () {
          BemBase._checkBemObj({blk: true});
        }, 'to throw', "Required 'blk' attribute of BEM object must be a valid BEM name, but Boolean (true) is given"
      );
    });

    it("should throw when optional BEM element is not valid", function () {
      expect(function () {
          BemBase._checkBemObj({blk: 'blk', elt: 101});
        }, 'to throw', "Optional 'elt' attribute of BEM object must be a valid BEM name, but Number (101) is given"
      );
    });

    it("should throw when optional BEM modifier is not valid", function () {
      expect(function () {
          BemBase._checkBemObj({blk: 'blk', mod: 101});
        }, 'to throw', "Optional 'mod' attribute of BEM object must be an array of required valid BEM name and optional value, but Number (101) is given"
      );
      expect(function () {
          BemBase._checkBemObj({blk: 'blk', mod: [true]});
        }, 'to throw', "Required name element of 'mod' attribute array of BEM object must be a non-empty alpha-numeric-dashed string, but Boolean (true) is given"
      );
      expect(function () {
          BemBase._checkBemObj({blk: 'blk', mod: ['mod', false]});
        }, 'to throw', "Optional value element of 'mod' attribute array of BEM object must be a non-empty alpha-numeric-dashed string, but Boolean (false) is given"
      );
    });

    it("should return `value` when it's a valid BEM object", function () {
      const blk = {blk: 'blk'};
      const blkElt = {blk: 'blk', elt: 'elt'};
      const blkEltMod1 = {blk: 'blk', elt: 'elt', mod: ['modNam']};
      const blkEltMod2 = {blk: 'blk', elt: 'elt', mod: ['modNam', 'modVal']};

      expect(BemBase._checkBemObj(blk), 'to equal', blk);
      expect(BemBase._checkBemObj(blkElt), 'to equal', blkElt);
      expect(BemBase._checkBemObj(blkEltMod1), 'to equal', blkEltMod1);
      expect(BemBase._checkBemObj(blkEltMod2), 'to equal', blkEltMod2);
    });
  });

  describe('_checkBemStr() validates passed in `value`', function () {
    it('should exist and be a function', function () {
      expect(BemBase._checkBemStr, 'to be a', 'function');
    });

    it("should throw when `value` argument isn't a string", function () {
      expect(function () {
          BemBase._checkBemStr(42);
        }, 'to throw', "BEM string must be a string, but Number (42) is given"
      );
    });

    it("should throw when `value` argument is empty string", function () {
      expect(function () {
          BemBase._checkBemStr('');
        }, 'to throw', "BEM string can't be empty"
      );
    });

    it("should throw when `value` have more than one BEM modifier", function () {
      expect(function () {
          BemBase._checkBemStr('blk--mod1--mod2_2');
        }, 'to throw', "BEM string can have only one modifier, but it has 2 of them (mod1, mod2_2)"
      );
    });

    it("should throw when `value` have more than one value for BEM modifier", function () {
      expect(function () {
          BemBase._checkBemStr('blk--mod_a_b');
        }, 'to throw', "BEM modifier can have only one value, but it has 2 of them (a, b)"
      );
    });

    it("should throw when `value` have BEM modifier which have is not valid BEM name", function () {
      expect(function () {
          BemBase._checkBemStr('blk--mod@name_val');
        }, 'to throw', "BEM modifier name must be a valid BEM name, but String (mod@name) is given"
      );
    });

    it("should not throw when `value` have BEM modifier which have no value", function () {
      expect(function () {
          BemBase._checkBemStr('blk--mod');
        }, 'not to throw'
      );
    });

    it("should throw when `value` have BEM modifier which have non-nil value and that value is not valid BEM value", function () {
      expect(function () {
          BemBase._checkBemStr('blk--mod-name_val-');
        }, 'to throw', "BEM modifier value is optional or must be a non-empty alpha-numeric-dashed string, but String (val-) is given"
      );
    });

    it("should throw when `value` have more than one BEM element", function () {
      expect(function () {
          BemBase._checkBemStr('blk__elt1__elt2__elt3');
        }, 'to throw', "BEM string can have only one element, but it has 3 of them (elt1, elt2, elt3)"
      );
    });

    it("should throw when `value` have BEM element which have is not valid BEM name", function () {
      expect(function () {
          BemBase._checkBemStr('blk__elt2-');
        }, 'to throw', "BEM element name must be a non-empty alpha-numeric-dashed string, but String (elt2-) is given"
      );
    });

    it("should throw when `value` have BEM block which have is not valid BEM name", function () {
      expect(function () {
          BemBase._checkBemStr('blk-');
        }, 'to throw', "BEM block name must be a non-empty alpha-numeric-dashed string, but String (blk-) is given"
      );
      expect(function () {
          BemBase._checkBemStr('1blk');
        }, 'to throw', "BEM block name must be a non-empty alpha-numeric-dashed string, but String (1blk) is given"
      );
      expect(function () {
          BemBase._checkBemStr('blk_1');
        }, 'to throw', "BEM block name must be a non-empty alpha-numeric-dashed string, but String (blk_1) is given"
      );
    });

    it("should return `value` when it's a valid BEM string", function () {
      const blk = 'blk';
      const blkElt = 'blk__elt';
      const blkEltMod1 = 'blk--mod';
      const blkEltMod2 = 'blk__elt--mod';
      const blkEltMod3 = 'blk--mod-name_mod-value';
      const blkEltMod4 = 'blk__elt--mod-name_mod-value';

      expect(BemBase._checkBemStr(blk), 'to equal', blk);
      expect(BemBase._checkBemStr(blkElt), 'to equal', blkElt);
      expect(BemBase._checkBemStr(blkEltMod1), 'to equal', blkEltMod1);
      expect(BemBase._checkBemStr(blkEltMod2), 'to equal', blkEltMod2);
      expect(BemBase._checkBemStr(blkEltMod3), 'to equal', blkEltMod3);
      expect(BemBase._checkBemStr(blkEltMod4), 'to equal', blkEltMod4);
    });
  });

  describe('_checkBemVec() validates passed in `value`', function () {
    it('should exist and be a function', function () {
      expect(BemBase._checkBemVec, 'to be a', 'function');
    });

    it("should throw when `value` argument isn't an array", function () {
      expect(function () {
          BemBase._checkBemVec(42);
        }, 'to throw', "BEM vector must be an array, but Number (42) is given"
      );
    });

    it("should throw when `value` argument is an empty array", function () {
      expect(function () {
          BemBase._checkBemVec([]);
        }, 'to throw', "BEM vector can't be empty"
      );
    });

    it("should throw when required first element (BEM block) of `value` argument array is not a valid BEM name ", function () {
      expect(function () {
          BemBase._checkBemVec([2]);
        }, 'to throw', "Required first element (block) of BEM vector must be a valid BEM name, but Number (2) is given"
      );
      expect(function () {
          BemBase._checkBemVec(['']);
        }, 'to throw', "Required first element (block) of BEM vector must be a valid BEM name, but String () is given"
      );
      expect(function () {
          BemBase._checkBemVec(['1']);
        }, 'to throw', "Required first element (block) of BEM vector must be a valid BEM name, but String (1) is given"
      );
      expect(function () {
          BemBase._checkBemVec(['a-']);
        }, 'to throw', "Required first element (block) of BEM vector must be a valid BEM name, but String (a-) is given"
      );
    });

    it("should throw when optional second element (BEM element) of `value` argument array is not a valid BEM name", function () {
      expect(function () {
          BemBase._checkBemVec(['blk', 2]);
        }, 'to throw', "Optional second element (element) of BEM vector must be a valid BEM name, but Number (2) is given"
      );
      expect(function () {
          BemBase._checkBemVec(['blk', '']);
        }, 'to throw', "Optional second element (element) of BEM vector must be a valid BEM name, but String () is given"
      );
      expect(function () {
          BemBase._checkBemVec(['blk', '1']);
        }, 'to throw', "Optional second element (element) of BEM vector must be a valid BEM name, but String (1) is given"
      );
      expect(function () {
          BemBase._checkBemVec(['blk', 'a-']);
        }, 'to throw', "Optional second element (element) of BEM vector must be a valid BEM name, but String (a-) is given"
      );
    });

    it("should throw when optional third element (BEM modifier) of `value` argument array is not an array", function () {
      expect(function () {
          BemBase._checkBemVec(['blk', null, 2]);
        }, 'to throw', "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional value, but Number (2) is given"

      );
      expect(function () {
          BemBase._checkBemVec(['blk', 'elt', '']);
        }, 'to throw', "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional value, but String () is given"
      );
      expect(function () {
          BemBase._checkBemVec(['blk', null, '1']);
        }, 'to throw', "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional value, but String (1) is given"

      );
      expect(function () {
          BemBase._checkBemVec(['blk', 'a-']);
        }, 'to throw', "Optional second element (element) of BEM vector must be a valid BEM name, but String (a-) is given"
      );
    });

    it("should return `value` when it's a valid BEM vector", function () {
      const blk = ['blk'];
      const blkElt = ['blk', 'elt'];
      const blkEltMod1 = ['blk', 'mod'];
      const blkEltMod2 = ['blk', 'elt', ['mod']];
      const blkEltMod3 = ['blk', null, ['mod-name', 'mod-value']];
      const blkEltMod4 = ['blk', 'elt', ['mod-name', 'mod-value']];

      expect(BemBase._checkBemVec(blk), 'to equal', blk);
      expect(BemBase._checkBemVec(blkElt), 'to equal', blkElt);
      expect(BemBase._checkBemVec(blkEltMod1), 'to equal', blkEltMod1);
      expect(BemBase._checkBemVec(blkEltMod2), 'to equal', blkEltMod2);
      expect(BemBase._checkBemVec(blkEltMod3), 'to equal', blkEltMod3);
      expect(BemBase._checkBemVec(blkEltMod4), 'to equal', blkEltMod4);
    });
  });

  describe('_isValidBemName() validates passed in `name`', function () {
    it('should exist and be a function', function () {
      expect(BemBase._isValidBemName, 'to be a', 'function');
    });

    it("should return `false` when `name` isn't a string", function () {
      expect(BemBase._isValidBemName(42), 'to be', false);
    });

    it("should return `false` when `name` isn't a string that starts with letter", function () {
      expect(BemBase._isValidBemName('1'), 'to be', false);
    });

    it("should return `false` when `name` isn't a string that ends with letter or digit", function () {
      expect(BemBase._isValidBemName('a1-'), 'to be', false);
    });

    it("should return `false` when `name` is a string but not an alpha-numeric-dashed string", function () {
      expect(BemBase._isValidBemName('a__1'), 'to be', false);
      expect(BemBase._isValidBemName('a@1'), 'to be', false);
    });

    it("should return `false` when `name` is an alpha-numeric-dashed string but have sibling dashes", function () {
      expect(BemBase._isValidBemName('some--thing'), 'to be', false);
    });

    it("should return `true` when `name` meet all criteria of valid BEM name", function () {
      expect(BemBase._isValidBemName('name'), 'to be', true);
      expect(BemBase._isValidBemName('name-with-dashes'), 'to be', true);
      expect(BemBase._isValidBemName('name-that-ends-with-digit-1'), 'to be', true);
    });
  });

  describe('_isValidBemValue() validates passed in `value`', function () {
    it('should exist and be a function', function () {
      expect(BemBase._isValidBemValue, 'to be a', 'function');
    });

    it("should return `false` when `value` isn't a string", function () {
      expect(BemBase._isValidBemValue(42), 'to be', false);
    });

    it("should return `false` when `value` isn't a string that ends with letter or digit", function () {
      expect(BemBase._isValidBemValue('a1-'), 'to be', false);
    });

    it("should return `false` when `value` is a string but not an alpha-numeric-dashed string", function () {
      expect(BemBase._isValidBemValue('a__1'), 'to be', false);
      expect(BemBase._isValidBemValue('a@1'), 'to be', false);
    });

    it("should return `false` when `value` is an alpha-numeric-dashed string but have sibling dashes", function () {
      expect(BemBase._isValidBemValue('some--thing'), 'to be', false);
    });

    it("should return `true` when `value` meet all criteria of valid BEM name", function () {
      expect(BemBase._isValidBemValue('1'), 'to be', true);
      expect(BemBase._isValidBemValue('value'), 'to be', true);
      expect(BemBase._isValidBemValue('value-with-dashes'), 'to be', true);
      expect(BemBase._isValidBemValue('value-that-ends-with-digit-1'), 'to be', true);
    });
  });
});

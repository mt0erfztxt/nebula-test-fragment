import expect from 'unexpected';

import Options from '../../../src/options';

describe("utils.Options", function() {
  describe("constructor()", function() {
    it("010 should return `initializer` argument as is when it's already an instance of Options", function() {
      const options = new Options();
      expect(new Options(options), 'to equal', options);
    });

    it("020 should throw when `initializer` argument is not a nil or a plain object", function() {
      expect(
        () => new Options(42),
        'to throw',
        "'Options.constructor()': 'initializer' argument must be a nil, a plain object, or of type Options but it is Number (42)"
      );
    });

    it("030 should throw when `options` argument is not a nil or a plain object", function() {
      expect(
        () => new Options({}, false),
        'to throw',
        "'Options.constructor()': 'options' argument must be a nil or a plain object but it is Boolean (false)"
      );
    });

    it("040 should throw when `options.defaults` argument is not a nil, a function or a plain object", function() {
      expect(
        () => new Options({}, { defaults: "foo" }),
        'to throw',
        "'Options.constructor()': 'options.defaults' argument must be a nil, a function or a plain object but it is String (foo)"
      );
    });

    it("050 should return Options instance with-out properties when `initializer` argument is a nil", function() {
      const o1 = new Options(void(0));
      expect(o1, 'to be an', Options);
      expect(o1, 'to be empty');

      const o2 = new Options(null);
      expect(o2, 'to be an', Options);
      expect(o2, 'to be empty');
    });

    it("060 should return Options instance with properties from `initializer` argument when it is a plain object", function() {
      const passedInValue = { foo: 'bar' };
      const returnedValue = new Options(passedInValue);

      expect(returnedValue !== passedInValue, 'to be true');
      expect(returnedValue, 'to only have keys', ['foo']);
      expect(returnedValue, 'to have own properties', { foo: 'bar' });
    });

    it("070 should return Options instance with defaults in-place when `option.defaults` argument is a function", function() {
      const defaultsFn = (v, o) => {
        expect(v, 'to equal', { foo: 'bar' });
        expect(o.defaults === defaultsFn, 'to be true');
        return { fiz: 'buz' };
      };
      const o = new Options({ foo: 'bar' }, { defaults: defaultsFn });

      expect(o, 'to only have keys', ['foo', 'fiz']);
      expect(o, 'to have own properties', {
        foo: 'bar',
        fiz: 'buz'
      });
    });

    it("080 should return Options instance with defaults in-place when `option.defaults` argument is a plain object", function() {
      const o = new Options({}, {
        defaults: {
          foo: 1,
          bar: false
        }
      });

      expect(o, 'to only have keys', ['foo', 'bar']);
      expect(o, 'to have own properties', {
        foo: 1,
        bar: false
      });
    });

    it("090 should throw error when 'options.validator' argument is is not a nil or a function", function() {
      expect(
        () => new Options({}, { validator: true }),
        'to throw',
        new TypeError("'Options.constructor()': 'options.validator' argument must be a nil or a function but it is Boolean (true)")
      );
    });

    it("100 should throw error when 'options.validator' argument is a function and validation failed", function() {
      const validator = (r) => {
        expect(r, 'to equal', { foo: 'bar', some: 'thing' });
        return "A validation error message"
      };

      expect(
        () => new Options({ foo: 'bar' }, {
          defaults: { some: 'thing' },
          validator
        }),
        'to throw',
        new TypeError("'Options.constructor()': validation failed with error: A validation error message")
      );
    });

    it("110 should return Options instance when 'options.validator' argument is a function and validation succeeded", function() {
      expect(
        new Options({ foo: 'bar' }, { validator: () => null }),
        (expect
          .it('to be an', Options)
          .and('to only have keys', ['foo'])
          .and('to have own properties', { foo: 'bar' })
        )
      );
    });
  });
});

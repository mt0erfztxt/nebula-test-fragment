import _ from 'lodash';
import typeOf from 'typeof--';

/**
 * Class that represent options.
 */
class Options {

  /**
   * Creates Options instance.
   *
   * @param {*} [initializer] - Initial data for Options instance
   * @param {Object} [options] - Options
   * @param {Object|function} [options.defaults] - Defaults for key-value pairs not provided in `initializer` or a function that accepts `initializer` and `options` and returns such defaults
   * @param {function} [options.validator] - Validates data after application of `options.defaults` but before it would be used to create Options instance. Accepts data and must return `null` in case of successful validation
   * @throws {TypeError} When arguments are not valid or validation failed.
   */
  constructor(initializer, options) {
    if (initializer instanceof Options) {
      return initializer;
    }

    if (!(_.isNil(initializer) || _.isPlainObject(initializer))) {
      throw new TypeError(
        `'initializer' argument must be a nil, a plain object, or of type Options but it is ` +
        `${typeOf(initializer)} (${initializer})`
      );
    }

    if (!(_.isNil(options) || _.isPlainObject(options))) {
      throw new TypeError(
        `'options' argument must be a nil or a plain object but it is ${typeOf(options)} (${options})`
      );
    }

    const opts = options || {};
    const { defaults, validator } = opts;

    if (!(_.isNil(defaults) || _.isPlainObject(defaults) || _.isFunction(defaults))) {
      throw new TypeError(
        `'options.defaults' argument must be a nil, a function or a plain object but it is ` +
        `${typeOf(defaults)} (${defaults})`
      );
    }

    const chosenDefaults = _.isFunction(defaults) ? defaults(initializer, opts) : defaults;
    const result = _.defaults({}, initializer, chosenDefaults);

    if (validator) {
      if (!_.isFunction(validator)) {
        throw new TypeError(
          `'options.validator' argument must be a nil or a function but it is ${typeOf(validator)} (${validator})`
        );
      }

      const validationMessage = validator(result);

      if (!_.isNull(validationMessage)) {
        throw new TypeError(
          `options validation failed with error: ${validationMessage}`
        );
      }
    }

    return _.assign(this, result);
  }
}

export default Options;

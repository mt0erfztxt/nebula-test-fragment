import nodeFs from "fs";
import nodePath from "path";
import Handlebars from "handlebars";
import is from "@sindresorhus/is";
import mkdirp from "mkdirp";
import { camelCase, pascalCase } from "change-case";

/**
 * Type representing configuration for page object generator.
 *
 * @typedef PageObjectGeneratorConfig
 * @type {Object}
 * @property {PageObjectSpec[]} pageObjects A list of page object specs that must be used to generate page objects.
 * @property {string} srcRoot A root directory for generated page objects. Used to calculate imports.
 */

/**
 * Type representing spec for page object generation.
 *
 * @typedef PageObjectSpec
 * @type {Object}
 * @property {string} [bemBase=''] A BEM base for page object.
 * @property {string} [displayName] A display name for page object.
 * @property {string} [extends] A path to page object to extend to.
 * @property {string} path An output path relative to `PageObjectGeneratorConfig.pathPrefix`.
 * @property {PageObjectStatePartSpec[]} [stateParts] A specs for state parts of page object to be generated.
 */

/**
 * Type representing page object's state part spec used in page object
 * generation.
 *
 * @typedef PageObjectStatePartSpec
 * @type {Object}
 * @property {string} [alias] A state part getter name. Used to calculate name of state part getter, `name` property by default.
 * @property {string} [defaultValue] A state part's default value.
 * @property {string} name A state part name.
 * @property {boolean} [simple=true] If `true` only presence of BEM modifier or attribute is checked.
 * @property {string} [src='bemModifier'] The source of state part's value. One of 'bemModifier' or 'attribute'.
 *
 */

/**
 * Generates page objects using specified configuration.
 *
 * @param {PageObjectGeneratorConfig | string} [config='page-object-generator.json'] A page object generator configuration or path to file containing it.
 */
export function generate(config = "page-object-generator.json") {
  const { pageObjects, srcRoot } = is.plainObject(config)
    ? config
    : parseConfig(config);

  pageObjects.forEach(spec => {
    generatePageObject(spec, srcRoot);
  });
}

/**
 * Reads and parses specified configuration file.
 *
 * @param {string} [path='page-objects.json'] A path to configuration file.
 * @returns {PageObjectGeneratorConfig} Returns parsed configuration file.
 * @throws {Error} Throws on invalid input.
 */
function parseConfig(path = "page-objects.json") {
  const cwd = process.cwd();
  const configAbsPath = nodePath.join(cwd, path);

  if (!nodeFs.existsSync(configAbsPath)) {
    throw new Error(
      `Specified configuration file not exists: ${configAbsPath}`
    );
  }

  if (!nodeFs.lstatSync(configAbsPath).isFile()) {
    throw new Error(
      `Specified configuration file can't be parsed: ${configAbsPath}`
    );
  }

  return JSON.parse(nodeFs.readFileSync(configAbsPath, "utf8"));
}

const template = Handlebars.compile(
  nodeFs.readFileSync(
    nodePath.join(__dirname, "page-object-generator.hbs"),
    "utf8"
  )
);

/**
 * Generates page object from spec.
 *
 * @param {PageObjectSpec} pageObjectSpec
 * @param {string} pathPrefix
 */
function generatePageObject(pageObjectSpec, pathPrefix) {
  const { bemBase, displayName, path, stateParts } = pageObjectSpec;
  const cwd = process.cwd();
  const pathParts = path.split("/");
  const isBase = !!(
    pathParts[pathParts.length - 1].match(/^base$/i) && pathParts.pop()
  );
  const className = pascalCase(
    nodePath.basename(pathParts.join("/")) + (isBase ? "Base" : "")
  );
  const isExtends = pageObjectSpec.extends;
  const targetAbsPath = nodePath.join(cwd, pathPrefix, path) + ".js";
  const context = {
    bemBase: is.string(bemBase) ? bemBase : isBase ? "" : camelCase(className),
    exportClassName: className,
    extendsClassName: isExtends
      ? pascalCase(nodePath.basename(pageObjectSpec.extends))
      : "PageObject",
    displayName: displayName || className,
    fromClause: isExtends
      ? nodePath.relative(
          nodePath.dirname(targetAbsPath),
          nodePath.join(cwd, pathPrefix, pageObjectSpec.extends)
        )
      : "nebula-test-fragment",
    stateParts: stateParts.map(({ alias, defaultValue, name, simple, src }) => {
      const isSimple = is.boolean(simple) ? simple : true;
      const statePartJsName = camelCase(alias || name);
      const statePartCommentName = pascalCase(statePartJsName);
      return {
        attribute: name,
        defaultValue,
        getterName: `get${statePartCommentName}`,
        statePartCommentName,
        statePartJsName,
        resultType: isSimple
          ? "boolean"
          : "string" + (is.undefined(defaultValue) ? " | undefined" : ""),
        simple: isSimple,
        src: src || "bemModifier"
      };
    })
  };

  mkdirp.sync(nodePath.dirname(targetAbsPath));
  nodeFs.writeFileSync(targetAbsPath, template(context));
}

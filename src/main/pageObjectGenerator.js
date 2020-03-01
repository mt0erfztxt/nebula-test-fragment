import nodeFs from "fs";
import nodePath from "path";
import glob from "glob";
import Handlebars from "handlebars";
import is from "@sindresorhus/is";
import mkdirp from "mkdirp";
import { camelCase, pascalCase } from "change-case";

/**
 * Type representing configuration for page object generator.
 *
 * @typedef PageObjectGeneratorConfig
 * @type {Object}
 * @property {string} [project] A name of project. Used to calculate BEM base and display name -- prefixes them with `projectName-`.
 * @property {string} srcRoot A root directory for project source files where spec files must be searched.
 */

/**
 * Type representing spec for page object generation.
 *
 * @typedef PageObjectSpec
 * @type {Object}
 * @property {string} [bemBase=''] A BEM base for page object.
 * @property {string} [displayName] A display name for page object.
 * @property {string} [extends] A path to page object to extend to.
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
 */

/**
 * Generates page objects using specified configuration.
 *
 * @param {PageObjectGeneratorConfig | string} [config='page-object-generator.json'] A page object generator configuration or path to file containing it.
 */
export function generate(config = "page-object-generator.json") {
  const parsedConfig = is.plainObject(config) ? config : parseConfig(config);
  glob
    .sync(`**/*.json`, {
      absolute: true,
      cwd: parsedConfig.srcRoot,
      nodir: true,
      strict: true
    })
    .forEach(path =>
      generatePageObject(
        parsedConfig,
        path,
        JSON.parse(nodeFs.readFileSync(path, "utf8"))
      )
    );
}

/**
 * Reads and parses specified configuration file.
 *
 * @param {string} [path='page-object-generator.json'] A path to configuration file.
 * @returns {PageObjectGeneratorConfig} Returns parsed configuration file.
 * @throws {Error} Throws on invalid input.
 */
export function parseConfig(path = "page-object-generator.json") {
  const configAbsPath = nodePath.join(process.cwd(), path);
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
    nodePath.join(__dirname, "pageObjectGenerator.hbs"),
    "utf8"
  )
);

/**
 * Generates page object from spec.
 *
 * @param {PageObjectGeneratorConfig} config A page object generator config.
 * @param {string} specPath An absolute path to page object spec. Used to calculate generated file path.
 * @param {PageObjectSpec} spec A page object spec to be used.
 */
function generatePageObject(config, specPath, spec) {
  if (is.undefined(spec.stateParts)) {
    // Skip invalid spec, e.g. JSON file used for purposes other than page
    // object generation.
    return;
  }

  specPath = specPath.replace(/\.[^/.]+$/, "");
  const { srcRoot, project } = config;
  const { bemBase, displayName, stateParts } = spec;
  const pathParts = specPath.split(nodePath.sep);
  const pathPartsLength = pathParts.length;
  const namePart = pathParts[pathPartsLength - 1];
  const isIndex = namePart === "index";
  const isBase = namePart === "base";

  if (isBase || isIndex) {
    pathParts.pop();
  }

  const className = pascalCase(
    (isBase || isIndex ? pathParts[pathPartsLength - 2] : namePart) +
      (isBase ? "Base" : "")
  );
  const isExtends = spec.extends;
  const targetAbsPath = `${specPath}.js`;
  const bb = is.string(bemBase) ? bemBase : isBase ? "" : camelCase(className);
  const bbPrefix = project ? `${project}-` : "";
  const context = {
    bemBase: is.emptyString(bb) ? bb : `${bbPrefix}${bb}`,
    exportClassName: className,
    extendsClassName: isExtends
      ? pascalCase(nodePath.basename(spec.extends))
      : "PageObject",
    displayName: `${bbPrefix}${displayName || className}`,
    fromClause: isExtends
      ? nodePath.relative(
          nodePath.dirname(targetAbsPath),
          nodePath.join(srcRoot, spec.extends)
        )
      : "nebula-test-fragment/lib/main/pageObject",
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

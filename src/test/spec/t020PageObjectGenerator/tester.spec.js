import nodeFs from "fs";
import nodePath from "path";
import is from "@sindresorhus/is";
import { generate, parseConfig } from "../../../main/page-object-generator";

/**
 * Compares generated and expected files.
 *
 * @param {string} testName A test's name.
 * @param {Object} [options] An options.
 * @param {Object|string} [options.config] An overrides for default config or a path to configuration file.
 * @param {string[]} [options.generatedFilePaths] A list of paths to generated files relative to `src` directory inside test's directory.
 */
function compareFiles(testName, options) {
  const { config, generatedFilePaths = ["textInput/index.js"] } = options || {};
  const testsPathFromProjectRoot = "src/test/spec/t020PageObjectGenerator";
  const testDirAbsPath = nodePath.join(
    process.cwd(),
    testsPathFromProjectRoot,
    testName
  );
  const parsedConfig = is.string(config)
    ? parseConfig(config)
    : Object.assign({ srcRoot: nodePath.join(testDirAbsPath, "src") }, config);
  generate(parsedConfig);
  generatedFilePaths.forEach(path => {
    expect(
      nodeFs.readFileSync(nodePath.join(parsedConfig.srcRoot, path))
    ).toEqual(
      nodeFs.readFileSync(nodePath.join(testDirAbsPath, "expectedSrc", path))
    );
  });
}

describe("Page object generator generates page object module(-s)", () => {
  /**
   * Elements:
   * 1. expectation name
   * 2. test name
   * 3. options (optional):
   *    - config -- overrides for default config of {@link compareFiles}
   *    - generatedFilePaths -- paths to generated files relative to srcRoot
   * @type {(string|Object)[][]}
   */
  const tests = [
    ["010 with default bemBase", "t010BemBaseDefault"],
    ["020 with provided bemBase", "t020BemBaseProvided"],
    ["030 with default extends", "t030ExtendsDefault"],
    ["040 with provided extends", "t040ExtendsProvided"],
    ["050 with default display name", "t050DisplayNameDefault"],
    ["060 with provided display name", "t060DisplayNameProvided"],
    ["070 with default state part alias", "t070StatePartAliasDefault"],
    ["080 with provided state part alias", "t080StatePartAliasProvided"],
    ["090 with provided state part name", "t090StatePartNameProvided"],
    ["100 with default state part simple", "t100StatePartSimpleDefault"],
    ["110 with provided state part simple", "t110StatePartSimpleProvided"],
    ["120 with default state part src", "t120StatePartSrcDefault"],
    ["130 with provided state part src", "t130StatePartSrcProvided"],
    [
      "140 with default state part default value",
      "t140StatePartDefaultValueDefault"
    ],
    [
      "150 with provided state part default value",
      "t150StatePartDefaultValueProvided"
    ],
    ["160 with multiple state parts", "t160MultipleStatePartsProvided"],
    [
      "180 with module named 'base'",
      "t180ModuleName",
      { generatedFilePaths: ["textInput/base.js"] }
    ],
    ["190 with default project name", "t190ProjectNameDefault"],
    [
      "200 with provided project name",
      "t200ProjectNameProvided",
      { config: { project: "myProject" } }
    ],
    [
      "210 for multiple files",
      "t210MultipleFiles",
      {
        generatedFilePaths: [
          "bar/base.js",
          "foo/index.js",
          "textInput/index.js"
        ]
      }
    ],
    [
      "220 using specified configuration file",
      "t220ConfigurationFile",
      {
        config:
          "src/test/spec/t020PageObjectGenerator/t220ConfigurationFile/config.json"
      }
    ]
  ];

  for (const [expectation, testName, options] of tests) {
    it(expectation, () => {
      compareFiles(testName, options);
    });
  }
});

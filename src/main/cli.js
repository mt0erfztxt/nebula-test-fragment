#!/usr/bin/env node

import { generate } from "./page-object-generator";

/**
 * Provided argument must be a path to configuration file from project root and
 * by default it is 'page-object-generator.json'.
 *
 * @todo: Add tests.
 */
generate(process.argv[2]);

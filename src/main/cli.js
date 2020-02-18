#!/usr/bin/env node

import { generate } from "./page-object-generator";

// TODO: Add tests (see src/test/spec/020-page-object-generator/170-cli).
generate(process.argv[2]);

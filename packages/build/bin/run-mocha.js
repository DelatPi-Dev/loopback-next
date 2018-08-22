#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-mocha

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');

  // Substitute the dist variable with the dist folder
  const dist = utils.getDistribution();
  const mochaOpts = argv.slice(2).map(a => a.replace(/\bDIST\b/g, dist));

  const setMochaOpts =
    !utils.isOptionSet(
      mochaOpts,
      '--config', // mocha 6.x
      '--opts', // legacy
      '--package', // mocha 6.x
      '--no-config', // mocha 6.x
    ) && !utils.mochaConfiguredForProject();

  // Add default options
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  if (setMochaOpts) {
    // Use the default `.mocharc.json` from `@loopback/build`
    const mochaOptsFile = utils.getConfigFile('.mocharc.json');
    mochaOpts.unshift('--config', mochaOptsFile);
  }

  const allowConsoleLogsIx = mochaOpts.indexOf('--allow-console-logs');
  if (allowConsoleLogsIx === -1) {
    // Fail any tests that are printing to console.
    mochaOpts.unshift(
      '--no-warnings', // Disable node.js warnings
      '--require',
      require.resolve('../lib/fail-on-console-logs'),
    );
  } else {
    // Allow tests to print to console, remove --allow-console-logs argument
    mochaOpts.splice(allowConsoleLogsIx, 1);
  }

  const args = [...mochaOpts];

  return utils.runCLI('mocha/bin/mocha', args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);

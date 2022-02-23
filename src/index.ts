#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import compile from './commands/compile.js';

yargs(hideBin(process.argv))
  // Use the command to scaffold.
  .command(compile)
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: 'help' })
  .alias({ v: 'version' })
  .argv;

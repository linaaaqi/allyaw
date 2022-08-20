#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import compile from './commands/compile';
import generate from './commands/generate'
import gitCheck from './commands/gitCheck'
import publishedNotification from './commands/publishedNotification'

yargs(hideBin(process.argv))
  // Use the command to scaffold.
  .commandDir('commands')
  .command(compile)
  .command(generate)
  .command(gitCheck)
  .command(publishedNotification)
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: 'help', v: 'version' })
  .argv;

#!/usr/bin/env node

import { program } from 'commander';
import { run, runSafe } from '../src/utils/shell.js';
import { gitSync } from '../src/commands/gitSync.js'
import { gitClean } from '../src/commands/gitClean.js'

program
    .name('b-tools')
    .description('Personal automation commands')
    .version('1.0.0');

 program
   .command('git-sync')
   .description('Fetch all remotes and pull branches with tracking branches')
   .action(async () => {
     try {
       await gitSync();
     } catch (err) {
       console.error('git-sync failed:', err.message);
       process.exit(1);
     }
   });

program
   .command('git-clean')
   .description('Remove all local branches whos remote link has been merged into master')
   .action(async () => {
     try {
       await gitClean();
     } catch (err) {
       console.error('git-clean failed:', err.message);
       process.exit(1);
     }
   });
   
program.parse(process.argv);


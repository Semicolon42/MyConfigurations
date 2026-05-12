import {confirm, checkbox } from '@inquirer/prompts';
import { run, runSafe } from '../utils/shell.js'

function parseBranches(branchVVOutput) {
    return branchVVOutput
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const match = line.match(/^\*?\s*(\S+)\s+[a-f0-9]+\s+(?:\[([^\]]+)\])?/);
        if (!match) return null;

        const name = match[1];
        const tracking = match[2] ?? null;
        const isGone = tracking?.includes(': gone') ?? false;
        const remote = tracking ? tracking.replace(': gone', '').trim() : null;
        const isCurrentBranch = line.startsWith('*');
        return { name, isCurrentBranch, remote, isGone };
      })
      .filter(Boolean);
  }

function formatBranch(b, maxName, maxRemote) {
    const prefix = b.isCurrentBranch ? '* ' : '  ';
    const remote = (b.remote ?? '').padEnd(maxRemote);
    const gone = b.isGone ? 'Gone' : '';
    return `${(prefix + b.name).padEnd(maxName)}${remote}${gone}`;
}

export async function gitClean() {
    const branchesOutput = await run('git', ['branch','-vv'])
    const branches = parseBranches(branchesOutput)
    const maxName = 2 + Math.max(...branches.map((b) => b.name.length))
    const maxRemote = 1 + Math.max(...branches.map((b) => b.remote?.length ?? 0))

    let answer = await checkbox({
        message: 'Select Branches to Delete',
        choices: branches
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((o) => ({
                name: formatBranch(o, maxName, maxRemote),
                value: o,
                checked: o.isGone && !o.isCurrentBranch,
                disabled: o.isCurrentBranch || o.name === 'master' || o.name === 'main'
            })),
        pageSize: 20,
    });

    console.log(answer.map((o) => formatBranch(o, maxName, maxRemote)));
    const doit = await confirm({ message: 'Delete these branches?', default: false});
    if (doit) {
        for (const branch of answer) {
            run('git', ['branch','-D', branch.name]).then((result) => {
                console.log(result)
            })
        }
    }
}

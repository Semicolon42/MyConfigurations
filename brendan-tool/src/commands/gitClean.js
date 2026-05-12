import {confirm, checkbox } from '@inquirer/prompts';
import { run, runSafe } from '../utils/shell.js'

function parseBranches(branchVVOutput) {
    return branchVVOutput
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const match = line.match(/^\*?\s+(\S+)\s+[a-f0-9]+\s+(?:\[([^\]]+)\])?/);
        if (!match) return null;

        const name = match[1];
        const tracking = match[2] ?? null;
        const isGone = tracking?.includes(': gone') ?? false;
        const remote = tracking ? tracking.replace(': gone', '').trim() : null;
        const isCurrentBranch = line.startsWith('*');

        return { name, isCurrentBranch, remote, isGone };
      })
      .filter(Boolean);  // removes the nulls from lines that didn't match
  }

export async function gitClean() {
    const branchesOutput = await run('git', ['branch','-vv'])
    const endBranches = parseBranches(branchesOutput)
    const maxName = 1 + Math.max(...endBranches.map((b)=>b.name.length))
    const maxRemote = 1 + Math.max(...endBranches.map((b)=>b.remote?.length ?? 0))

    let answer = await checkbox({
        message: 'Select Branches to Delete',
        choices: endBranches
            .filter((a)=> 'master' !== a.name && 'main' !== a.name)
            .sort((a,b) => {
                return a.name.localeCompare(b.name)
            }).map((o)=>{
                const name = 
                    `${((o.isCurrentBranch ? '** ':'') + o.name).padEnd(maxName)}`
                    + `${(o.remote ?? '---------').padEnd(maxRemote)}`
                    + `${o.isGone?'Gone':''}`;
                return {
                    name,
                    value: o,
                    checked: o.isGone && !o.isCurrentBranch,
                    disabled: o.isCurrentBranch
                }
            }),
        pageSize: 20,
    });
    // Confirm that these are the branches to delete
    console.log(' -- ', answer.map((o)=>`${o.isCurrentBranch?'*':''}`
                            + `${o.name.padEnd(maxName)} `
                            + `${(o.remote ?? '').padEnd(maxRemote)} `
                            + `${o.isGone?'Gone':''}`))
    const doit = await confirm({ message: 'Delete these branches?', default: false});
    if (doit) {
        for(const branch of answer) {
            // console.log(`git branch -D ${branch.name}`)
            run('git', ['branch','-D',branch.name]).then((result)=>{
                console.log(result)
            }) 
        }
    }
}
import { run, runSafe } from '../utils/shell.js';


export async function gitSync() {
    const logPrefix = " --- "

    console.log(logPrefix + 'Fetching all remotes...');
    await run('git', ['fetch', '--all', '--prune']);
    console.log(logPrefix + 'Fetch complete.\n');

    const originalBranch = await run('git', ['branch', '--show-current']);

    const branchOutput = await run('git', ['branch']);
    const branches = branchOutput
        .split('\n')
        .map(b => b.replace(/^\*?\s+/, '').trim())
        .filter(Boolean);

    console.log(`${logPrefix}Found ${branches.length} local branch(es): ${branches.join(', ')}\n`);

    for (const branch of branches) {
        const upstream = await runSafe('git', ['rev-parse', '--abbrev-ref', branch + "@{upstream}"]);

        if (!upstream) {
            console.log(`${logPrefix}  ${branch}: no tracking branch, skipping.`);
            continue;
        }

        console.log(`  ${branch}: tracking ${upstream}, pulling...`);
        try {
            await run('git', ['checkout', branch]);
            await run('git', ['pull']);
            console.log(logPrefix + `  ${branch}: up to date.`);
        } catch (err) {
            console.error(`  ${branch}: pull failed — ${err.stderr || err.message}`);
        }
    }

    if (originalBranch) {
        await run('git', ['checkout', originalBranch]);
        console.log(`\n${logPrefix}Returned to branch: ${originalBranch}`);
    }

    console.log(`\n${logPrefix}git-sync complete.`);
}
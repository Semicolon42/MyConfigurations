import { test } from 'node:test';
import assert from 'node:assert';
import { execa } from 'execa';

const CLI = new URL('../bin/cli.js', import.meta.url).pathname;

test('CLI runs and returns help', async () => {
    const result = await execa('node', [CLI, '--help']);
    assert.strictEqual(result.exitCode, 0);
});

test('git-sync command exists', async () => {
    const result = await execa('node', [CLI, '--help']);
    assert.ok(result.stdout.includes('git-sync'));
});

test('git-clean command exists', async () => {
    const result = await execa('node', [CLI, '--help']);
    assert.ok(result.stdout.includes('git-clean'));
});

test('version flag returns 1.0.0', async () => {
    const result = await execa('node', [CLI, '--version']);
    assert.ok(result.stdout.includes('1.0.0'));
});
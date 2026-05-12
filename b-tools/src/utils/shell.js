import { execa } from 'execa';

export async function run(cmd, args = []) {
    const result = await execa(cmd, args);
    return result.stdout.trim();
}

export async function runSafe(cmd, args = []) {
    try {
        const result = await execa(cmd, args);
        return result.stdout.trim();
    } catch (err) {
        return null;
    }
}
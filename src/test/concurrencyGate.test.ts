import assert from 'node:assert/strict';
import test from 'node:test';
import { ConcurrencyGate } from '../concurrencyGate';

const settle = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

test('never runs more operations at once than it was given room for', async () => {
    const gate = new ConcurrencyGate(2);
    const release: (() => void)[] = [];
    let active = 0;
    let peak = 0;

    const operations = Array.from({ length: 6 }, () => gate.run(async () => {
        active++;
        peak = Math.max(peak, active);
        await new Promise<void>((resolve) => release.push(resolve));
        active--;
    }));

    // Only two of the six can have started; the rest are waiting for a turn.
    await settle();
    assert.equal(release.length, 2);

    // Letting one finish at a time lets exactly one more start each time.
    while (release.length > 0) {
        release.shift()?.();
        await settle();
    }

    await Promise.all(operations);
    assert.equal(peak, 2);
});

test('a failing operation gives its turn back', async () => {
    const gate = new ConcurrencyGate(1);

    await assert.rejects(gate.run(() => Promise.reject(new Error('read failed'))));
    assert.equal(await gate.run(() => Promise.resolve('next')), 'next');
});

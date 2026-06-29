import assert from 'node:assert/strict';
import test from 'node:test';
import { formatExactSize, formatLineBadge, formatLineCount, formatSizeBadge } from '../formatting';

test('formats exact file sizes', () => {
    assert.equal(formatExactSize(0), '0 B');
    assert.equal(formatExactSize(512), '512 B');
    assert.equal(formatExactSize(1024), '1.0 KiB');
    assert.equal(formatExactSize(12 * 1024), '12 KiB');
    assert.equal(formatExactSize(1536 * 1024), '1.5 MiB');
});

test('formats compact size badges', () => {
    assert.equal(formatSizeBadge(0), '0');
    assert.equal(formatSizeBadge(8), 'B');
    assert.equal(formatSizeBadge(1024), '1K');
    assert.equal(formatSizeBadge(12 * 1024), '12K');
    assert.equal(formatSizeBadge(1536 * 1024), '2M');
});

test('formats line badges and tooltips', () => {
    assert.equal(formatLineBadge(0), '0');
    assert.equal(formatLineBadge(42), '42');
    assert.equal(formatLineBadge(1200), '1K');
    assert.equal(formatLineBadge(12500), '13K');
    assert.equal(formatLineCount(1), '1 line');
    assert.equal(formatLineCount(2), '2 lines');
});

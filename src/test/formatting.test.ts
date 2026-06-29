import assert from 'node:assert/strict';
import test from 'node:test';
import { formatExactSize, formatLineCount, formatMetricsTooltip, formatSizeBadge } from '../formatting';

test('formats exact file sizes', () => {
    assert.equal(formatExactSize(0), '0 B');
    assert.equal(formatExactSize(512), '512 B');
    assert.equal(formatExactSize(1024), '1.0 KB');
    assert.equal(formatExactSize(12 * 1024), '12 KB');
    assert.equal(formatExactSize(1536 * 1024), '1.5 MB');
});

test('formats compact size badges', () => {
    assert.equal(formatSizeBadge(0), '0B');
    assert.equal(formatSizeBadge(8), '8B');
    assert.equal(formatSizeBadge(1024), '1KB');
    assert.equal(formatSizeBadge(12 * 1024), '12KB');
    assert.equal(formatSizeBadge(1536 * 1024), '2MB');
});

test('formats metrics tooltips', () => {
    assert.equal(formatLineCount(1), '1 line');
    assert.equal(formatLineCount(2), '2 lines');
    assert.equal(formatMetricsTooltip(5 * 1024, 100), 'Lines: 100 lines\nSize: 5.0 KB');
    assert.equal(formatMetricsTooltip(1536 * 1024, undefined), 'Lines: unavailable\nSize: 1.5 MB');
});

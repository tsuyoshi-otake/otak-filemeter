import assert from 'node:assert/strict';
import test from 'node:test';
import { countTextLines, shouldCountLines } from '../lineCounter';

const encoder = new TextEncoder();

test('counts text lines without requiring a trailing newline', () => {
    assert.equal(countTextLines(encoder.encode('')), 0);
    assert.equal(countTextLines(encoder.encode('one')), 1);
    assert.equal(countTextLines(encoder.encode('one\n')), 1);
    assert.equal(countTextLines(encoder.encode('one\ntwo')), 2);
    assert.equal(countTextLines(encoder.encode('one\r\ntwo\r\n')), 2);
});

test('skips binary-looking content', () => {
    assert.equal(countTextLines(new Uint8Array([0x48, 0x00, 0x49])), undefined);
});

test('applies line count size limits', () => {
    assert.equal(shouldCountLines(1024, 1024), true);
    assert.equal(shouldCountLines(1025, 1024), false);
    assert.equal(shouldCountLines(0, 0), false);
});

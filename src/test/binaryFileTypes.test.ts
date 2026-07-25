import assert from 'node:assert/strict';
import test from 'node:test';
import { isKnownBinaryFileName } from '../binaryFileTypes';

test('recognises binary file types by extension', () => {
    assert.equal(isKnownBinaryFileName('images/icon.PNG'), true);
    assert.equal(isKnownBinaryFileName('C:\\build\\app.exe'), true);
    assert.equal(isKnownBinaryFileName('vendor/lib.node'), true);
});

test('leaves anything that could be text to be read', () => {
    assert.equal(isKnownBinaryFileName('src/extension.ts'), false);
    assert.equal(isKnownBinaryFileName('LICENSE'), false);
    assert.equal(isKnownBinaryFileName('.gitignore'), false);
    assert.equal(isKnownBinaryFileName('archive.zip/notes.md'), false);
});

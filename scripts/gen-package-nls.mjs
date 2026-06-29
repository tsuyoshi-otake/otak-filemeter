import fs from 'node:fs';
import path from 'node:path';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function collectNlsKeysFromPackageJson(pkg) {
  const serialized = JSON.stringify(pkg);
  const re = /%([^%]+)%/g;
  const keys = new Set();

  for (let match; (match = re.exec(serialized));) {
    keys.add(match[1]);
  }

  return [...keys].sort();
}

const repoRoot = process.cwd();
const packagePath = path.join(repoRoot, 'package.json');
const localesDir = path.join(repoRoot, 'src', 'i18n', 'locales');
const pkg = readJson(packagePath);
const keys = collectNlsKeysFromPackageJson(pkg);
const fallback = readJson(path.join(localesDir, 'en.json'));

const targets = [
  ['en', 'package.nls.json'],
  ['ja', 'package.nls.ja.json'],
];

for (const [locale, outputFile] of targets) {
  const messages = readJson(path.join(localesDir, `${locale}.json`));
  const output = {};

  for (const key of keys) {
    const value = messages[key] ?? fallback[key];
    if (typeof value !== 'string') {
      throw new Error(`Missing translation key '${key}' in ${locale}.json and en.json`);
    }
    output[key] = value;
  }

  writeJson(path.join(repoRoot, outputFile), output);
}

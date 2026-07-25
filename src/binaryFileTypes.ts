/**
 * File types that never have a line count worth showing.
 *
 * Binary content is already detected by looking for a zero byte, but only after
 * the whole file has been read — and reading it is exactly what makes an
 * on-access virus scanner scan it. Recognising the well known types by name
 * reaches the same answer without opening anything.
 */
const BINARY_EXTENSIONS = new Set([
    // images
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'icns', 'webp', 'avif', 'tif', 'tiff', 'psd', 'heic',
    // audio and video
    'mp3', 'wav', 'flac', 'ogg', 'oga', 'm4a', 'aac', 'wma',
    'mp4', 'm4v', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv',
    // archives
    'zip', 'gz', 'tgz', 'bz2', 'xz', 'zst', '7z', 'rar', 'tar', 'jar', 'war', 'ear', 'cab',
    // executables, libraries and build output
    'exe', 'dll', 'so', 'dylib', 'bin', 'obj', 'lib', 'pdb', 'node', 'wasm', 'class', 'pyc', 'pyd',
    // installers and images of disks
    'msi', 'iso', 'dmg', 'pkg', 'deb', 'rpm', 'apk', 'aab', 'ipa', 'appx',
    // documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
    // fonts
    'woff', 'woff2', 'ttf', 'otf', 'eot',
    // databases
    'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'realm'
]);

/**
 * Whether a file can be recognised as binary from its name alone. Names without
 * an extension, and dotfiles such as `.gitignore`, are not: they are read and
 * inspected like anything else.
 */
export function isKnownBinaryFileName(fileName: string): boolean {
    const separator = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
    const name = fileName.slice(separator + 1);
    const dot = name.lastIndexOf('.');
    if (dot <= 0) {
        return false;
    }

    return BINARY_EXTENSIONS.has(name.slice(dot + 1).toLowerCase());
}

/**
 * Lets a bounded number of operations run at once.
 *
 * Reading a file is what makes an on-access virus scanner scan it, and the
 * explorer asks for decorations for everything it shows at once — so without a
 * cap, revealing a folder turns into hundreds of simultaneous reads and the
 * scanner spikes with them.
 */
export class ConcurrencyGate {
    private active = 0;
    private readonly waiting: (() => void)[] = [];

    public constructor(private readonly limit: number) {}

    public async run<T>(operation: () => Promise<T>): Promise<T> {
        if (this.active >= this.limit) {
            await new Promise<void>((resolve) => this.waiting.push(resolve));
        }

        this.active++;
        try {
            return await operation();
        } finally {
            this.active--;
            this.waiting.shift()?.();
        }
    }
}

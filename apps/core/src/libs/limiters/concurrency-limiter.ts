export class ConcurrencyLimiter {
	private active = 0;
	private readonly queue: (() => void)[] = [];

	constructor(private readonly concurrency: number = 20) {}

	async run<T>(fn: () => Promise<T>): Promise<T> {
		this.active++;
		if (this.active > this.concurrency) {
			await new Promise<void>((resolve) => this.queue.push(resolve));
		}
		try {
			return await fn();
		} finally {
			this.active--;
			if (this.queue.length > 0) {
				const resolve = this.queue.shift()!;
				resolve();
			}
		}
	}
}

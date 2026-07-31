// Manual mock: the real package eagerly imports the native Nitro turbo module,
// which doesn't exist under Jest. Only the handful of methods storage.ts uses
// are implemented.
export class MMKV {
  private map = new Map<string, string>();

  getString(key: string): string | undefined {
    return this.map.get(key);
  }

  set(key: string, value: string): void {
    this.map.set(key, value);
  }

  clearAll(): void {
    this.map.clear();
  }
}

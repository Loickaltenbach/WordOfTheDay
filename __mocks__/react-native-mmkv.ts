// Manual mock: the real package eagerly imports the native Nitro turbo module,
// which doesn't exist under Jest. Only the handful of methods storage.ts uses
// are implemented.
class MockMMKV {
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

  remove(key: string): boolean {
    return this.map.delete(key);
  }
}

export function createMMKV(): MockMMKV {
  return new MockMMKV();
}

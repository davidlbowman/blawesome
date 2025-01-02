// Use crypto.randomUUID() if available (Node.js and modern browsers)
// Otherwise fallback to a simple UUID v4 implementation
export function generateId(): string {
	return Bun.randomUUIDv7();
}

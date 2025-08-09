// Shared in-memory store for Replicache client lastMutationID across routes
// Note: This is only suitable for development. In production, persist in a DB.

export type ClientLastMutationIDStore = Map<string, number>;

// Ensure a single instance during dev/HMR by attaching to globalThis
const globalAny = globalThis as unknown as {
  __replicacheClientLastMutationIDStore?: ClientLastMutationIDStore;
};

export const clientLastMutationIDStore: ClientLastMutationIDStore =
  globalAny.__replicacheClientLastMutationIDStore ??
  (globalAny.__replicacheClientLastMutationIDStore = new Map<string, number>());

export function getLastMutationID(clientID: string): number {
  return clientLastMutationIDStore.get(clientID) ?? 0;
}

export function setLastMutationID(clientID: string, lastMutationID: number): void {
  clientLastMutationIDStore.set(clientID, lastMutationID);
}



import { AsyncLocalStorage } from 'node:async_hooks';

// Initialize an asyncLocalStorage to trace logs down to a specific request.
export const asyncLocalStorage = new AsyncLocalStorage();

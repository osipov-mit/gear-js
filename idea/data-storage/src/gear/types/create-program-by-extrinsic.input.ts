import { MessageEnqueuedData } from '@gear-js/api';

export interface CreateProgramByExtrinsicInput {
  genesis: string;
  timestamp: number;
  blockHash: any;
  eventData: MessageEnqueuedData
}
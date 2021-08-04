export const isProd = process.env.NODE_ENV === 'production';
export const GEAR_STORAGE_KEY = 'gear_user_token';
export const GEAR_MNEMONIC_KEY = 'gear_mnemonic';
export const GEAR_LOCAL_WS_URI = isProd ? 'wss://idea.gear-tech.io/api/ws' : 'ws://localhost:3000/api/ws';
export const GEAR_LOCAL_IDE_URI = isProd ? '//idea.gear-tech.io/ide' : 'http://localhost:3000/ide';
export const JSONRPC_VERSION = '2.0';

export const GEAR_BALANCE_TRANSFER_VALUE = 4324239999999;

export const PROGRAM_ERRRORS = {
  UNATHORIZED: 'Unathorized',
  INVALID_PARAMS: 'Invalid method parameters',
  INVALID_TRANSACTION: 'Invalid transaction',
  PROGRAM_INIT_FAILED: 'Program initialization falied',
};

export const PROGRESS_BAR_STATUSES = {
  READY: 'READY',
  START: 'START',
  COMPLETED: 'COMPLETED',
};

export const PROGRAM_UPLOAD_STATUSES = {
  IN_BLOCK: 'in block',
  FINALIZED: 'finalized',
  PROGRAM_INITIALIZED: 'program initialized',
};

export const SOCKET_RESULT_STATUSES = {
  IN_BLOCK: 'InBlock',
  FINALIZED: 'Finalized',
  PROGRAM_INITIALIZED: 'ProgramInitialized',
  SUCCESS: 'Success',
  LOG: 'Log',
};

export const RPC_METHODS = {
  PROGRAM_UPLOAD: 'program.upload',
  TOTAL_ISSUANCE: 'system.totalIssuance',
  SUBSCRIBE_BLOCKS: 'blocks.newBlocks',
  BALANCE_TRANSFER: 'balance.transfer',
  SEND_MESSAGE: 'message.send',
};

export const EDITOR_DROPDOWN = ['Empty Rust template']

export const PAGE_TYPES = {
  ANSWER_PAGE: 'ANSWER_PAGE',
  MESSAGE_FORM_PAGE: 'MESSAGE_FORM_PAGE',
  EDITOR_PAGE: 'EDITOR_PAGE'
}

export const EDITOR_BTNS = {
  BUILD: 'BUILD',
  DOWNLOAD: 'DOWNLOAD',
  RUN: 'RUN',
  BUILD_RUN: 'BUILD_RUN',

}
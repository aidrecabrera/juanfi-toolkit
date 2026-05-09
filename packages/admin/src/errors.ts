export type JuanFiAdminErrorType =
  | 'network'
  | 'timeout'
  | 'parse'
  | 'unauthorized'
  | 'forbidden'
  | 'invalid';

export class JuanFiAdminError extends Error {
  readonly type: JuanFiAdminErrorType;
  readonly status?: number;
  readonly raw?: string;

  constructor(input: {
    type: JuanFiAdminErrorType;
    message: string;
    status?: number;
    raw?: string;
  }) {
    super(input.message);
    this.name = 'JuanFiAdminError';
    this.type = input.type;
    this.status = input.status;
    this.raw = input.raw;
  }
}

export type JuanFiAdminResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly code: string; readonly raw?: string };

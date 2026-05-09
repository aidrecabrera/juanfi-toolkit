import { adminRoutes } from './routes';
import { postForm, postEmpty } from './internal/http';
import type { AdminCore, LoginInput, LoginResult, JuanFiAdminResult } from './types';

/** POST /validateLogin, plain text not JSON. Wire shapes in parseLoginResponse(). web_auth handleValidateLogin */
export async function validateLogin(core: AdminCore, input: LoginInput): Promise<LoginResult> {
  const raw = await postForm(core, adminRoutes.validateLogin, {
    username: input.username,
    password: input.password,
    randomToken: input.randomToken,
  });
  return parseLoginResponse(raw);
}

export function parseLoginResponse(raw: string): LoginResult {
  const trimmed = raw.trim();
  if (trimmed.startsWith('ok|')) {
    const token = trimmed.slice(3).trim();
    if (token.length === 0) {
      return { ok: false, message: 'Empty token', raw: trimmed };
    }
    return { ok: true, token, raw: trimmed };
  }
  if (trimmed === 'ok') {
    /* bare ok means no X-TOKEN. fail so we never stash a useless token on core */
    return { ok: false, message: 'Missing token in response', raw: trimmed };
  }
  const separator = trimmed.indexOf('|');
  const message = separator >= 0 ? trimmed.slice(separator + 1).trim() : trimmed || 'Invalid credentials';
  return { ok: false, message, raw: trimmed };
}

/**
 * POST /admin/api/logout
 * clears token either way. no point keeping X-TOKEN after logout or dead link
 */
export async function logout(core: AdminCore): Promise<JuanFiAdminResult<true>> {
  try {
    const raw = await postEmpty(core, adminRoutes.logout);
    core.state.token = undefined;
    return raw.trim().toLowerCase().startsWith('ok')
      ? { ok: true, data: true }
      : { ok: false, code: 'unexpected', raw };
  } catch (error) {
    core.state.token = undefined;
    return { ok: false, code: error instanceof Error ? error.message : 'network' };
  }
}

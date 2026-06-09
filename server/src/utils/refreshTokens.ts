import { verify } from 'jsonwebtoken';
import { env } from './env';

/**
 * Drops any refresh tokens that are expired or otherwise invalid, so the
 * `refreshToken` array on a user document doesn't grow unbounded over time.
 */
export const pruneRefreshTokens = (tokens: string[]): string[] =>
  tokens.filter(token => {
    try {
      verify(token, env.REFRESH_TOKEN_SECRET);
      return true;
    } catch {
      return false;
    }
  });

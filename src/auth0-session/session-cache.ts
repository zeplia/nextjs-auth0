import { TokenSet } from 'openid-client';

export interface SessionCache {
  create(req: any, tokenSet: TokenSet): void;
  delete(req: any): void;
  isAuthenticated(req: any): boolean;
  getIdToken(req: any): string | undefined;
}

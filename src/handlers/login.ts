import { NextApiRequest, NextApiResponse } from 'next';

import version from '../version';
import IAuth0Settings from '../settings';
import isSafeRedirect from '../utils/url-helpers';

import { setCookies } from '../utils/cookies';
import { createState } from '../utils/state';
import { IOidcClientFactory } from '../utils/oidc-client';

function telemetry(): string {
  const bytes = Buffer.from(
    JSON.stringify({
      name: 'nextjs-auth0',
      version
    })
  );

  return bytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface AuthorizationParameters {
  acr_values?: string;
  audience?: string;
  display?: string;
  login_hint?: string;
  max_age?: string | number;
  prompt?: string;
  scope?: string;
  state?: string;
  ui_locales?: string;
  [key: string]: unknown;
}

export interface LoginOptions {
  getState?: (req: NextApiRequest) => Record<string, any>;
  authParams?: AuthorizationParameters;
  redirectTo?: string;
}

export default function loginHandler(settings: IAuth0Settings, clientProvider: IOidcClientFactory) {
  return async (req: NextApiRequest, res: NextApiResponse, options?: LoginOptions): Promise<void> => {
    if (!req) {
      throw new Error('Request is not available');
    }

    if (!res) {
      throw new Error('Response is not available');
    }

    if (req.query.redirectTo) {
      if (typeof req.query.redirectTo !== 'string') {
        throw new Error('Invalid value provided for redirectTo, must be a string');
      }

      if (!isSafeRedirect(req.query.redirectTo)) {
        throw new Error('Invalid value provided for redirectTo, must be a relative url');
      }
    }

    const opt = options || {};
    const getLoginState =
      opt.getState ||
      function getLoginState(): Record<string, any> {
        return {};
      };

    const {
      // Generate a state which contains a nonce, the redirectTo uri and potentially custom data
      state = createState({
        redirectTo: req.query?.redirectTo || options?.redirectTo,
        ...getLoginState(req)
      }),
      max_age,
      ...authParams
    } = (opt && opt.authParams) || {};

    // Create the authorization url.
    const client = await clientProvider();
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: settings.redirectUri,
      scope: settings.scope,
      response_type: 'code',
      audience: settings.audience,
      state,
      auth0Client: telemetry(),
      max_age: max_age === undefined ? max_age : +max_age,
      ...authParams
    });

    // Set the necessary cookies
    setCookies(req, res, [
      {
        name: 'a0:state',
        value: state,
        maxAge: 60 * 60
      }
    ]);

    // Redirect to the authorize endpoint.
    res.writeHead(302, {
      Location: authorizationUrl
    });
    res.end();
  };
}

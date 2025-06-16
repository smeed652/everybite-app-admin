import { Amplify, ResourcesConfig } from 'aws-amplify';
import { signIn as amplifySignIn, signOut as amplifySignOut, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';

// Pull values from Vite env variables defined in `.env.*` files.
// Vite injects `import.meta.env` at build/dev time, but this isn’t available
// in Jest’s CommonJS environment.  Access it conditionally so both runtimes
// parse correctly *and* the browser stays in module context.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – `typeof import.meta` is only valid in ES modules but will be tree-shaken by Vite.
const metaEnv: any | undefined = typeof import.meta === 'object' && (import.meta as any).env ? (import.meta as any).env : undefined;
const region = (metaEnv?.VITE_AWS_REGION ?? process.env.VITE_AWS_REGION) as string;
const userPoolId = (metaEnv?.VITE_COGNITO_USER_POOL_ID ?? process.env.VITE_COGNITO_USER_POOL_ID) as string;
const userPoolWebClientId = (metaEnv?.VITE_COGNITO_APP_CLIENT_ID ?? process.env.VITE_COGNITO_APP_CLIENT_ID) as string;

if (!region || !userPoolId || !userPoolWebClientId) {
  // eslint-disable-next-line no-console
  console.warn('[aws-auth] Missing Cognito env vars – authentication will not work until they are set.');
}

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId: userPoolWebClientId,
      // @ts-expect-error Amplify typing missing userPoolRegion
      userPoolRegion: region,
    },
  },
};

Amplify.configure(amplifyConfig);

export const signIn = async (email: string, password: string) => {
  return amplifySignIn({ username: email, password });
};

export const signOut = async () => {
  return amplifySignOut();
};

export const currentSession = async () => fetchAuthSession();

export const completeNewPassword = async (cognitoUser: unknown, newPassword: string) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – confirmSignIn typings are incomplete for NEW_PASSWORD_REQUIRED
  // challengeResponse for NEW_PASSWORD flow must be the plain new password string, not an object
  return confirmSignIn({ user: cognitoUser as any, challengeResponse: newPassword });
};

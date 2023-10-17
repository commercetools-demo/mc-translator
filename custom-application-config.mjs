import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'The Insider',
  description: 'Translate your products the right way',
  entryPointUriPath,
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  headers: {
    csp: {
      'connect-src': [
        'https://api.stripe.com',
        'https://translation.googleapis.com/v3/projects/ct-sales-207211:translateText',
      ],
      'script-src': [
        'https://apis.google.com/js/api.js',
        'https://apis.google.com',
      ],
      'frame-src': [
        'https://accounts.google.com',
        'https://content-translate.googleapis.com',
        'https://content-translation.googleapis.com',
      ],
    },
  },
  env: {
    development: {
      initialProjectKey: 'composable-b2b-dev',
    },
    production: {
      applicationId: 'TODO',
      url: 'https://your_app_hostname.com',
    },
  },
  additionalEnv: {
    googleProjectID: '${env:GOOGLE_PROJECT_ID}',
    googleClientID: '${env:GOOGLE_CLIENT_ID}',
    translateApiKey: '${env:TRANSLATE_API_KEY}',
  },
  oAuthScopes: {
    view: ['view_products'],
    manage: ['manage_products'],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/gift.svg}',
  mainMenuLink: {
    defaultLabel: 'The insider',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: 'products',
      defaultLabel: 'Products',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;

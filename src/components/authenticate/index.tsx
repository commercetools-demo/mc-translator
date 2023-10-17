/* eslint-disable @typescript-eslint/no-explicit-any */
import PrimaryButton from '@commercetools-uikit/primary-button';
import Text from '@commercetools-uikit/text';
import React, { useEffect, useState } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import messages from './messages';
import { useIntl } from 'react-intl';
declare var gapi: any;

const Authenticate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const intl = useIntl();

  // @ts-ignore
  const { googleClientID, translateApiKey } = useApplicationContext(
    (context) => context.environment
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const loadClient = () => {
    gapi.client.setApiKey(translateApiKey);
    return gapi.client
      .load('https://translate.googleapis.com/$discovery/rest?version=v3')
      .then(
        function () {
          console.log('GAPI client loaded for API');
        },
        function (err) {
          console.error('Error loading GAPI client for API', err);
        }
      )
      .then(() => {
        setIsLoggedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
  };
  const authenticate = () => {
    return gapi.auth2
      .getAuthInstance()
      .signIn({
        scope:
          'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cloud-translation',
      })
      .then(
        function () {
          console.log('Sign-in successful');
          loadClient();
        },
        function (err) {
          console.error('Error signing in', err);
        }
      );
  };

  useEffect(() => {
    gapi.load('client:auth2', function () {
      gapi.auth2.init({
        client_id: googleClientID,
        cookiepolicy: 'single_host_origin',
        plugin_name: 'hello-and', //any name can be used
      });
    });
    // @ts-ignore
    console.log();
  }, []);
  return (
    <>
      {!isLoggedIn && (
        <div>
          <Text.Headline as="h1" intlMessage={messages.title} />
          <Text.Subheadline as="h4" intlMessage={messages.subtitle} />

          <PrimaryButton
            label={intl.formatMessage(messages.button)}
            onClick={authenticate}
            type="button"
            tone="primary"
            style={{ color: 'black' }}
          ></PrimaryButton>
        </div>
      )}
      {isLoggedIn && children}
    </>
  );
};

export default Authenticate;

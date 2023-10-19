import PrimaryButton from '@commercetools-uikit/primary-button';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import messages from './messages';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { InfoDetailPage } from '@commercetools-frontend/application-components';
declare var gapi: any;

type TAuthenticateProps = {
  linkToWelcome: string;
};

const Authenticate: React.FC<PropsWithChildren<TAuthenticateProps>> = ({
  children,
  linkToWelcome,
}) => {
  const intl = useIntl();
  const { push } = useHistory();

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
        function (err: unknown) {
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
        function (err: unknown) {
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
    console.log();
  }, [googleClientID]);
  return (
    <>
      {!isLoggedIn && (
        <InfoDetailPage
          title={intl.formatMessage(messages.title)}
          subtitle={intl.formatMessage(messages.subtitle)}
          onPreviousPathClick={() => push(linkToWelcome)}
          previousPathLabel={intl.formatMessage(messages.backToWelcome)}
        >
          <PrimaryButton
            label={intl.formatMessage(messages.button)}
            onClick={authenticate}
          ></PrimaryButton>
        </InfoDetailPage>
      )}
      {isLoggedIn && children}
    </>
  );
};

export default Authenticate;

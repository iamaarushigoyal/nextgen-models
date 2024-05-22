import { React, useState } from 'react';
import { buildQueryString, parseQueryString } from '../libs/queryString';

const checkToken = () => {
  // Check if there's a new token from the URL
  const url = new URL(window.location);
  // Extract the token and save it
  const hashParams = url.hash.split('&');
  for (let param of hashParams) {
    if (param.indexOf("access_token") !== -1) {
      const token = param.replace('#access_token=', '');
      console.log("Detected Sketchfab token: ", token);
      localStorage.setItem("sb_token", token);
    }
  }
}

export const Login = () => {
  const config = {
    hostname: 'sketchfab.com',
    client_id: 'xxxx',
    redirect_uri: 'http://localhost:3000/'
  };

  const [profile, setProfile] = useState();

  checkToken();
  const token = localStorage.getItem("sb_token");

  const fetchProfileData = () => {
    const token = localStorage.getItem("sb_token");
    const options = {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${token}`,
      },
      mode: 'cors'
    };
    
    fetch('https://api.sketchfab.com/v3/me', options)
      .then(response => {
        return response.json();
      }).then(res => setProfile(res))
      .catch(err => { throw new Error(err) } );
  }


  token && !profile && fetchProfileData();

  const clickBtn = () => {
    return new Promise( function ( resolve, reject ) {
      if ( !config.client_id ) {
          reject( new Error( 'client_id is missing.' ) );
          return;
      }

      const defaultParams = {
          'response_type': 'token',
          'state': + new Date(),
          'client_id': config.client_id,
          'redirect_uri': config.redirect_uri
      };
      const queryParams = Object.assign({}, defaultParams, {});
      const authorizeUrl = 'https://' + config.hostname + '/oauth2/authorize/?' + buildQueryString(queryParams);
      console.log(authorizeUrl);

      const loginPopup = window.open( authorizeUrl, 'loginWindow', 'width=640,height=400' );
      // loginPopup.close();

      // Polling new window
      const timer = setInterval( function () {
          try {
              const url = loginPopup.location.href;

              // User closed popup
              if ( url === undefined ) {
                  clearInterval( timer );
                  reject( new Error( 'Access denied (User closed popup)' ) );
                  return;
              }

              // User canceled or was denied access
              if ( url.indexOf( '?error=access_denied' ) !== -1 ) {
                  clearInterval( timer );
                  reject( new Error( 'Access denied (User canceled)' ) );
                  return;
              }

              // Worked?
              if ( url.indexOf( config.redirect_uri ) !== -1 ) {
                  clearInterval( timer );

                  const hash = loginPopup.location.hash;
                  let grant;
                  const accessTokenRe = RegExp( 'access_token=([^&]+)' );
                  if ( hash.match( accessTokenRe ) ) {
                      grant = parseQueryString( hash.substring( 1 ) );
                      loginPopup.close();
                      window.location.reload();
                      resolve( grant );
                      return;
                  } else {
                      reject( new Error( 'Access denied (missing token)' ) );
                      return;
                  }
              }
          } catch ( e ) {}
      }, 1000 );

    });
  }

  const logoutUser = () => {
    localStorage.removeItem('sb_token');
    window.location.reload();
  }

  return (  
    <div>
      
      {token ? 
        <div>
          {profile &&
            <div>
              <h1>Welcome {profile.displayName}</h1>
              <div>Email: {profile.email}</div>
              <br />
              <div>
                You can find your sketchfab profile 
                <a href={profile.profileUrl} target='_blank' rel="noreferrer">here</a>
              </div>
              <br />
              <button onClick={logoutUser}>Logout</button>
            </div>
          }
        </div> :
        <button onClick={clickBtn}>Login to SketchFab</button>
      }
      
    </div>
  )
}
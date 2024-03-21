// Auth0 client side code
import "https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js";
import * as config from "../backend/config.js";
// import "./posthog.js";

console.log("entering auth page");

/////////////////////////////////////////////////////////////////// auth0 client init
export const auth0Client = await auth0.createAuth0Client({
  domain: config.AUTH0_DOMAIN,
  clientId: config.AUTH0_CLIENT,
  authorizationParams: {
    redirect_uri: `${config.BASE_FRONTEND_URL}/index`,
    audience:  config.AUTH0_AUDIENCE,
  },
   useRefreshTokens: true,
   cacheLocation: 'localstorage',
});

//////////////////////////////////////////////////////////////////////////////// Logout function
window.logoutFunction = async function logoutFunction() {
  try{
    localStorage.removeItem("campaignId");
    // Client side logout
    auth0Client.logout({
      logoutParams: {
        returnTo: `${config.BASE_FRONTEND_URL}`,
      },
    });
  }catch(e){
    // posthog.capture(JSON.stringify(e.stack));
    console.error(e);
  }
};

/////////////////////////////////////////////////////////////////// Client side login
window.loginFunction = async function loginFunction() {
  try {
    await auth0Client.loginWithRedirect();

  } catch(e) {
    console.error(e);
  }
};


window.getAccessToken = async function getAccessToken() {
  const differentAudienceOptions = {
    cacheMode: "on",
  };

  const accessToken = await auth0Client.getTokenSilently(differentAudienceOptions);
  console.log("access token is ", accessToken);

  // const accessToken1 = await auth0Client.getTokenSilently();
  // console.log("access token 1 is ", accessToken1);

  return accessToken;
}






window.addEventListener('load', async () => {
  // After login, get the URL parameters
  const params = new URLSearchParams(window.location.search);

  // Get the code and state
  const code = params.get('code');
  const state = params.get('state');

  // Store the code and state
  window.localStorage.setItem('code', code);
  window.localStorage.setItem('state', state);

  // Remove the code and state from the URL
  params.delete('code');
  params.delete('state');
  window.history.replaceState({}, document.title, "/" + params.toString());

  // Get the user info
  const user = await auth0Client.getUser();

  // Get the access token from function getAccessToken
  const accessToken = await getAccessToken(); // Make sure this function is defined

  // save user access token, email id, photo and name into fastn record
  const user_data = {
    email: user.email,
    name: user.name,
    picture: user.picture,
    access_token: accessToken
  };

  class AppStore extends HTMLElement {
    connectedCallback() {
      ftd.on_load(() => {
        this.data = ftd.component_data(this);

        const currentUser = this.data.current_user.get();

        currentUser.set("email", user_data.email);
        currentUser.set("name", user_data.name);
        currentUser.set("picture", user_data.picture);
        currentUser.set("access_token", user_data.access_token);
      })
    }
  }

  customElements.define('app-store', AppStore);
});



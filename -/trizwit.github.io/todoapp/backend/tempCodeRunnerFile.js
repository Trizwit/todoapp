// Login function
// Logout function
// Refresh Id token function
// Init auth0 client
// Get client info function
// Get Id token claims function
// Call protected API function
// Decode given Id token to obtain user info function                           decodeIdToken(idToken)

import "https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js";
import * as config from "./config.js";
import "./posthog.js";

console.log("entering auth page");

/////////////////////////////////////////////////////////////////// auth0 client init
export const auth0Client = await auth0.createAuth0Client({
  domain: config.AUTH0_DOMAIN,
  clientId: config.AUTH0_CLIENT,
  authorizationParams: {
    redirect_uri: `${config.BASE_FRONTEND_URL}/index`,
    // audience:  config.AUTH0_AUDIENCE,
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
    posthog.capture(JSON.stringify(e.stack));
    console.error(e);
  } 
};

/////////////////////////////////////////////////////////////////// Client side login
window.loginFunction = async function loginFunction() {
  try{
    await auth0Client.loginWithRedirect();
  }catch(e){
    posthog.capture(JSON.stringify(e.stack));
    console.error(e);
  }

  
  // await auth0Client.loginWithRedirect({
  //   authorizationParams: {
  //     redirect_uri: `${config.BASE_FRONTEND_URL}/dashboard/campaign/ongoing`,
  //    // audience: config.AUTH0_AUDIENCE
  //   },
  // });
};


/////////////////////////////////////////////////////////////////// Get User info
window.getUserInfo = async function getUserInfo() {
  console.log("entering get user info function", auth0Client);

  try {
    const idTokenClaims = await auth0Client.getIdTokenClaims({
      cacheMode: "off",
      forceRefresh: true,
    });
    const idToken = idTokenClaims.__raw;
    console.log("New ID token:", idToken);
    decodeIdToken(idToken).then((response) => {
      console.log("decode token is ", response);
    });
  } catch (e) {
    posthog.capture(JSON.stringify(e.stack));
    console.error(e);
  }

  await auth0Client.getUser().then((user) => {
    console.log("user isdsfsd ", user);
    window.ftd.set_value(
      "app.maxz.io/globalVariables#userName",
      user.nickname
    );
  });
};

///////////////////////////////////////////////////////////////// Get Id token claims
window.getIdTokenClaims = async function getIdTokenClaims() {
  console.log("entering get id token claims function", auth0Client);
  // const differentAudienceOptions = {
  //   cacheMode: "off",
  //   authorizationParams: {
  //     audience: `${AUTH0_AUDIENCE}`,
  //     //  scope: 'read:rules',
  //   },
  // };

  auth0Client.getTokenSilently();

  await auth0Client.getUser().then((user) => {
    console.log("user isdsfsd ", user);
    window.ftd.set_value(
      "app.maxz.io/globalVariables#userName",
      user.nickname
    );
  });
  // if you need the raw id_token, you can access it
  // using the __raw property
};

/////////////////////////////////////////////////////////////////////////////// Refresh ID Token
window.refreshFunct = async function refreshFunct() {
  try {
    const idTokenClaims = await auth0Client.getIdTokenClaims({
      cacheMode: "off",
      forceRefresh: true,
    });
    const idToken = idTokenClaims.__raw;
    console.log("New ID token:", idToken);
  } catch (e) {
    posthog.capture(JSON.stringify(e.stack));
    console.error(e);
  }
};



/////////////////////////////////////////////////////////////////////////// Decode a given ID token to obtain user info
window.decodeIdToken = async function decodeIdToken(idToken) {
  console.log("idToken is ", idToken);
  const base64Url = idToken.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  const payload = JSON.parse(jsonPayload);
  window.ftd.set_value(
    "app.maxz.io/globalVariables#userName",
    payload.nickname
  );
  return payload;
};


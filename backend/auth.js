// Auth0 client side code
import "https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js";
import * as config from "../backend/config.js";
// import "./posthog.js";

console.log("entering auth page");

/////////////////////////////////////////////////////////////////// auth0 client init
export const auth0Client = await auth0.createAuth0Client({
  domain: config.AUTH0_DOMAIN,
  clientId: config.AUTH0_CLIENT,
  // clientSecret: config.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    redirect_uri: `${config.BASE_FRONTEND_URL}/index`,
    audience: config.AUTH0_AUDIENCE,
    // scope: "openid profile email offline_access",
  },
  useRefreshTokens: true,
  // useRefreshTokensFallback: true,
  cacheLocation: "localstorage",
});

//////////////////////////////////////////////////////////////////////////////// Logout function
window.logoutFunction = async function logoutFunction() {
  try {
    // localStorage.removeItem("campaignId");
    // Client side logout
    auth0Client.logout({
      logoutParams: {
        returnTo: `${config.BASE_FRONTEND_URL}`,
      },
    });
  } catch (e) {
    // posthog.capture(JSON.stringify(e.stack));
    console.error(e);
  }
};

/////////////////////////////////////////////////////////////////// Client side login
window.loginFunction = async function loginFunction() {
  try {
    console.log("entered login function");
    await auth0Client.loginWithRedirect();

    // const differentAudienceOptions = {
    //   cacheMode: "on",
    // };

    // const accessToken = await auth0Client.getTokenSilently(differentAudienceOptions);
    // console.log("access token is ", accessToken);
  } catch (e) {
    console.error(e);
  }
};

window.getAccessToken = async function getAccessToken() {
  try {
    console.log("autho client is ", auth0Client);

    const differentAudienceOptions = {
      cacheMode: "off",
    };
    console.log("inside getAccessToken function");

    const accessToken = await auth0Client.getTokenSilently(
      differentAudienceOptions
    );

    // localStorage.setItem("access_token", token);
    // console.log("access token is ", token);

    console.log("access token is ", accessToken);

    // const accessToken = await auth0Client.getTokenSilently();
    // console.log("access token 1 is ", accessToken);
    return accessToken;
  } catch (e) {
    console.error(e);
  }
};

ftd.on_load(async function () {
  console.log("DOM content loaded");
  if (
    location.search.includes("state=") &&
    (location.search.includes("code=") || location.search.includes("error="))
  ) {
    try {
      console.log("auth0 handle callback");
      await auth0Client.handleRedirectCallback();
    } catch (e) {
      console.error(e);
      logoutFunction();
    }
  }
});

// window.addEventListener('load', async () => {
//   // After login, get the URL parameters
//   const params = new URLSearchParams(window.location.search);

//   // Get the code and state
//   const code = params.get('code');
//   const state = params.get('state');

//   // // Store the code and state
//   // window.localStorage.setItem('code', code);
//   // window.localStorage.setItem('state', state);

//   // Remove the code and state from the URL
//   params.delete('code');
//   params.delete('state');
//   window.history.replaceState({}, document.title, "/" + params.toString());

//   // Get the user info
//   const user = await auth0Client.getUser();

//   // Get the access token from function getAccessToken
//   const accessToken = await getAccessToken(); // Make sure this function is defined

//   // save user access token, email id, photo and name into fastn record
//   const user_data = {
//     email: user.email,
//     name: user.name,
//     picture: user.picture,
//     access_token: accessToken
//   };

//   console.log("user data is ", user_data);

// });

if (!customElements.get("auth-resolver")) {
  class AuthResolver extends HTMLElement {
    async connectedCallback() {
      // After login, get the URL parameters
      // const params = new URLSearchParams(window.location.search);

      // Get the code and state
      // const code = params.get('code');
      // const state = params.get('state');

      // Store the code and state
      // window.localStorage.setItem('code', code);
      // window.localStorage.setItem('state', state);

      // Remove the code and state from the URL
      // params.delete('code');
      // params.delete('state');
      // window.history.replaceState({}, document.title, "/" + params.toString());

      // var options = {
      //   method: 'POST',
      //   url: 'https://dev-ci5h1y84jll0nhuf.us.auth0.com/oauth/token',
      //   headers: {'content-type': 'application/x-www-form-urlencoded'},
      //   data: new URLSearchParams({
      //     grant_type: 'authorization_code',
      //     client_id: config.AUTH0_CLIENT,
      //     client_secret: config.AUTH0_CLIENT_SECRET,
      //     code: code,
      //     redirect_uri: `${config.BASE_FRONTEND_URL}/index`
      //   })
      // };

      // axios.request(options).then(function (response) {
      //   console.log("response is ", response);} ).catch(function (error) {
      //     console.error(error);
      //   });

      // // add the items to local storage
      // localStorage.setItem('refresh_token', response.data.refresh_token);
      // localStorage.setItem('access_token', response.data.access_token);
      // localStorage.setItem('id_token', response.data.id_token);

      // Get the user info
      const user = await auth0Client.getUser();

      // Get the access token from function getAccessToken
      // const accessToken = await getAccessToken(); // Make sure this function is defined
      // console.log("Access token: ", access_token);

      // save user access token, email id, photo and name into fastn record
      const user_data = {
        email: !!user ? user.email : "shaheen50053@gmail.com",
        name: !!user ? user.name : "Guest",
        picture: !!user
          ? user.picture
          : "https://www.shaheen-senpai.tech/-/shaheen-senpai.tech/assets/logo.svg",
        access_token: !!user ? accessToken : "default_access_token",
      };

      // store user data in local storage
      // localStorage.setItem("current_user", JSON.stringify(user_data));
      let data = ftd.component_data(this);

      let auth_user = data.current_user;
      console.log("Input user: ", auth_user);

      console.log("Setting user_data: ", user_data);
      auth_user.set(user_data);
      console.log("user data is ", auth_user);
    }
  }
  customElements.define("auth-resolver", AuthResolver);
}

function addTodosjs(list_todos, todo) {
  console.log("list todos is ", list_todos);
  console.log("todo is ", todo);

  // console type of each data passes to the function
  console.log("type of list_todos is ", typeof list_todos);
  console.log("type of todo is ", typeof todo);
}

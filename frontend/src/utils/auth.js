import { createProfile } from './data_access'
import { clientID } from '../../auth.config'

// prevent user from being stuck in an authentication loop 
export function clearData()
{
  localStorage.setItem("verifier", "");
  localStorage.setItem("access_token", "");
  localStorage.setItem("expire", "");
  localStorage.setItem("profile", "");
}

// Checks that the current session is valid and reauthenticates if not
export async function checkAPICode() { // returns successful (true) or not (false)
  const expire = localStorage.getItem("expire");
  const prevAccessToken = localStorage.getItem("access_token");

  // if access token is expired, then call reauthenticate() and exit from this function.
  if(prevAccessToken && expire && expire < Date.now()) {
    const token = await reauthenticate();
    const profile = await fetchProfile(token);
    if(!profile) console.error("profile is undefined after reauth");
    return true;
  }
  // othwerwise if there's no verification string in local storage, then redirect to 
  // spotify login page by calling redirectToAuthCodeFlow
  else if(!localStorage.getItem("verifier")) {
    redirectToAuthCodeFlow();
    return false;
  // after returning from spotify login page redirect in the previous step, function 
  // is called again to get code from parameters and generate an access code here.
  } else if(!prevAccessToken) {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if(!code) {
      redirectToAuthCodeFlow();
    }
    const token = await getAccessToken(code);
    const profile = await fetchProfile(token);
    return profile ? true : false;
  // only reach this case if all credentials are valid when function is called, in 
  // which the function does nothing.
  } else {
    return true;
  }
}

// generates a verification key
function generateCodeVerifier(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// hashes verification key
async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

// redirects user to Spotify authenication page and returns to provided callback url
async function redirectToAuthCodeFlow() {
  clearData();
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);
  const redirectURI =  window.location.protocol + "//" + window.location.host + "/auth"
  console.log(redirectURI);
  const params = new URLSearchParams();
  params.append("client_id", clientID);
  params.append("response_type", "code");
  params.append("redirect_uri", redirectURI);
  params.append("scope", `
    user-read-private 
    user-read-email 
    user-top-read
    user-read-recently-played
    `);
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// using authorization code fetch the spotify token api 
async function getAccessToken(code) {
  if(!code) {
    console.error("No code.");
    return null;
  }

  const verifier = localStorage.getItem("verifier");
  const redirectURI = window.location.protocol + "//" + window.location.host + "/auth"
  
  const params = new URLSearchParams();
  params.append("client_id", clientID);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectURI);
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded" 
    },
    body: params,
  });

  const response = await result.json();
  if(!response.access_token) return "";
  else {
    const data = JSON.stringify(response);
    localStorage.setItem("access_token", data);
    localStorage.setItem("expire", Date.now() + (response.expires_in-1) * 1000);

    // create profile on database
    createProfile(data.access_token);

    return response.access_token;
  }
}

// fetch profile given 
async function fetchProfile(accessToken) {
  if (!accessToken) {
    console.error("No access token.");
    return null;
  }

  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
  });
  const response = await result.json();
  const data = JSON.stringify(response);
  localStorage.setItem("profile", data);
  localStorage.setItem("snapshot_index", 0);
  console.log(data);

  return response;
}


async function reauthenticate() {
  const accessToken = localStorage.getItem("access_token");
  if(accessToken) {
    try {
      const refreshToken = JSON.parse(accessToken).refresh_token;
      console.log(refreshToken);
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", refreshToken);
      params.append("client_id", clientID);

      const result = await fetch("https://accounts.spotify.com/api/token",{
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const response = await result.json();
      if(!response.access_token) return "";
      else {
        const data = JSON.stringify(response);
        localStorage.setItem("access_token", data);
        localStorage.setItem("expire", Date.now() + (response.expires_in-1) * 1000);
        
        return response.access_token;
      }
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  console.log("unable to reauthenticate");
  return false;
}
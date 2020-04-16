import { SpotifyConfig } from "../config"

let refreshToken = localStorage.getItem('refresh_token');

export const refreshAccessToken = () => {
    const encodeCredentials = btoa(`${SpotifyConfig.client_id}:${SpotifyConfig.client_secret}`);
    return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        headers: {
            'Authorization': `Basic ${new Buffer.from(`${encodeCredentials}`)}`,
            'Content-Type':'application/x-www-form-urlencoded'
        }
    })
}
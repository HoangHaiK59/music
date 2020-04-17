import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://api.spotify.com",
  timeout: 1000,
  headers: {
    "content-type": "application/x-www-form-urlencoded",
  }
});

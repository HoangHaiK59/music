import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
  headers: {
    "content-type": "application/x-www-form-urlencoded",
  }
});

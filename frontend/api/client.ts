import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7087/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Sending HTTP Only cookies on every request (used for JWT auth)
});

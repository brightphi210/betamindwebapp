import axios from "axios";

const BASE_URL = "https://api.betaminds.online/api/v1/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Plain axios instance for the refresh call itself — must NOT go through
// the response interceptor below, or a failed refresh could recurse.
const refreshClient = axios.create({
  baseURL: BASE_URL,
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
};

const logoutAndRedirect = () => {
  localStorage.removeItem("betamindToken");
  localStorage.removeItem("refresh");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // Only attempt a refresh on 401s, and only once per request.
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh");

      // No refresh token available — nothing we can do, log out.
      if (!refreshToken) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // A refresh is already in flight — queue this request until it resolves.
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post("auth/refresh/", {
          refresh: refreshToken,
        });

        // Adjust these two lines if the backend returns access/refresh under
        // a different shape (e.g. data.tokens.access).
        const newAccessToken: string = data?.access ?? data?.data?.tokens?.access;
        const newRefreshToken: string | undefined =
          data?.refresh ?? data?.data?.tokens?.refresh;

        if (!newAccessToken) {
          throw new Error("Refresh response did not include an access token");
        }

        localStorage.setItem("betamindToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh", newRefreshToken);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logoutAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const post_requests = async (url: string, data: any, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = { Authorization: `Bearer ${token}` };
  }

  const response = await axiosInstance.post(url, data, { headers });
  return response;
};

export const post_request_with_image = async (
  url: string,
  data: any,
  token = ""
) => {
  let headers = {};
  if (token !== "") {
    headers = { Authorization: `Bearer ${token}` };
  }

  const response = await axiosInstance.post(url, data, {
    headers: { ...headers, "Content-Type": "multipart/form-data" },
  });
  return response;
};

export const post_request_with_image_new = async (
  url: string,
  data: any,
  token = ""
) => {
  let headers = {};
  if (token !== "") {
    headers = { Authorization: `Bearer ${token}` };
  }

  const response = await axiosInstance.post(url, data, {
    headers: { ...headers, "Content-Type": "application/json" },
  });
  return response;
};

export const get_requests = async (url: string, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = { Authorization: `Bearer ${token}` };
  }

  const response = await axiosInstance.get(url, { headers });
  return response;
};

export const delete_requests = async (url: string, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = { Authorization: `Bearer ${token}` };
  }

  const response = await axiosInstance.delete(url, { headers });
  return response;
};

export const put_requests = async (url: string, data: any, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = { Authorization: `Bearer ${token}` };
  }

  const response = await axiosInstance.put(url, data, { headers });
  return response;
};

export const put_request_with_image = async (
  url: string,
  data: FormData | Record<string, any>,
  token = ""
) => {
  const isFormData = data instanceof FormData;
  const headers: any = {};

  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  if (token !== "") {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axiosInstance.put(url, data, { headers });
  return response;
};

export const put_request_with_image_new = async (
  url: string,
  data: FormData | Record<string, any>,
  token = ""
) => {
  const headers: any = {};
  if (token !== "") {
    headers.Authorization = `Bearer ${token}`;
  }
  if (data instanceof FormData) {
    const response = await axiosInstance.put(url, data, { headers });
    return response;
  }

  const response = await axiosInstance.put(url, data, {
    headers: { ...headers, "Content-Type": "application/json" },
  });
  return response;
};

export const patch_requests = async (url: string, data: any, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = { Authorization: `Bearer ${token}` };
  }

  const response = await axiosInstance.patch(url, data, { headers });
  return response;
};

export const post_request_blob = async (url: string, data: any, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await axios.post(
    `${"https://aift-financialreport.onrender.com/api/v1/"}${url}`,
    data,
    { headers, responseType: "blob" }
  );
  return response;
};
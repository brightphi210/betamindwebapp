
import axios from "axios";

const BASE_URL = "https://api.betaminds.online/api/v1/";
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("retirementAccessToken");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
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
  data: FormData,
  token = ""
) => {
  const headers: any = {
    "Content-Type": "multipart/form-data",
  };

  if (token !== "") {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axiosInstance.put(url, data, { headers });
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
    `${'https://aift-financialreport.onrender.com/api/v1/'}${url}`,
    data,
    { headers, responseType: 'blob' } // ← this is the key fix
  );
  return response;
};

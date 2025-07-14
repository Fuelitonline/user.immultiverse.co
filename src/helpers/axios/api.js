import apiClient from "./axiosService";

export const apiRequest = async (method, endpoint, data = {}, headers = {}, params = {}) => {
  try {
    // Check if the data is FormData (usually for file uploads)
    if (data instanceof FormData) {
      // Do not set Content-Type header, as axios will automatically set it to multipart/form-data
      delete headers['Content-Type'];
    } else {
      // Otherwise, assume JSON data and set Content-Type header
      headers['Content-Type'] = 'application/json';
    }

    const response = await apiClient({
      method,
      url: endpoint,
      data,
      headers,
      params,
    });
    
    return { data: response.data, error: null };
  } catch (error) {
    const errorData = error.response ? error.response.data : error.message;
    console.error('API Request Error:', errorData);
    return { data: null, error: errorData };
  }
};

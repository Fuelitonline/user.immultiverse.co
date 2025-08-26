import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../helpers/axios/api';

/**
 * Makes an API call using the provided method and endpoint with optional data, headers, and params.
 *
 * @param {string} method - The HTTP method for the request (GET, POST, PUT, DELETE).
 * @param {string} endpoint - The URL endpoint for the request.
 * @param {Object} [data={}] - Data to send with the request (for POST/PUT requests).
 * @param {Object} [headers={}] - Headers to send with the request.
 * @param {Object} [params={}] - Query parameters to send with the request.
 * @returns {Promise<Object>} - A Promise that resolves to an object with the response data.
 */
export const makeApiCall = async (method, endpoint, data = {}, headers = {}, params = {}) => {
  return apiRequest(method, endpoint, data, headers, params);
};

/**
 * Custom hook for performing GET requests.
 *
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @param {Object} [params={}] - Optional query parameters.
 * @param {Object} [headers={}] - Optional headers.
 * @param {Object} [queryOptions={}] - Optional configuration for the query.
 * @returns {object} - The query result object.
 */
export const useGet = (endpoint, params = {}, headers = {}, queryOptions = {}) => {
  return useQuery({
    queryKey: [endpoint, params],
    queryFn: async () => {
      try {
        const data = await makeApiCall('GET', endpoint, {}, headers, params);
        return data;
      } catch (error) {
        throw new Error(`GET request to ${endpoint} failed: ${error.message}`);
      }
    },
    ...queryOptions,
  });
};

/**
 * Custom hook for performing POST requests.
 *
 * @param {string} endpoint - The API endpoint to post data to.
 * @param {Object} [headers={}] - Optional headers.
 * @param {string|null} [queryKey=null] - Optional query key to invalidate upon success.
 * @returns {object} - The mutation result object.
 */
export const usePost = (endpoint, headers = {}, queryKey = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const isMultipart = data instanceof FormData;
        if (isMultipart) {
          delete headers['Content-Type']; // Let axios set it automatically
        }

        const responseData = await makeApiCall('POST', endpoint, data, headers);
        if (!responseData) throw new Error(`No response data received for ${endpoint}`);
        return responseData;
      } catch (error) {
        throw new Error(`POST request to ${endpoint} failed: ${error.message}`);
      }
    },
    onSuccess: () => {
      if (queryKey) queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      console.error(`POST request error for ${endpoint}:`, error);
    },
  });
};

/**
 * Custom hook for performing PUT requests.
 *
 * @param {string} endpoint - The API endpoint to update data at.
 * @param {Object} [headers={}] - Optional headers.
 * @param {string|null} [queryKey=null] - Optional query key to invalidate upon success.
 * @returns {object} - The mutation result object.
 */
export const usePut = (endpoint, headers = {}, queryKey = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const responseData = await makeApiCall('PUT', endpoint, data, headers);
        return responseData;
      } catch (error) {
        throw new Error(`PUT request to ${endpoint} failed: ${error.message}`);
      }
    },
    onSuccess: () => {
      if (queryKey) queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      console.error(`PUT request error for ${endpoint}: ${error.message}`);
    },
  });
};

/**
 * Custom hook for performing DELETE requests.
 *
 * @param {string} endpoint - The API endpoint to delete data from.
 * @param {Object} [headers={}] - Optional headers.
 * @param {string|null} [queryKey=null] - Optional query key to invalidate upon success.
 * @returns {object} - The mutation result object.
 */
export const useDelete = (endpoint, headers = {}, queryKey = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      try {
        const responseData = await makeApiCall('DELETE', endpoint, {}, headers, params);
        return responseData;
      } catch (error) {
        throw new Error(`DELETE request to ${endpoint} failed: ${error.message}`);
      }
    },
    onSuccess: () => {
      if (queryKey) queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      console.error(`DELETE request error for ${endpoint}: ${error.message}`);
    },
  });
};

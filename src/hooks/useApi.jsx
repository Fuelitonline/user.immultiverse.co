import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiRequest } from '../helpers/axios/api';
import decryptResponseData from '../utils/decryption';

/**
 * Makes an API call using the provided method and endpoint with optional data, headers, and params.
 *
 * @param {string} method - The HTTP method for the request (GET, POST, PUT, DELETE).
 * @param {string} endpoint - The URL endpoint for the request.
 * @param {Object} [data={}] - Data to send with the request (for POST/PUT requests).
 * @param {Object} [headers={}] - Headers to send with the request.
 * @param {Object} [params={}] - Query parameters to send with the request.
 * @returns {Promise<Object>} - A Promise that resolves to an object with the response data and error.
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
  return useQuery(
    [endpoint, params],
    async () => {
      try {
        const data = await makeApiCall('GET', endpoint, {}, headers, params);
       return data// Return data here
      } catch (error) {
        throw new Error(`GET request to ${endpoint} failed: ${error.message}`);
      }
    },
    queryOptions
  );
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

  return useMutation(
    async (data) => {
      try {
        // Check if data is FormData (file upload)
        const isMultipart = data instanceof FormData;

        // If it's multipart data, make sure Content-Type is not manually set
        if (isMultipart) {
          delete headers['Content-Type'];  // Let axios set the appropriate multipart/form-data header
        }

        const responseData = await makeApiCall('POST', endpoint, data, headers);
       
       
        
        return responseData
        
      } catch (error) {
        throw new Error(`POST request to ${endpoint} failed: ${error.message}`);
      }
    },
    {
      onSuccess: (data) => {
        if (queryKey) {
          queryClient.invalidateQueries(queryKey);
        }
        return data;
      },
      onError: (error) => {
        console.error(`POST request error: ${error.message}`);
      },
    }
  );
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

  return useMutation(
    async (data) => {
      try {
        const responseData = await makeApiCall('PUT', endpoint, data, headers);
       
  
       
        
        return responseData
      } catch (error) {
        throw new Error(`PUT request to ${endpoint} failed: ${error.message}`);
      }
    },
    {
      onSuccess: (data) => {
        if (queryKey) {
          queryClient.invalidateQueries(queryKey);
        }
        return data; // Return data here
      },
      onError: (error) => {
        // Handle the error as needed
        console.error(`PUT request error: ${error.message}`);
      },
    }
  );
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

  return useMutation(
    async (params) => {
      try {
        console.log('params', params)
        const responseData = await makeApiCall('DELETE', endpoint, {}, headers, params);
         return responseData
      } catch (error) {
        throw new Error(`DELETE request to ${endpoint} failed: ${error.message}`);
      }
    },
    {
      onSuccess: (data) => {
        if (queryKey) {
          queryClient.invalidateQueries(queryKey);
        }
        return data; // Return data here
      },
      onError: (error) => {
        // Handle the error as needed
        console.error(`DELETE request error: ${error.message}`);
      },
    }
  );
};

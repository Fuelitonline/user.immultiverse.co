import { useMutation } from "@tanstack/react-query";
import apiClient from "../helpers/axios/axiosService";

export const useDownloadSalaryPDF = () => {
  return useMutation({
    mutationFn: async (slipId) => {
      const response = await apiClient.get(
        `/company/salery/download-salary-slip-pdf/${slipId}`,
        {
          responseType: "arraybuffer", 
        }
      );

      return response.data;
    },
  });
};

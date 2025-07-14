import { useGet } from "../../hooks/useApi"

export const getProjects = async() =>  {
  return useGet('/project/all',{},{}, {queryKey:'projects'});

} 
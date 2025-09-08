import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useGet, usePost } from '../../hooks/useApi';
import { toast, ToastContainer } from 'react-toastify';
import ProfileNav from '../../components/user/profiveNav';
import Loading from '../../../public/Loading/Index';
import { Country, State, City } from 'country-state-city';
import { useAuth } from '../../middlewares/auth';
import AddEmployeeForm from './AddEmployeeForm';
import EmployeeView from './EmployeeView';
import DepartmentForm from './DepartmentForm';

function Employeestab() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [departmentModal, setDepartmentModal] = useState(false);
  const [departmentHead, setDepartmentHead] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [employee, setEmployee] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [treeView, setTreeView] = useState(false);
  const [openIncentive, setOpenIncentive] = useState(false);

  const { mutateAsync: createEmployee, isLoading: isCreatingEmployee } = usePost('employee/create');
  const { mutateAsync: createDepartment, isLoading: isCreatingDepartment } = usePost('department/create');
  const {
    data: employees,
    refetch: refetchEmployees,
    isLoading,
  } = useGet('employee/all', {}, {}, { queryKey: 'employees' });
  const {
    data: departmentsData,
    refetch: refetchDepartments,
    isLoading: isLoadingDepartment,
  } = useGet('department/all', {}, {}, { queryKey: 'departments' });

  useEffect(() => {
    const countryOptions = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountries(countryOptions);
  }, []);

  useEffect(() => {
    if (employees?.data?.message && departmentsData?.data?.message) {
      setEmployee(employees?.data?.message[0]);
      setDepartments(departmentsData?.data?.message[0]);
    }
  }, [employees, departmentsData]);

  const totalPages = Math.ceil(employee?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = employee?.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getManagers = () => employee?.filter((emp) => emp?.role === 'Manager') || [];

  return (
    <Box sx={{ width: '83%', display: 'flex', flexDirection: 'column', gap: '0rem' }}>
      {(isLoading || isLoadingDepartment || isCreatingEmployee || isCreatingDepartment) && <Loading />}
      <ToastContainer />
      <Grid container spacing={1} p={0}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <ProfileNav />
        </Grid>
      </Grid>
      <Grid mt="0rem">
        <EmployeeView
          user={user}
          currentEmployees={currentEmployees}
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          treeView={treeView}
          setTreeView={setTreeView}
          employee={employee}
          openIncentive={openIncentive}
          setOpenIncentive={setOpenIncentive}
          handleEmployeeModal={() => setOpenModal(true)}
          handleDepartmentModal={() => setDepartmentModal(true)}
        />
      </Grid>
      <AddEmployeeForm
        openModal={openModal}
        setOpenModal={setOpenModal}
        createEmployee={createEmployee}
        isCreatingEmployee={isCreatingEmployee}
        refetchEmployees={refetchEmployees}
        countries={countries}
        states={states}
        cities={cities}
        setStates={setStates}
        setCities={setCities}
        departments={departments}
        getManagers={getManagers}
      />
      <DepartmentForm
        departmentModal={departmentModal}
        setDepartmentModal={setDepartmentModal}
        departmentHead={departmentHead}
        setDepartmentHead={setDepartmentHead}
        departmentName={departmentName}
        setDepartmentName={setDepartmentName}
        createDepartment={createDepartment}
        refetchDepartments={refetchDepartments}
        employee={employee}
      />
    </Box>
  );
}

export default Employeestab;
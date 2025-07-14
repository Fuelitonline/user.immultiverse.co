import React, { useEffect, useState } from 'react';
import { useGet } from '../../../hooks/useApi';
import { useParams } from 'react-router-dom';
import notfound from '../../../../src/assets/images/not-found.jpg';
import EmployeeList from '../../../pages/EmployeesPage/listView/emplyoee/EmployeeList';
import { Grid, styled } from '@mui/material';
import Loading from '../../../../public/Loading/Index';
import { useAuth } from '../../../middlewares/auth';

// Custom styled component for EmployeeList
const CustomEmployeeListGrid = styled(Grid)(({ theme }) => ({
  width: '100%', // Adjust width as needed
  overflow: 'auto',
  '& .MuiTable-root': {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  '& .MuiTableCell-root': {
    padding: '12px',
    fontSize: '14px',
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

function TeamMember() {
  const { user } = useAuth();
  const id = user?._id;
  const [teamMembers, setTeamMembers] = useState([]);
  const { data, isLoading } = useGet('employee/get-team-members', {
    employeeId: user?._id,
  });

  useEffect(() => {
    if (data?.data?.data) {
      setTeamMembers(data?.data?.data);
    }
  }, [data]);

  return (
    <>
      {isLoading && <Loading />}
      {teamMembers?.length < 1 && (
        <img src={notfound} alt="not found" height={300} width={300} />
      )}
      {teamMembers?.length > 0 && (
        <CustomEmployeeListGrid>
          <EmployeeList employees={teamMembers} />
        </CustomEmployeeListGrid>
      )}
    </>
  );
}

export default TeamMember;
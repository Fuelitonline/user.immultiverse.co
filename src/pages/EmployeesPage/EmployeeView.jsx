import React from 'react';
import { Grid, IconButton, Pagination, PaginationItem, Tooltip, Typography, useTheme } from '@mui/material';
import Add from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableChartIcon from '@mui/icons-material/TableChart';
import GlassEffect from '../../theme/glassEffect';
import EmployeeList from './listView/emplyoee/EmployeeList';
import TreeView from '../Profile/TreeView';
import IncantiveFormDialog from '../Profile/IncantivesCreation/IncantiveForm';

const EmployeeView = ({
  user,
  currentEmployees,
  totalPages,
  currentPage,
  handlePageChange,
  treeView,
  setTreeView,
  employee,
  openIncentive,
  setOpenIncentive,
  handleEmployeeModal,
  handleDepartmentModal,
}) => {
  const theme = useTheme();

  return (
    <GlassEffect.GlassContainer>
      <Grid
        sx={{
          fontFamily: 'Montserrat',
          margin: '0 1rem',
          mt: '0.5rem',
          maxHeight: '80vh',
          overflow: 'hidden',
          padding: '1rem',
          
        }}
      >
        <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Grid sx={{ width: '60%', display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleEmployeeModal}
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: '15px',
                padding: '8px 25px',
                ml: 1,
                '&:hover': { backgroundColor: '#7de8ca' },
              }}
            >
              <Add sx={{ color: 'white', fontSize: '18px' }} />
              <Typography sx={{ ml: 1, color: 'white', fontWeight: '200' }}>
                Add Employee
              </Typography>
            </IconButton>
            <Tooltip title="Change View">
              <IconButton
                onClick={() => setTreeView(!treeView)}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '15px',
                  padding: '8px 25px',
                  '&:hover': { backgroundColor: '#7de8ca' },
                }}
              >
                {treeView ? <TableChartIcon sx={{ color: 'white' }} /> : <AccountTreeIcon sx={{ color: 'white' }} />}
              </IconButton>
            </Tooltip>
            {(user?.role === 'superAdmin' || user?.role === 'admin') && (
              <IconButton
                onClick={() => setOpenIncentive(true)}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '15px',
                  padding: '8px 25px',
                  '&:hover': { backgroundColor: '#7de8ca' },
                }}
              >
                <Typography sx={{ ml: 1, color: 'white', fontWeight: '200' }}>
                  Create Incentive Model
                </Typography>
              </IconButton>
            )}
            {(user?.role === 'superAdmin' || user?.role === 'admin') && (
              <IconButton
                onClick={handleDepartmentModal}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '15px',
                  padding: '8px 25px',
                  '&:hover': { backgroundColor: '#7de8ca' },
                }}
              >
                <Add sx={{ color: 'white', fontSize: '18px' }} />
                <Typography sx={{ ml: 1, color: 'white', fontWeight: '200' }}>
                  Add Department
                </Typography>
              </IconButton>
            )}
          </Grid>
          {!treeView && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              sx={{ mt: 0, display: 'flex', justifyContent: 'flex-end', mb: 0, mr: 5 }}
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  component="button"
                  sx={{
                    borderRadius: '50%',
                    backgroundColor: item.page === currentPage ? '#398bf7' : '#ced1d6',
                    color: item.page === currentPage ? '#398bf7' : '#000',
                    '&:hover': { bgcolor: item.page === currentPage ? '#398bf7' : '#398bf7' },
                    mb: 1,
                  }}
                />
              )}
            />
          )}
        </Grid>
        {!treeView && <EmployeeList employees={currentEmployees} />}
        {treeView && <TreeView employee={employee} />}
      </Grid>
      <IncantiveFormDialog open={openIncentive} setOpen={setOpenIncentive} />
    </GlassEffect.GlassContainer>
  );
};

export default EmployeeView;
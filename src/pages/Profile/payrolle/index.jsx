import React  from 'react';
import PayrollChart from './payrollPolicy';
import { Box, Grid } from '@mui/system';
import SalesDonutChart from './payrollePaiChart';
import SalesSummaryCard from './payInfo';
import { useGet, usePost } from '../../../hooks/useApi';
import { useParams } from 'react-router-dom';
import GlassEffect from '../../../theme/glassEffect';
function Payrolle() {
  const id = useParams().id
  const {data , isLoading} = useGet('/company/payroll/get', {
    employeeId : id
})

  const {data:sales} = useGet('/company/payroll/total-sales-data', {
      employeeId : id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
  })
  const {data:salesSelf} = useGet('/company/payroll/total-sales', {
    employeeId : id,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
})
  

  return (
      <>
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",

      }}>
        {data?.data?.data?.targetSalesAmount ? (
           <GlassEffect.GlassContainer>
             <Box sx={{ display: "flex", flexDirection: "row",gap:"1rem", width: "100%", height: "70vh", padding: "1rem"}}>
             <Grid width={"65%"}>
             
             <PayrollChart/>
            
             </Grid>
             <Grid width={"40%"}>
              <SalesDonutChart sales = {sales} data = {data}/>
             </Grid>
           </Box>
           </GlassEffect.GlassContainer>
        ): (null)}
      
        <Grid sx={{
          mt:"-1rem",
        }}>
          <SalesSummaryCard data = {data} sales = {salesSelf}/>
        </Grid>
        </Box>
      </>
  )
}

export default Payrolle

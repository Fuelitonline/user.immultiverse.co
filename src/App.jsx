import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import OfflineAlert from './OfflineAlert';
import Navbar from './navbar/nav.jsx';
import { LoginPage, RagisterUser } from './pages/auth';
// import Employees from './pages/employee/index.jsx';
import { PrivateRoute } from './middlewares/auth';
import UserInformation from './components/user/ragistartion/UserInformation'
import AdminRoute from './middlewares/auth/AdminRoute';
// import EmplyoeeDetails from './pages/employee/details';
// import Calender from './pages/calender/index.jsx';
import BirthDay from './BirthDay';
import { useGet } from './hooks/useApi';
import TokenExpire from './TokenExpire';
import Tearms from './pages/TearmAndCondition/Tearms';
import PrivacyPolicy from './pages/TearmAndCondition/Privecy';
import NotFound404 from './NotFound.jsx';
import IntegrationShowcase from './pages/Interegation/index.jsx';
import IntegrationDetail from './pages/Interegation/Details.jsx';
import AdminBankSettings from './pages/setting/Setting.jsx';
import Candidates from './pages/Recruiters/Candidates.jsx';
import Incentive from './pages/Organisation/Incentive/Incentive.jsx';
import EmployeeTable from './pages/Attendence/attendenceAndLeave/EmployeeTable.jsx'
import Departments from './pages/Department/gridView/departments/index.jsx';
import LeaveBucket from './pages/BucketList/Leavebucket.jsx';
import Employeestab from './pages/EmployeesPage/Employeetab.jsx';
import DashboardPage from './pages/MainDashboard/Dashboard.jsx';
import LeavePage from './pages/MainLeave/LeavePage.jsx';
import PayrollPage from './pages/MainPayroll/PayrollPage.jsx';
import ProfilePage from './pages/MainProfile/Profile.jsx';
import { Calendar } from 'react-big-calendar';
import MainCalender from './pages/calender/MainCalender.jsx';
import DocumentsPage from './pages/Documents/Documents.jsx';
import ChangePassword from './pages/Change Password/Password.jsx';
import Attendance from './pages/MainAttendance/Attendence.jsx';
import EmployeeReimbursement from './pages/reimbursement/Reimbursement.jsx';

const Nav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  return  currentPath === '/login' || currentPath === '/register' || currentPath === '/tearms&conditions' || currentPath === '/privacy&policy' || currentPath === '/404' ? null : <Navbar />;
}


const App = () => {
  const [isEvent, setIsEvent] = useState(false);
  const { data: events } = useGet('events/today-events');  // Your hook to fetch events
  const { data: isAuth } = useGet('health');  // Your hook to fetch events
  const [showBirthday, setShowBirthday] = useState(false);

  // Function to clear localStorage at midnight
  const clearLocalStorageAtMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);  // Set time to midnight (12:00 AM) today

    const timeUntilMidnight = midnight.getTime() - now.getTime();

    // Set a timeout to clear localStorage at midnight
    setTimeout(() => {
      localStorage.removeItem('isEvent');
      localStorage.removeItem('isBirthdayShown'); // Clear birthday flag at midnight
      setIsEvent(false);  // Optionally reset state
      console.log('Cleared isEvent and isBirthdayShown from localStorage at midnight');
    }, timeUntilMidnight);
  };

  // Handle setting the `isEvent` flag in localStorage
  useEffect(() => {
    const storedIsEvent = localStorage.getItem('isEvent');
    if (storedIsEvent) {
      setIsEvent(true);
    } else {
      setIsEvent(false);
    }

    // Set the isEvent flag after 10 seconds if not already set
    if (!storedIsEvent) {
      setTimeout(() => {
        localStorage.setItem('isEvent', true);
        setIsEvent(true);
      }, 10000);
    }

    // Clear localStorage at midnight
    clearLocalStorageAtMidnight();

    // Check if the birthday should be shown from localStorage
    const birthdayShown = localStorage.getItem('isBirthdayShown');
    if (!birthdayShown && events?.data?.data?.length > 0) {
      setShowBirthday(true);
      localStorage.setItem('isBirthdayShown', 'true');  // Mark that the birthday has been shown

      // Set a timer to hide the birthday after 10 seconds
      setTimeout(() => {
        setShowBirthday(false);
      }, 10000);  // 10 seconds
    }
  }, [events]);

  // Force re-check birthday on route change (using useLocation hook)
  const location = useLocation();
  
  useEffect(() => {
    const birthdayShown = localStorage.getItem('isBirthdayShown');
    if (!birthdayShown && events?.data?.data?.length > 0) {
      setShowBirthday(true);
      localStorage.setItem('isBirthdayShown', 'true');  // Mark birthday as shown

      // Hide birthday after 10 seconds
      setTimeout(() => {
        setShowBirthday(false);
      }, 15000);
    }
  }, [location, events]); // Trigger when the route changes

  return (
    <>
      {showBirthday ? (
        <BirthDay events={events?.data?.data} />
      ) : (
        <>
          <OfflineAlert />
         {/* {(isAuth?.error?.message ===  "Invalid or expired token." || isAuth?.error?.message ===  'Authentication  is required.' ) && (location.pathname !== '/login' && location.pathname !== '/register') ? <TokenExpire/> : null} */}
          <Nav />
          <Routes>
            
            <Route path="/" element={<PrivateRoute>< DashboardPage/></PrivateRoute>} />
            <Route path="/Document" element={<PrivateRoute>< DocumentsPage/></PrivateRoute>} />
            <Route path="/profile" element= {<PrivateRoute><ProfilePage/></PrivateRoute> } />
            <Route path="/profileleave" element={<PrivateRoute>< LeavePage/></PrivateRoute>} />
            <Route path="/profileattendance" element={<PrivateRoute><Attendance/></PrivateRoute>}/>
            <Route path="/profilepayroll" element={<PrivateRoute>< PayrollPage/></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><MainCalender /></PrivateRoute>} />
            <Route path="/register" element={<RagisterUser />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path='/reimbursement' element={<EmployeeReimbursement/>}/>
            <Route path="/profilechange-password" element={< ChangePassword/> }/>
            <Route path="/employees/Attendance" element={< EmployeeTable/>}/>
            <Route path="/employees/Departments" element={<Departments />}/>
            <Route path="/employees/Employees" element={<Employeestab />}/>
            <Route path="/bucketleave" element={<LeaveBucket />}/>
            <Route path="/candidates" element={< Candidates />}/>
            <Route path="/incentive" element={<Incentive />} />
            <Route path="/employees/:route" element={<PrivateRoute><AdminRoute></AdminRoute></PrivateRoute>} />
            <Route path="/tearms&conditions" element={< Tearms/>} />
            <Route path="/privacy&policy" element={< PrivacyPolicy/>} />
            <Route path="/404" element={<NotFound404 />} />
            <Route path="/new" element={<UserInformation />} />
            <Route path="/settings" element={<AdminBankSettings />} />
              <Route path="/integration" element={<IntegrationShowcase />} />
              <Route path="/integration/:name" element={<IntegrationDetail />} />
          </Routes>
        </>
      )}
    </>
  );
};

export default App;

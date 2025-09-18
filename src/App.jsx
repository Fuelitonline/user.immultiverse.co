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
import AnnouncementDetail from "./pages/announcement/AnnouncementDetail.jsx";

const Nav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  return currentPath === '/login' || currentPath === '/register' || currentPath === '/tearms&conditions' || currentPath === '/privacy&policy' || currentPath === '/404' ? null : <Navbar />;
}


const App = () => {
  const [isEvent, setIsEvent] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const locations = useLocation();
  const isAuthPage =
    locations.pathname === "/login" || locations.pathname === "/register";

  // Ab APIs ko conditionally enable kar
  const { data: events } = useGet("events/today-events", {}, {}, {
    enabled: !isAuthPage
  });

  const { data: isAuth } = useGet("health", {}, {}, {
    enabled: !isAuthPage
  });

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
            <Route path="/register" element={<RagisterUser />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/404" element={<NotFound404 />} />

            {/* Protected portal routes */}
            <Route element={<PrivateRoute currentPortal="user" />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/Document" element={<DocumentsPage />} />
              <Route path="/tearms&conditions" element={<Tearms />} />
              <Route path="/privacy&policy" element={<PrivacyPolicy />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profileleave" element={<LeavePage />} />
              <Route path="/profileattendance" element={<Attendance />} />
              <Route path="/profilepayroll" element={<PayrollPage />} />
              <Route path="/calendar" element={<MainCalender />} />
              <Route path="/reimbursement" element={<EmployeeReimbursement />} />
              <Route path="/profilechange-password" element={<ChangePassword />} />
              <Route path="/employees/Attendance" element={<EmployeeTable />} />
              <Route path="/employees/Departments" element={<Departments />} />
              <Route path="/employees/Employees" element={<Employeestab />} />
              <Route path="/bucketleave" element={<LeaveBucket />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/incentive" element={<Incentive />} />
              <Route path="/announcements/:id" element={<AnnouncementDetail />} />
              <Route path="/new" element={<UserInformation />} />
              <Route path="/settings" element={<AdminBankSettings />} />
              <Route path="/integration" element={<IntegrationShowcase />} />
              <Route path="/integration/:name" element={<IntegrationDetail />} />
            </Route>

            {/* Example admin-only route */}
            <Route
              path="/employees/:route"
              element={
                <PrivateRoute>
                  <AdminRoute />
                </PrivateRoute>
              }
            />
          </Routes>

        </>
      )}
    </>
  );
};

export default App;

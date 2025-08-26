import React, { useState } from "react";
import CalendarView from "./calenderView";
import Activities from "./Activities";
import ProfileNav from '../../components/user/profiveNav';
import { useAuth } from "../../middlewares/auth/authContext";
import moment from "moment";

function MainCalender() {
  const [currentMonth, setCurrentMonth] = useState(moment().month() + 1);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const [selected, setSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openFeedback, setOpenFeedback] = useState(null);
  const { user } = useAuth();

  const handleToggleFeedback = (id) => {
    setOpenFeedback((prev) => (prev === id ? null : id));
  };

  const handlePopoverOpen = (event, file, id) => {
    setSelected(id);
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
    setFeedback("");
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleTimes = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <div className=" mx-auto min-h-screen py-5 px-5 pr-8">
      <ProfileNav />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-30">
        <div className="col-span-1 lg:col-span-8">
          <div className="bg-white/20 rounded-[20px] shadow-lg backdrop-blur-xl border border-gray-200/80 overflow-hidden">
            <div className="w-full h-[calc(100%-50px)]">
              <CalendarView
                size={{ width: "100%", height: "80vh" }}
                getTimes={handleTimes}
                handlePopoverOpen={handlePopoverOpen}
                openFeedbackIndex={openFeedback}
                handleToggleFeedback={handleToggleFeedback}
                handlePopoverClose={handlePopoverClose}
                handleFeedbackChange={handleFeedbackChange}
                loading={loading}
                feedback={feedback}
              />
            </div>
          </div>
        </div>
        <div className="col-span-1  AQ lg:col-span-4">
          <Activities
            currentMonth={currentMonth}
            currentYear={currentYear}
            user={user}
            handleToggleFeedback={handleToggleFeedback}
            openFeedback={openFeedback}
            handlePopoverOpen={handlePopoverOpen}
            handlePopoverClose={handlePopoverClose}
            handleFeedbackChange={handleFeedbackChange}
            loading={loading}
            feedback={feedback}
          />
        </div>
      </div>
    </div>
  );
}

export default MainCalender;
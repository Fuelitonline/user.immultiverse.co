/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

const localizer = momentLocalizer(moment);

const EventComponent = ({ event }) => (
  <div className="">
    <Typography className="text-center">{event.teamMember}</Typography>
    <Typography className="text-center">{event.title}</Typography>
  </div>
);

const CalendarComponent = ({ events, onEventClick }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <Typography
        variant="h5"
        className="calendar-title text-white font-semibold">
        Calendar
      </Typography>
      <div>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={{ month: true, week: true, day: true }}
          defaultView={Views.MONTH}
          style={{ height: 500 }}
          components={{
            event: EventComponent,
          }}
          onSelectEvent={onEventClick}
        />
      </div>
    </div>
  );
};

export default CalendarComponent;

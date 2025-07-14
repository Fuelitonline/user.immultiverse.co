import { useState } from "react";
import { usePost } from "../../../hooks/useApi";
import PropTypes from 'prop-types'; 
const GetLeaveStatusAndAction = ({employee, date, leaves, updated}) => {
    // Find the leave request for the given employee and date
    const leave = leaves?.data?.data?.find((leave) => {
        // Normalize the leave date to a comparable format (just the date part)
        const leaveDate = new Date(leave.date).toISOString().split('T')[0]; // "YYYY-MM-DD" format
        return leaveDate === date && leave.employeeId === employee._id;
    });
    const handleUpdateLeave = usePost("/employee/leave/update");
    // Define colors based on leave status
    const getColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'green';  // Color for approved leave
            case 'Rejected':
                return 'red';    // Color for rejected leave
            case 'Pending':
                return 'yellow'; // Color for pending leave
            default:
                return 'gray';   // Default color
        }
    };

    // Hover state for showing popover
    const [showPopover, setShowPopover] = useState(false);

    // Handle the approval and rejection actions (update the status in your system)
 const handleAction = async (_id, action) => {
    const leaveDetails = {
        _id,
        status: action
      };
      const res = await handleUpdateLeave.mutateAsync(leaveDetails);

      if (res.data !== null) {
        updated();
      }
 }

    return (
        <>
            {leave ? (
                <div
                    style={{
                        display: 'inline-block',
                        position: 'relative',
                        padding: '10px',
                        backgroundColor: getColor(leave.status),
                        color: leave?.status === 'Pending' ? 'black' : 'white',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                    className="leave-status"
                    onMouseEnter={() => setShowPopover(true)} // Show popover on hover
                    onMouseLeave={() => setShowPopover(false)} // Hide popover when hover ends
                >
                    <span>{leave.status}</span>

                    {/* Popover for Pending Requests */}
                    {leave.status === 'Pending' && showPopover && (
                        <div
                            className="popover"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: '0',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                padding: '10px',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                zIndex: '1000',
                                width: '150px',
                                textAlign: 'center',
                            }}
                        >
                             <p style={{
                                 fontSize: '12px',
                                 fontWeight: 'bold',
                                 marginBottom: '5px',
                                 textAlign:'left'
                             }}>
                                {leave?.reason}
                             </p>
                            <button
                                onClick={() => handleAction(leave._id, 'Approved')}
                                style={{
                                    backgroundColor: 'green',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '5px',
                                    marginBottom: '5px',
                                    cursor: 'pointer',
                                    width: '100%',
                                }}
                            >
                                ✔️ Approve
                            </button>
                            <br />
                            <button
                                onClick={() => handleAction(leave._id, 'Rejected')}
                                style={{
                                    backgroundColor: 'red',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '5px',
                                    cursor: 'pointer',
                                    width: '100%',
                                }}
                            >
                                ❌ Reject
                            </button>
                        </div>
                    )}
                </div>
            ) : null}
        </>
    );
};

GetLeaveStatusAndAction.propTypes = {
    employee: PropTypes.shape({
        _id: PropTypes.string.isRequired,
    }).isRequired,
    date: PropTypes.string.isRequired,
    leaves: PropTypes.shape({
        data: PropTypes.shape({
            data: PropTypes.arrayOf(
                PropTypes.shape({
                    _id: PropTypes.string.isRequired,
                    employeeId: PropTypes.string.isRequired,
                    date: PropTypes.string.isRequired,
                    status: PropTypes.string.isRequired,
                    reason: PropTypes.string.isRequired,
                })
            ),
        }),
    })
}
export default GetLeaveStatusAndAction;
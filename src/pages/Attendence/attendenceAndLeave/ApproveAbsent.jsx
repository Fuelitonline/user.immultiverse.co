import { useState, useRef, useEffect } from "react";
import { usePost } from "../../../hooks/useApi";
import { useAuth } from "../../../middlewares/auth";
import PropTypes from 'prop-types'; 

/**
 * ApproveAbsent component for managing employee absence approval
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data object
 * @param {string} props.employee._id - Unique identifier of the employee
 * @param {string} props.date - Date of the absence in string format
 * @param {Function} props.approved - Callback function to execute after approval
 * @returns {JSX.Element} Rendered component with approval button
 */
const ApproveAbsent = ({status, employee, date, approved,request}) => {
    const {user} = useAuth();
    const { mutate: saveRecord, isLoading: isSavingRecord } = usePost('employee/work-tracking/save', {}, 'dailyRecords');
    
    const [isPopoverVisible, setIsPopoverVisible] = useState(false); // State for popover visibility
    const popoverRef = useRef(null); // Ref for the popover element

    // Close popover if user clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsPopoverVisible(false); // Close popover if clicked outside
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    /**
     * Handles the approval action for an employee's absence
     * @async
     * @function
     * @param {string} _id - Employee's unique identifier
     * @param {string} action - Action to perform ('Approved')
     * @returns {Promise<void>}
     */
    const handleAction = async (_id, action) => {
        try { 

            if(action === 'Present Approvel Request' || action === 'Absent Approvel Request'){
                const save = await saveRecord({
                    employeeId: employee._id,
                    requestedBy: user._id,
                    requestFor : action,
                    date: date,
                });
            }else if(action === 'Present Approvel'){rejectedBy
                const save = await saveRecord({
                    employeeId: employee._id,
                    approvedBy: user._id,
                    date: date,
                });
            }else if(action === 'Absent Approvel'){
                const save = await saveRecord({
                    employeeId: employee._id,
                    rejectedBy: user._id,
                    date: date,
                });
            }
                
            
            
            approved();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div
                style={{
                    display: 'inline-block',
                    position: 'relative',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',

                    transition: 'all 0.3s ease',
                }}
                className="leave-status"
                onClick={() => setIsPopoverVisible(!isPopoverVisible)} // Toggle popover visibility
            >
                <div
                    className="popover"
                    ref={popoverRef} // Attach the ref to the popover element
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        borderRadius: '8px',
                        background: '#ffffff', // White background for the popover
                        padding: '12px',
                        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                        zIndex: '1000',
                        width: '180px',
                        textAlign: 'center',
                        display: isPopoverVisible ? 'block' : 'none', // Conditionally render based on visibility
                        border: '1px solid #ddd', // Subtle border around popover
                    }}
                >
                    {status === 'Absent' ? (
                        <>
                          {!request &&   <button
                                onClick={() => handleAction(employee._id, 'Present Approvel Request')}
                                style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 0',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    borderRadius: '10px',
                                    width: '100%',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Request For Approval
                            </button>}
                         {request &&    <button
                                onClick={() => handleAction(employee._id, 'PresentApproved')}
                                style={{
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 0',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    borderRadius: '10px',
                                    width: '100%',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Mark As Present
                            </button>}
                        </>
                    ) : (
                        <>
                      {!request &&   <button
                            onClick={() => handleAction(employee._id, 'Absent Approvel Request')}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '12px 0',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                borderRadius: '10px',
                                width: '100%',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Request For Absent
                        </button>}
                         {request &&  <button
                          onClick={() => handleAction(employee._id, 'Absent Approved')}
                          style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '12px 0',
                              marginBottom: '10px',
                              cursor: 'pointer',
                              borderRadius: '10px',
                              width: '100%',
                              fontWeight: 'bold',
                              transition: 'all 0.3s ease',
                          }}
                      >
                          Mark As Absent
                      </button>}
                      </>
                    )}
                </div>
            </div>
        </>
    );
};

/**
 * PropTypes for the ApproveAbsent component
 * @type {Object}
 */
ApproveAbsent.propTypes = {
    employee: PropTypes.shape({
        _id: PropTypes.string.isRequired, // Unique identifier for the employee
    }).isRequired,
    date: PropTypes.string.isRequired, // Date of the absence to be approved
    approved: PropTypes.func.isRequired, // Callback function to be called after successful approval
};

export default ApproveAbsent;



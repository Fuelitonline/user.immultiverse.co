import React, { useEffect, useState } from 'react';
import bgImage from '../../../../src/assets/images/5040007.jpg'
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * The RegisterSuccess component is used to display a success message
 * after a user has successfully registered.
 *
 * The component displays a background image, an overlay with a semi-transparent
 * black background, and a white form container with a centered svg icon.
 * The svg icon is animated and displays a checkmark when the component is
 * rendered.
 *
 * The component also displays a heading and a paragraph of text. The heading
 * says "Successfully Register" and the paragraph says "To continue, please
 * return Login page".
 *
 * The component also includes a link to the login page.
 *
 * @return {ReactElement} The RegisterSuccess component.
 */

const RegisterSuccess = () => {
    const [userData, setUserData] = useState(null)
    useEffect(() => {
      let user =   localStorage.getItem('user') 
       
      setUserData(JSON.parse(user))
     
    })

    const backgroundContainerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 2,
      };
    
      const overlayStyle = {
        position: 'absolulte',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1,
      };
    
      const formContainerStyle = {
        position: 'absolute',
        zIndex: 999,
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      };
  return (
    <div style={backgroundContainerStyle}>
      <div style={overlayStyle} />
    <div style={formContainerStyle}>
      <style>
        {`
          body {
            font-family: sans-serif;
            background: white;
            color: #808080;
            text-align: center;
          }

          .animation-ctn {
            text-align: center;
            margin-top: 5em;
          }

          @-webkit-keyframes checkmark {
            0% {
              stroke-dashoffset: 100px;
            }
            100% {
              stroke-dashoffset: 200px;
            }
          }

          @-ms-keyframes checkmark {
            0% {
              stroke-dashoffset: 100px;
            }
            100% {
              stroke-dashoffset: 200px;
            }
          }

          @keyframes checkmark {
            0% {
              stroke-dashoffset: 100px;
            }
            100% {
              stroke-dashoffset: 0px;
            }
          }

          @-webkit-keyframes checkmark-circle {
            0% {
              stroke-dashoffset: 480px;
            }
            100% {
              stroke-dashoffset: 960px;
            }
          }

          @-ms-keyframes checkmark-circle {
            0% {
              stroke-dashoffset: 240px;
            }
            100% {
              stroke-dashoffset: 480px;
            }
          }

          @keyframes checkmark-circle {
            0% {
              stroke-dashoffset: 480px;
            }
            100% {
              stroke-dashoffset: 960px;
            }
          }

          @keyframes colored-circle {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 100;
            }
          }

          .inlinesvg .svg svg {
            display: inline;
          }

          .icon--order-success svg polyline {
            -webkit-animation: checkmark 0.25s ease-in-out 0.7s backwards;
            animation: checkmark 0.25s ease-in-out 0.7s backwards;
          }

          .icon--order-success svg circle {
            -webkit-animation: checkmark-circle 0.6s ease-in-out backwards;
            animation: checkmark-circle 0.6s ease-in-out backwards;
          }

          .icon--order-success svg circle#colored {
            -webkit-animation: colored-circle 0.6s ease-in-out 0.7s backwards;
            animation: colored-circle 0.6s ease-in-out 0.7s backwards;
          }

          h1 {
            margin-top: 25px;
            font-size: 18px;
            font-family: sans-serif;
          }

          p {
            margin-top: 15px;
            font-size: 14px;
            font-family: sans-serif;
          }
        `}
      </style>
      <div className="animation-ctn">
        <div className="icon icon--order-success svg">
          <svg xmlns="http://www.w3.org/2000/svg" width="154px" height="154px">
            <g fill="none" stroke="#22AE73" strokeWidth="2">
              <circle cx="77" cy="77" r="72" style={{ strokeDasharray: '480px, 480px', strokeDashoffset: '960px' }}></circle>
              <circle id="colored" fill="#22AE73" cx="77" cy="77" r="72" style={{ strokeDasharray: '480px, 480px', strokeDashoffset: '960px' }}></circle>
              <polyline className="st0" stroke="#fff" strokeWidth="10" points="43.5,77.8 63.7,97.9 112.2,49.4" style={{ strokeDasharray: '100px, 100px', strokeDashoffset: '200px' }} />
            </g>
          </svg>
        </div>
      </div>
      <div>
        <h1>Successfully 
        Register</h1>
        <h1>Workplace ID: <strong>{userData?.data}</strong>. Share this ID with your employees to allow them to log in to the workplace.</h1>

        
        <p>To continue, please return Login page</p>
      </div>
      <Grid item xs={12} style={{ marginTop: '10px', textAlign: 'center' }}>
              <Typography variant="body2">
                 <Link to="/login">Login here</Link>
              </Typography>
            </Grid>
    </div>
    </div>
    
  );
}

export default RegisterSuccess;

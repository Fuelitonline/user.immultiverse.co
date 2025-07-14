// actionCreators.js

import {
    SET_EMAIL,
    SET_PHONE_NUMBER,
    SET_PASSWORD
} from '../../constents/userRagistration/index.js';


/**
 * Sets the email in the user registration state
 * @param {string} email - Email address of the user
 * @returns {{type: string, payload: string}} - Action with type SET_EMAIL and email as payload
  * Sets the phone number in the user registration state
 * @param {string} phoneNumber - Phone number of the user
 * @returns {{type: string, payload: string}} - Action with type SET_PHONE_NUMBER and phone number as payload
 * 
 *  * @param {string} password - Password of the user
 * @returns {{type: string, payload: string}} - Action with type SET_PASSWORD and password as payload
 */

export const setEmail = (email) => ({
    type: SET_EMAIL,
    payload: email
});


export const setPhoneNumber = (phoneNumber) => ({
    type: SET_PHONE_NUMBER,
    payload: phoneNumber
});


export const setPassword = (password) => ({
    type: SET_PASSWORD,
    payload: password
});



// userRegistrationReducer.js

import {
    SET_EMAIL,
    SET_PHONE_NUMBER,
    SET_PASSWORD,
    SET_COMPANY_NAME,
    SET_COMPANY_ADDRESS
} from '../../constents/userRagistration/index.js';

const initialState = {
    email: '',
    phoneNumber: '',
    password: '',
    companyName: '',
    companyAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    }
};

export const userRegistrationReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_EMAIL:
            return {
                ...state,
                email: action.payload
            };
        case SET_PHONE_NUMBER:
            return {
                ...state,
                phoneNumber: action.payload
            };
        case SET_PASSWORD:
            return {
                ...state,
                password: action.payload
            };
        case SET_COMPANY_NAME:
            return {
                ...state,
                companyName: action.payload
            };
        case SET_COMPANY_ADDRESS:
            return {
                ...state,
                companyAddress: action.payload
            };
        default:
            return state;
    }
};

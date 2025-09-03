import React, { createContext, useContext, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer } from '../components/CustomToast';

const ToastContext = createContext();

// Action types
const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';

// Reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case ADD_TOAST:
      return [...state, { ...action.payload }];
    case REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.id);
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (message, type = 'info') => {
    const id = uuidv4();
    dispatch({
      type: ADD_TOAST,
      payload: { id, message, type }
    });
    return id;
  };

  const removeToast = (id) => {
    dispatch({ type: REMOVE_TOAST, id });
  };

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

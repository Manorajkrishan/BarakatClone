// Validation utility functions for forms
import { useState } from 'react';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 50) return 'Name must be less than 50 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return '';
};

export const validateAddress = (address) => {
  if (!address) return 'Address is required';
  if (address.length < 10) return 'Please enter a complete address';
  if (address.length > 200) return 'Address is too long';
  return '';
};

export const validateProductName = (name) => {
  if (!name) return 'Product name is required';
  if (name.length < 3) return 'Product name must be at least 3 characters long';
  if (name.length > 100) return 'Product name must be less than 100 characters';
  return '';
};

export const validateProductPrice = (price) => {
  if (!price) return 'Price is required';
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return 'Price must be a valid number';
  if (numPrice <= 0) return 'Price must be greater than 0';
  if (numPrice > 999999) return 'Price is too high';
  return '';
};

export const validateProductDescription = (description) => {
  if (!description) return 'Description is required';
  if (description.length < 10) return 'Description must be at least 10 characters long';
  if (description.length > 1000) return 'Description must be less than 1000 characters';
  return '';
};

export const validateCategoryName = (name) => {
  if (!name) return 'Category name is required';
  if (name.length < 2) return 'Category name must be at least 2 characters long';
  if (name.length > 50) return 'Category name must be less than 50 characters';
  return '';
};

export const validateQuantity = (quantity) => {
  if (!quantity) return 'Quantity is required';
  const numQuantity = parseInt(quantity);
  if (isNaN(numQuantity)) return 'Quantity must be a valid number';
  if (numQuantity <= 0) return 'Quantity must be greater than 0';
  if (numQuantity > 1000) return 'Quantity is too high';
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
  });

  return { isValid, errors };
};

// Real-time validation hook
export const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    if (validationRules[name]) {
      const rules = validationRules[name];
      for (const rule of rules) {
        const error = rule(value, values);
        if (error) {
          return error;
        }
      }
    }
    return '';
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return isValid;
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

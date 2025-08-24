// Validation utility functions
export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { valid: false, message: 'Email is required' };
    if (!emailRegex.test(email)) return { valid: false, message: 'Invalid email format' };
    return { valid: true };
  },

  // Password validation
  password: (password) => {
    if (!password) return { valid: false, message: 'Password is required' };
    if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
    return { valid: true };
  },

  // Required field validation
  required: (value, fieldName) => {
    if (!value || value.trim() === '') {
      return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true };
  },

  // Phone number validation
  phone: (phone) => {
    if (!phone) return { valid: false, message: 'Phone number is required' };
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { valid: false, message: 'Invalid phone number format' };
    }
    return { valid: true };
  },

  // Date validation
  date: (date) => {
    if (!date) return { valid: false, message: 'Date is required' };
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { valid: false, message: 'Invalid date format' };
    }
    return { valid: true };
  },

  // Number validation
  number: (value, fieldName) => {
    if (!value) return { valid: false, message: `${fieldName} is required` };
    if (isNaN(value) || value <= 0) {
      return { valid: false, message: `${fieldName} must be a positive number` };
    }
    return { valid: true };
  },

  // URL validation
  url: (url) => {
    if (!url) return { valid: true }; // URL is optional
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Invalid URL format' };
    }
  }
};

// Form validation function
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];

    fieldRules.forEach(rule => {
      const result = rule(value, field);
      if (!result.valid) {
        errors[field] = result.message;
        return; // Stop checking this field after first error
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const commonRules = {
  email: [validators.required, validators.email],
  password: [validators.required, validators.password],
  fullName: [validators.required],
  phone: [validators.required, validators.phone],
  dateOfBirth: [validators.required, validators.date],
  address: [validators.required],
  city: [validators.required],
  province: [validators.required],
  postalCode: [validators.required],
  occupation: [validators.required],
  educationLevel: [validators.required],
  contactPreference: [validators.required],
  title: [validators.required],
  content: [validators.required],
  location: [validators.required],
  startDate: [validators.required, validators.date],
  endDate: [validators.required, validators.date]
};

// Sanitize input data
export const sanitizeInput = (data) => {
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim();
    } else {
      sanitized[key] = data[key];
    }
  });

  return sanitized;
};

// Format validation error messages
export const formatValidationErrors = (errors) => {
  return Object.values(errors).join(', ');
};

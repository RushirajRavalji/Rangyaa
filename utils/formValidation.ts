// Form validation utilities

// Interface for form field errors
export interface FormFieldError {
  field: string;
  message: string;
}

// Validate a required field
export const validateRequired = (value: string, fieldName: string): FormFieldError | null => {
  if (!value || value.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`
    };
  }
  return null;
};

// Validate an email field
export const validateEmail = (value: string): FormFieldError | null => {
  if (!value) {
    return {
      field: 'email',
      message: 'Email is required'
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      field: 'email',
      message: 'Please enter a valid email address'
    };
  }
  
  return null;
};

// Apply error styles to form fields
export const applyFieldErrorStyles = (fieldId: string, error: boolean): void => {
  const field = document.getElementById(fieldId);
  if (field) {
    if (error) {
      field.classList.add('error-field');
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('error-field');
      field.removeAttribute('aria-invalid');
    }
  }
};

// Show validation messages
export const showValidationMessage = (fieldId: string, message: string | null): void => {
  const field = document.getElementById(fieldId);
  if (field) {
    // Find or create error message element
    let errorElement = document.getElementById(`${fieldId}-error`);
    if (!errorElement && message) {
      errorElement = document.createElement('div');
      errorElement.id = `${fieldId}-error`;
      errorElement.className = 'error-message';
      errorElement.setAttribute('aria-live', 'polite');
      
      // Insert error message after the field
      if (field.nextSibling) {
        field.parentNode?.insertBefore(errorElement, field.nextSibling);
      } else {
        field.parentNode?.appendChild(errorElement);
      }
    }
    
    if (errorElement) {
      if (message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      } else {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }
  }
};

// Validate a form field and show error if invalid
export const validateField = (
  value: string, 
  fieldId: string, 
  validationFn: (value: string, fieldName: string) => FormFieldError | null,
  fieldName: string
): boolean => {
  const error = validationFn(value, fieldName);
  applyFieldErrorStyles(fieldId, !!error);
  showValidationMessage(fieldId, error ? error.message : null);
  return !error;
};

// Validate a form on submit
export const validateForm = (formValues: Record<string, string>, validations: Record<string, (value: string, fieldName: string) => FormFieldError | null>): boolean => {
  let isValid = true;
  
  // Check each field with its validation function
  Object.entries(validations).forEach(([field, validationFn]) => {
    const value = formValues[field] || '';
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();
    const error = validationFn(value, fieldName);
    
    applyFieldErrorStyles(field, !!error);
    showValidationMessage(field, error ? error.message : null);
    
    if (error) {
      isValid = false;
    }
  });
  
  return isValid;
}; 
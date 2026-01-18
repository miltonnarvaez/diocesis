import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import './FormField.css';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  validation = null,
  errorMessage = '',
  helpText = '',
  maxLength = null,
  showCharCount = false,
  icon: Icon = null,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');

  // Validación en tiempo real
  useEffect(() => {
    if (touched && value !== undefined && value !== null) {
      validateField(value);
    } else {
      setIsValid(null);
      setError('');
    }
  }, [value, touched, validation]);

  const validateField = (val) => {
    if (required && (!val || val.trim() === '')) {
      setIsValid(false);
      setError('Este campo es obligatorio');
      return false;
    }

    if (val && validation) {
      const result = validation(val);
      if (result !== true) {
        setIsValid(false);
        setError(result || 'Valor inválido');
        return false;
      }
    }

    if (val && type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setIsValid(false);
        setError('Ingrese un email válido');
        return false;
      }
    }

    if (val && type === 'tel') {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(val)) {
        setIsValid(false);
        setError('Ingrese un teléfono válido');
        return false;
      }
    }

    if (val && maxLength && val.length > maxLength) {
      setIsValid(false);
      setError(`Máximo ${maxLength} caracteres`);
      return false;
    }

    if (val || required) {
      setIsValid(true);
      setError('');
      return true;
    }

    setIsValid(null);
    setError('');
    return true;
  };

  const handleBlur = (e) => {
    setTouched(true);
    validateField(value);
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    onChange(e);
    if (touched) {
      validateField(e.target.value);
    }
  };

  return (
    <div className={`form-field ${isValid === false ? 'form-field-error' : ''} ${isValid === true ? 'form-field-valid' : ''}`}>
      <label htmlFor={name} className="form-field-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      <div className="form-field-wrapper">
        {Icon && (
          <div className="form-field-icon-left">
            <Icon />
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            maxLength={maxLength}
            className={`form-field-input ${Icon ? 'form-field-input-with-icon' : ''}`}
            rows={props.rows || 4}
            {...props}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            maxLength={maxLength}
            className={`form-field-input ${Icon ? 'form-field-input-with-icon' : ''}`}
            {...props}
          />
        )}
        
        {isValid !== null && (
          <div className="form-field-icon-right">
            {isValid ? (
              <FaCheckCircle className="form-field-icon-valid" />
            ) : (
              <FaExclamationCircle className="form-field-icon-error" />
            )}
          </div>
        )}
      </div>

      {showCharCount && maxLength && (
        <div className="form-field-char-count">
          {value?.length || 0} / {maxLength}
        </div>
      )}

      {helpText && !error && (
        <div className="form-field-help">
          <FaInfoCircle /> {helpText}
        </div>
      )}

      {error && (
        <div className="form-field-error-message">
          {error}
        </div>
      )}

      {errorMessage && !error && (
        <div className="form-field-error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default FormField;

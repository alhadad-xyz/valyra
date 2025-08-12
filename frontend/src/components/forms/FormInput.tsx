import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { CreateListingFormData } from '../../lib/validationSchemas';

interface FormInputProps {
  name: keyof CreateListingFormData;
  label: string;
  register: UseFormRegister<CreateListingFormData>;
  error?: FieldError;
  type?: 'text' | 'email' | 'url' | 'number' | 'password';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  step?: string;
  min?: number;
  max?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  register,
  error,
  type = 'text',
  placeholder,
  helperText,
  required = false,
  step,
  min,
  max,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        {...register(name, { valueAsNumber: type === 'number' })}
        className={`
          block w-full rounded-lg border px-3 py-2 text-sm
          transition-colors duration-200 focus:outline-none focus:ring-2
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
          }
        `}
      />
      
      {helperText && !error && (
        <p className="text-xs text-gray-600">{helperText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
};
import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { CreateListingFormData } from '../../lib/validationSchemas';

interface FormSelectProps {
  name: keyof CreateListingFormData;
  label: string;
  register: UseFormRegister<CreateListingFormData>;
  error?: FieldError;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  register,
  error,
  options,
  placeholder = 'Select an option',
  helperText,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={name}
        {...register(name)}
        className={`
          block w-full rounded-lg border px-3 py-2 text-sm
          transition-colors duration-200 focus:outline-none focus:ring-2
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
          }
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helperText && !error && (
        <p className="text-xs text-gray-600">{helperText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
};
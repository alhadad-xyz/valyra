import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { CreateListingFormData } from '../../lib/validationSchemas';

interface FormCheckboxProps {
  name: keyof CreateListingFormData;
  label: string;
  register: UseFormRegister<CreateListingFormData>;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  label,
  register,
  error,
  helperText,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <input
          id={name}
          type="checkbox"
          {...register(name)}
          className={`
            mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 
            focus:ring-blue-500 focus:ring-2
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />
        
        <div className="flex-1 min-w-0">
          <label htmlFor={name} className="block text-sm font-medium text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {helperText && !error && (
            <p className="mt-1 text-xs text-gray-600">{helperText}</p>
          )}
          
          {error && (
            <p className="mt-1 text-xs text-red-600">{error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
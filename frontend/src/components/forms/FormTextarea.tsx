import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { CreateListingFormData } from '../../lib/validationSchemas';

interface FormTextareaProps {
  name: keyof CreateListingFormData;
  label: string;
  register: UseFormRegister<CreateListingFormData>;
  error?: FieldError;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  label,
  register,
  error,
  placeholder,
  helperText,
  required = false,
  rows = 4,
  maxLength,
}) => {
  const [charCount, setCharCount] = React.useState(0);

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {maxLength && (
          <span className="float-right text-xs text-gray-500">
            {charCount}/{maxLength}
          </span>
        )}
      </label>
      
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        {...register(name)}
        onChange={(e) => {
          setCharCount(e.target.value.length);
          register(name).onChange(e);
        }}
        className={`
          block w-full rounded-lg border px-3 py-2 text-sm
          transition-colors duration-200 focus:outline-none focus:ring-2
          resize-vertical min-h-[100px]
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
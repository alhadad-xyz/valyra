import React from 'react';
import { UseFormRegister, FieldError, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateListingFormData } from '../../lib/validationSchemas';

interface FormDateRangeProps {
  name: keyof CreateListingFormData;
  label: string;
  register: UseFormRegister<CreateListingFormData>;
  setValue: UseFormSetValue<CreateListingFormData>;
  watch: UseFormWatch<CreateListingFormData>;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
}

export const FormDateRange: React.FC<FormDateRangeProps> = ({
  name,
  label,
  register,
  setValue,
  watch,
  error,
  helperText,
  required = false,
}) => {
  const currentValue = watch(name) as { start: Date; end: Date } | undefined;

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value ? new Date(e.target.value) : undefined;
    setValue(name, {
      start: startDate,
      end: currentValue?.end
    } as any);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value ? new Date(e.target.value) : undefined;
    setValue(name, {
      start: currentValue?.start,
      end: endDate
    } as any);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get minimum end date (start date + 1 day)
  const minEndDate = currentValue?.start 
    ? new Date(currentValue.start.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : today;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hidden inputs for form registration */}
      <input
        type="hidden"
        {...register(`${name}.start` as any)}
        value={currentValue?.start?.toISOString() || ''}
      />
      <input
        type="hidden"
        {...register(`${name}.end` as any)}
        value={currentValue?.end?.toISOString() || ''}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label htmlFor={`${name}-start`} className="block text-xs text-gray-600 mb-1">
            Start Date
          </label>
          <input
            id={`${name}-start`}
            type="date"
            min={today}
            value={formatDateForInput(currentValue?.start)}
            onChange={handleStartDateChange}
            className={`
              block w-full rounded-lg border px-3 py-2 text-sm
              transition-colors duration-200 focus:outline-none focus:ring-2
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              }
            `}
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor={`${name}-end`} className="block text-xs text-gray-600 mb-1">
            End Date
          </label>
          <input
            id={`${name}-end`}
            type="date"
            min={minEndDate}
            value={formatDateForInput(currentValue?.end)}
            onChange={handleEndDateChange}
            className={`
              block w-full rounded-lg border px-3 py-2 text-sm
              transition-colors duration-200 focus:outline-none focus:ring-2
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              }
            `}
          />
        </div>
      </div>

      {helperText && !error && (
        <p className="text-xs text-gray-600">{helperText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
};
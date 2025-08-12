import React, { useState } from 'react';
import { UseFormRegister, FieldError, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreateListingFormData } from '../../lib/validationSchemas';

interface FormMultiSelectProps {
  name: keyof CreateListingFormData;
  label: string;
  register: UseFormRegister<CreateListingFormData>;
  setValue: UseFormSetValue<CreateListingFormData>;
  watch: UseFormWatch<CreateListingFormData>;
  error?: FieldError;
  options: string[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  maxSelections?: number;
}

export const FormMultiSelect: React.FC<FormMultiSelectProps> = ({
  name,
  label,
  register,
  setValue,
  watch,
  error,
  options,
  placeholder = 'Type to add technologies...',
  helperText,
  required = false,
  maxSelections = 15,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentValues = (watch(name) as string[]) || [];

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase()) &&
    !currentValues.includes(option)
  );

  const addItem = (item: string) => {
    if (!currentValues.includes(item) && currentValues.length < maxSelections) {
      const newValues = [...currentValues, item];
      setValue(name, newValues as any);
    }
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const removeItem = (item: string) => {
    const newValues = currentValues.filter(value => value !== item);
    setValue(name, newValues as any);
  };

  const handleCustomAdd = () => {
    if (inputValue.trim() && !currentValues.includes(inputValue.trim()) && currentValues.length < maxSelections) {
      addItem(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        addItem(filteredOptions[0]);
      } else {
        handleCustomAdd();
      }
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <span className="float-right text-xs text-gray-500">
          {currentValues.length}/{maxSelections}
        </span>
      </label>

      {/* Hidden input for form registration */}
      <input
        type="hidden"
        {...register(name)}
        value={currentValues.join(',')}
      />

      {/* Selected items */}
      {currentValues.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-lg border-gray-300">
          {currentValues.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field with dropdown */}
      <div className="relative">
        <input
          type="text"
          placeholder={currentValues.length >= maxSelections ? 'Maximum reached' : placeholder}
          value={inputValue}
          disabled={currentValues.length >= maxSelections}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className={`
            block w-full rounded-lg border px-3 py-2 text-sm
            transition-colors duration-200 focus:outline-none focus:ring-2
            ${currentValues.length >= maxSelections ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
            }
          `}
        />

        {/* Dropdown */}
        {isDropdownOpen && inputValue && currentValues.length < maxSelections && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => addItem(option)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  {option}
                </button>
              ))
            ) : inputValue.trim() ? (
              <button
                type="button"
                onClick={handleCustomAdd}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-blue-600"
              >
                Add "{inputValue.trim()}"
              </button>
            ) : null}
          </div>
        )}
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
import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  CreateListingFormData, 
  listingValidationSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  INDUSTRY_OPTIONS,
  TECH_STACK_OPTIONS
} from '../../lib/validationSchemas';
import { BusinessStructure } from '../../types/backendTypes';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormMultiSelect,
  FormCheckbox,
  FormDateRange,
  FileUpload
} from './index';

interface EditListingFormProps {
  onSubmit: (data: CreateListingFormData) => Promise<void>;
  initialData: Partial<CreateListingFormData>;
  isSubmitting?: boolean;
  listingId: number;
}

type FormStep = 1 | 2 | 3 | 4;

const STEPS = [
  { number: 1, title: 'Company Information', schema: step1Schema },
  { number: 2, title: 'Financial Details', schema: step2Schema },
  { number: 3, title: 'Additional Details', schema: step3Schema },
  { number: 4, title: 'Documents & Review', schema: step4Schema },
] as const;

export const EditListingForm: React.FC<EditListingFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  listingId
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  // Load saved draft from localStorage with unique key for editing
  const loadSavedDraft = (): Partial<CreateListingFormData> => {
    try {
      const saved = localStorage.getItem(`listing-edit-draft-${listingId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        if (parsed.investmentTimeline) {
          parsed.investmentTimeline = {
            start: new Date(parsed.investmentTimeline.start),
            end: new Date(parsed.investmentTimeline.end)
          };
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load saved draft:', error);
      localStorage.removeItem(`listing-edit-draft-${listingId}`);
    }
    return {};
  };

  const savedDraft = loadSavedDraft();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    trigger,
    getValues,
    reset,
  } = useForm<CreateListingFormData>({
    resolver: yupResolver(listingValidationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      industry: '',
      businessDescription: '',
      location: '',
      website: '',
      logo: '',
      annualRevenue: 0,
      monthlyRevenue: 0,
      growthRate: 0,
      netProfit: 0,
      grossMargin: 0,
      churnRate: 0,
      askingPrice: 0,
      customerAcquisitionCost: 0,
      lifetimeValue: 0,
      customerBase: '',
      employeeCount: 0,
      foundedYear: new Date().getFullYear(),
      techStack: [],
      operatingExpenses: 0,
      businessStructure: BusinessStructure.LLC,
      registeredAddress: '',
      taxId: '',
      gdprCompliant: false,
      dealStructure: 'Asset',
      minimumInvestment: 0,
      investmentTimeline: {
        start: new Date(),
        end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      documents: [],
      ...initialData,
      ...savedDraft
    }
  });

  // Reset form with initial data when it changes (run only once)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const defaultValues = {
        companyName: '',
        industry: '',
        businessDescription: '',
        location: '',
        website: '',
        logo: '',
        annualRevenue: 0,
        monthlyRevenue: 0,
        growthRate: 0,
        netProfit: 0,
        grossMargin: 0,
        churnRate: 0,
        askingPrice: 0,
        customerAcquisitionCost: 0,
        lifetimeValue: 0,
        customerBase: '',
        employeeCount: 0,
        foundedYear: new Date().getFullYear(),
        techStack: [],
        operatingExpenses: 0,
        businessStructure: BusinessStructure.LLC,
        registeredAddress: '',
        taxId: '',
        gdprCompliant: false,
        dealStructure: 'Asset' as const,
        minimumInvestment: 0,
        investmentTimeline: {
          start: new Date(),
          end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        documents: [],
        ...initialData,
        ...savedDraft
      };
      
      reset(defaultValues);
    }
  }, [listingId, reset]); // Only depend on listingId to prevent infinite loops

  // Auto-save functionality with unique key for editing
  const saveDraft = async (silent: boolean = false) => {
    try {
      if (!silent) setIsAutoSaving(true);
      
      const formData = getValues();
      // Don't save documents to localStorage (too large)
      const { documents, ...dataToSave } = formData;
      
      localStorage.setItem(`listing-edit-draft-${listingId}`, JSON.stringify(dataToSave));
      setLastSaved(new Date());
      
      if (!silent) {
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    } catch (error) {
      console.warn('Failed to save draft:', error);
      if (!silent) setIsAutoSaving(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(`listing-edit-draft-${listingId}`);
    setLastSaved(null);
  };

  // Set up auto-save interval
  useEffect(() => {
    if (isDirty) {
      autoSaveInterval.current = setTimeout(() => {
        saveDraft(true);
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
    };
  }, [isDirty]); // Remove watch() from dependencies to prevent infinite loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
    };
  }, []);

  // Warn user before leaving if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save draft with Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isDirty) {
        e.preventDefault();
        saveDraft(false);
      }
      
      // Navigate steps with Ctrl/Cmd + Arrow keys
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'ArrowLeft' && currentStep > 1) {
          e.preventDefault();
          previousStep();
        } else if (e.key === 'ArrowRight' && currentStep < 4) {
          e.preventDefault();
          nextStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, currentStep]);

  const onSubmitForm: SubmitHandler<CreateListingFormData> = async (data) => {
    await onSubmit(data);
    // Clear draft after successful submission
    clearDraft();
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const currentStepSchema = STEPS[currentStep - 1].schema;
    try {
      await currentStepSchema.validate(watch(), { abortEarly: false });
      return true;
    } catch (error) {
      await trigger();
      return false;
    }
  };

  const nextStep = async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid && currentStep < 4) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const goToStep = async (step: FormStep) => {
    if (step <= currentStep || completedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  const getStepStatus = (step: FormStep) => {
    if (completedSteps.has(step)) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  // Form step components (same as CreateListingForm)
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="companyName"
          label="Company Name"
          register={register}
          error={errors.companyName}
          placeholder="e.g., AI-Powered CRM"
          helperText="A short, descriptive name for your business"
          required
        />
        
        <FormSelect
          name="industry"
          label="Industry"
          register={register}
          error={errors.industry}
          options={INDUSTRY_OPTIONS.map(industry => ({ value: industry, label: industry }))}
          required
        />
      </div>

      <FormTextarea
        name="businessDescription"
        label="Business Description"
        register={register}
        error={errors.businessDescription}
        placeholder="Describe your business model, target market, and key differentiators..."
        helperText="Provide a comprehensive overview of your business (50-2000 characters)"
        maxLength={2000}
        rows={6}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="location"
          label="Business Location"
          register={register}
          error={errors.location}
          placeholder="e.g., San Francisco, CA, USA"
          helperText="Primary business location or headquarters"
          required
        />

        <FormInput
          name="website"
          label="Website URL"
          register={register}
          error={errors.website}
          type="url"
          placeholder="https://example.com"
          helperText="Your business website (must be accessible)"
          required
        />
      </div>

      <FormInput
        name="logo"
        label="Logo URL (Optional)"
        register={register}
        error={errors.logo}
        type="url"
        placeholder="https://example.com/logo.png"
        helperText="URL to your business logo (512x512 PNG or SVG preferred)"
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Financial Metrics</h3>
        <p className="text-xs text-blue-700">
          Provide accurate financial information for the last 12 months. This data is crucial for valuation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="annualRevenue"
          label="Annual Recurring Revenue (ARR)"
          register={register}
          error={errors.annualRevenue}
          type="number"
          step="1000"
          placeholder="500000"
          helperText="ARR in USD (last 12 months)"
          required
        />

        <FormInput
          name="monthlyRevenue"
          label="Monthly Recurring Revenue (MRR)"
          register={register}
          error={errors.monthlyRevenue}
          type="number"
          step="1000"
          placeholder="42000"
          helperText="MRR in USD (last complete month)"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormInput
          name="grossMargin"
          label="Gross Margin (%)"
          register={register}
          error={errors.grossMargin}
          type="number"
          step="0.1"
          min={0}
          max={100}
          placeholder="80"
          required
        />

        <FormInput
          name="churnRate"
          label="Monthly Churn Rate (%)"
          register={register}
          error={errors.churnRate}
          type="number"
          step="0.1"
          min={0}
          max={100}
          placeholder="2.5"
          required
        />

        <FormInput
          name="growthRate"
          label="Growth Rate (%)"
          register={register}
          error={errors.growthRate}
          type="number"
          step="0.1"
          placeholder="15"
          helperText="Monthly or annual growth rate"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="netProfit"
          label="Net Profit (USD)"
          register={register}
          error={errors.netProfit}
          type="number"
          step="1000"
          placeholder="200000"
          helperText="Net profit for last 12 months"
          required
        />

        <FormInput
          name="operatingExpenses"
          label="Annual Operating Expenses (USD)"
          register={register}
          error={errors.operatingExpenses}
          type="number"
          step="1000"
          placeholder="300000"
          helperText="Total OpEx including salaries, marketing, etc."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormInput
          name="customerAcquisitionCost"
          label="Customer Acquisition Cost (CAC)"
          register={register}
          error={errors.customerAcquisitionCost}
          type="number"
          step="10"
          placeholder="150"
          helperText="Blended CAC in USD"
          required
        />

        <FormInput
          name="lifetimeValue"
          label="Customer Lifetime Value (LTV)"
          register={register}
          error={errors.lifetimeValue}
          type="number"
          step="10"
          placeholder="2400"
          helperText="Average LTV in USD"
          required
        />

        <FormInput
          name="askingPrice"
          label="Asking Price (USD)"
          register={register}
          error={errors.askingPrice}
          type="number"
          step="10000"
          placeholder="2000000"
          helperText="Your desired sale price"
          required
        />
      </div>

      <FormTextarea
        name="customerBase"
        label="Customer Base Description"
        register={register}
        error={errors.customerBase}
        placeholder="B2B SaaS companies with 10-500 employees in North America"
        helperText="Describe your typical customers and market"
        maxLength={200}
        rows={3}
        required
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-green-900 mb-2">Operational & Legal Details</h3>
        <p className="text-xs text-green-700">
          Additional information about your team, technology, and legal structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormInput
          name="employeeCount"
          label="Employee Count"
          register={register}
          error={errors.employeeCount}
          type="number"
          min={0}
          placeholder="12"
          helperText="Full-time employees (including founders)"
          required
        />

        <FormInput
          name="foundedYear"
          label="Founded Year"
          register={register}
          error={errors.foundedYear}
          type="number"
          min={1950}
          max={new Date().getFullYear()}
          placeholder="2020"
          required
        />

        <FormSelect
          name="businessStructure"
          label="Business Structure"
          register={register}
          error={errors.businessStructure}
          options={[
            { value: BusinessStructure.LLC, label: 'LLC' },
            { value: BusinessStructure.Corp, label: 'Corporation' },
            { value: BusinessStructure.SoleProp, label: 'Sole Proprietorship' }
          ]}
          required
        />
      </div>

      <FormMultiSelect
        name="techStack"
        label="Technology Stack"
        register={register}
        setValue={setValue}
        watch={watch}
        error={errors.techStack as any}
        options={TECH_STACK_OPTIONS}
        placeholder="Type to add technologies..."
        helperText="Select the main technologies powering your business"
        maxSelections={15}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="registeredAddress"
          label="Registered Business Address"
          register={register}
          error={errors.registeredAddress}
          placeholder="123 Business St, City, State, ZIP"
          helperText="Official registered address for legal documents"
          required
        />

        <FormInput
          name="taxId"
          label="Tax ID (Masked)"
          register={register}
          error={errors.taxId}
          placeholder="***-**-1234"
          helperText="Tax ID with only last 4 digits visible for privacy"
          required
        />
      </div>

      <FormCheckbox
        name="gdprCompliant"
        label="GDPR Compliant"
        register={register}
        error={errors.gdprCompliant}
        helperText="Check if your business has implemented GDPR-compliant data handling"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          name="dealStructure"
          label="Deal Structure"
          register={register}
          error={errors.dealStructure}
          options={[
            { value: 'Asset', label: 'Asset Purchase' },
            { value: 'Stock', label: 'Stock Purchase' },
            { value: 'Merger', label: 'Merger' }
          ]}
          helperText="Preferred transaction structure"
          required
        />

        <FormInput
          name="minimumInvestment"
          label="Minimum Investment (USD)"
          register={register}
          error={errors.minimumInvestment}
          type="number"
          step="10000"
          placeholder="100000"
          helperText="Minimum acceptable offer amount"
          required
        />
      </div>

      <FormDateRange
        name="investmentTimeline"
        label="Investment Timeline"
        register={register}
        setValue={setValue}
        watch={watch}
        error={errors.investmentTimeline as any}
        helperText="Preferred timeline for completing the transaction"
        required
      />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-purple-900 mb-2">Due Diligence Documents</h3>
        <p className="text-xs text-purple-700">
          Upload supporting documents for buyer due diligence. All files will be stored securely on IPFS.
        </p>
      </div>

      <FileUpload
        name="documents"
        label="Business Documents"
        register={register}
        setValue={setValue}
        watch={watch}
        error={errors.documents as any}
        helperText="Financial statements, legal documents, customer references, etc. (PDF, DOC, XLS, images)"
        maxFiles={20}
        required
      />

      {/* Form Review Section */}
      <div className="border-t pt-6 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Updated Listing</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Company:</span> {watch('companyName')}
            </div>
            <div>
              <span className="font-medium">Industry:</span> {watch('industry')}
            </div>
            <div>
              <span className="font-medium">ARR:</span> ${watch('annualRevenue')?.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Asking Price:</span> ${watch('askingPrice')?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                type="button"
                onClick={() => goToStep(step.number)}
                aria-label={`Go to step ${step.number}: ${step.title}. Status: ${getStepStatus(step.number)}`}
                aria-current={getStepStatus(step.number) === 'current' ? 'step' : undefined}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none
                  ${getStepStatus(step.number) === 'completed'
                    ? 'bg-green-500 text-white focus:ring-green-500'
                    : getStepStatus(step.number) === 'current'
                    ? 'bg-blue-500 text-white focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-600 focus:ring-gray-300'
                  }
                `}
              >
                {getStepStatus(step.number) === 'completed' ? '✓' : step.number}
              </button>
              
              {index < STEPS.length - 1 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${getStepStatus(step.number) === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-sm text-gray-600">
            Step {currentStep} of {STEPS.length} • Editing Listing #{listingId}
          </p>
          
          {/* Auto-save status */}
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            {isAutoSaving && (
              <span className="text-blue-600 flex items-center gap-1">
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Saving draft...
              </span>
            )}
            {lastSaved && !isAutoSaving && (
              <span className="text-green-600">
                ✓ Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              onClick={() => saveDraft(false)}
              disabled={isAutoSaving || !isDirty}
              className={`
                px-2 py-1 rounded text-xs font-medium transition-colors
                ${!isDirty || isAutoSaving 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                }
              `}
            >
              Save Draft
            </button>
            {lastSaved && (
              <button
                type="button"
                onClick={clearDraft}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear Draft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form 
        onSubmit={handleSubmit(onSubmitForm as any)} 
        className="space-y-8"
        aria-label="Edit listing form"
        role="form"
      >
        <div 
          className="bg-white rounded-xl shadow-sm border p-8"
          role="main"
          aria-live="polite"
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between" role="navigation" aria-label="Form navigation">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 1}
            aria-label={`Go to previous step. Current step: ${currentStep} of ${STEPS.length}`}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none
              ${currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            ← Previous
          </button>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>Use Ctrl+← → for navigation</span>
            <span>•</span>
            <span>Ctrl+S to save draft</span>
          </div>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              aria-label={`Go to next step. Current step: ${currentStep} of ${STEPS.length}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Submit the form to update listing"
              className={`
                px-8 py-2 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none
                ${isSubmitting
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Listing...
                </span>
              ) : (
                'Update Listing'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
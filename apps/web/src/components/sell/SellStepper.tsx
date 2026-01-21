
interface Step {
    label: string;
    status: "completed" | "active" | "pending";
    stepNumber: number;
}

interface SellStepperProps {
    currentStep: number;
}

export function SellStepper({ currentStep }: SellStepperProps) {
    const steps: Step[] = [
        { label: "Basic Info", status: currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "pending", stepNumber: 1 },
        { label: "Tech & Stats", status: currentStep > 2 ? "completed" : currentStep === 2 ? "active" : "pending", stepNumber: 2 },
        { label: "Financials", status: currentStep > 3 ? "completed" : currentStep === 3 ? "active" : "pending", stepNumber: 3 },
        { label: "Pricing", status: currentStep > 4 ? "completed" : currentStep === 4 ? "active" : "pending", stepNumber: 4 },
        { label: "IP Sign", status: currentStep > 5 ? "completed" : currentStep === 5 ? "active" : "pending", stepNumber: 5 },
        { label: "Review", status: currentStep > 6 ? "completed" : currentStep === 6 ? "active" : "pending", stepNumber: 6 },
    ];

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[768px] flex items-center justify-between relative px-4">
                {/* Progress Line Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full"></div>

                {steps.map((step) => (
                    <div key={step.stepNumber} className={`flex flex-col items-center gap-2 relative ${step.status === "pending" ? "opacity-50" : ""}`}>
                        {step.status === "active" && (
                            <div className="absolute -top-12 bg-text-main text-white dark:bg-primary dark:text-white text-[10px] font-bold px-2 py-1 rounded mb-1 animate-bounce whitespace-nowrap">
                                Current Step
                            </div>
                        )}

                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-background-dark shadow-sm z-10
                            ${step.status === "completed" ? "bg-primary" : step.status === "active" ? "bg-white dark:bg-background-dark border-primary" : "bg-gray-200 dark:bg-gray-800"}
                        `}>
                            {step.status === "completed" ? (
                                <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                            ) : step.status === "active" ? (
                                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                            ) : (
                                <span className="text-xs font-bold text-text-muted">{step.stepNumber}</span>
                            )}
                        </div>

                        <p className={`text-xs font-bold uppercase tracking-wider ${step.status === "active" ? "text-primary" : "text-text-muted"}`}>
                            {step.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Test form data auto-fill script
// Open browser console and paste this script to auto-fill the form

function fillCreateListingForm() {
  console.log('🧪 Auto-filling Create Listing form with test data...');

  // Helper function to fill input by name
  const fillInput = (name, value) => {
    const input = document.querySelector(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`);
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✓ Filled ${name}:`, value);
    } else {
      console.log(`⚠️ Could not find input for:`, name);
    }
  };

  // Helper function to check checkbox
  const checkBox = (name, checked = true) => {
    const input = document.querySelector(`input[type="checkbox"][name="${name}"]`);
    if (input) {
      input.checked = checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✓ ${checked ? 'Checked' : 'Unchecked'} ${name}`);
    }
  };

  // Step 1: Company Information
  fillInput('companyName', 'CloudCRM Pro');
  fillInput('industry', 'Software/SaaS');
  fillInput('businessDescription', 'CloudCRM Pro is an AI-powered customer relationship management platform designed specifically for B2B SaaS companies. We help sales teams automate lead qualification, track customer interactions, and predict deal closure probability using machine learning algorithms. Our platform integrates seamlessly with popular tools like Salesforce, HubSpot, and Slack, providing real-time analytics and automated workflows that increase sales efficiency by up to 40%. Founded in 2021, we serve over 150 companies ranging from startups to mid-market businesses, with a focus on the North American and European markets.');
  fillInput('location', '1234 Innovation Drive, Suite 500, San Francisco, CA 94105, USA');
  fillInput('website', 'https://www.cloudcrm-pro.com');
  fillInput('logo', 'https://via.placeholder.com/512x512/4F46E5/white?text=CloudCRM');

  // Step 2: Financial Details
  fillInput('annualRevenue', '2400000');
  fillInput('monthlyRevenue', '200000');
  fillInput('growthRate', '15');
  fillInput('netProfit', '480000');
  fillInput('grossMargin', '85');
  fillInput('churnRate', '2.5');
  fillInput('customerAcquisitionCost', '850');
  fillInput('lifetimeValue', '12500');
  fillInput('askingPrice', '12000000');
  fillInput('operatingExpenses', '1920000');
  fillInput('customerBase', 'B2B SaaS companies with 10-500 employees, primarily in North America and Europe, focusing on sales-driven organizations with complex sales processes');

  // Step 3: Operational & Legal Details
  fillInput('employeeCount', '28');
  fillInput('foundedYear', '2021');
  fillInput('businessStructure', 'LLC');
  fillInput('registeredAddress', '1234 Innovation Drive, Suite 500, San Francisco, CA 94105, USA');
  fillInput('taxId', '***-**-7892');
  checkBox('gdprCompliant', true);
  fillInput('dealStructure', 'Stock');
  fillInput('minimumInvestment', '8000000');

  // Set dates for investment timeline
  const today = new Date();
  const startDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
  const endDate = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000); // +180 days
  
  fillInput('investmentTimeline-start', startDate.toISOString().split('T')[0]);
  fillInput('investmentTimeline-end', endDate.toISOString().split('T')[0]);

  console.log('✅ Form auto-fill completed! You may need to manually:');
  console.log('1. Select technologies from the multi-select dropdown');
  console.log('2. Upload test documents in Step 4');
  console.log('3. Navigate through the form steps');
}

// Instructions
console.log('📋 To auto-fill the Create Listing form:');
console.log('1. Navigate to the Create Listing page');
console.log('2. Run: fillCreateListingForm()');
console.log('3. Manually add technologies and upload files');

// Make function globally available
window.fillCreateListingForm = fillCreateListingForm;
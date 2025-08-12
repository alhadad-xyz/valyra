// Debug helper for form data analysis
// Run this in console to debug form data issues

window.debugFormData = function() {
  console.log('🔍 Debugging form data types and values...');
  
  // Check localStorage
  const stored = localStorage.getItem('mockListings');
  console.log('📦 localStorage mockListings:', stored);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('✅ Parsed localStorage data:', parsed);
    } catch (e) {
      console.error('❌ Error parsing localStorage:', e);
    }
  }
  
  // Check environment
  console.log('🌍 Environment variables:');
  console.log('VITE_ENVIRONMENT:', import.meta.env.VITE_ENVIRONMENT);
  console.log('VITE_IPFS_PROJECT_ID:', import.meta.env.VITE_IPFS_PROJECT_ID ? 'SET' : 'NOT SET');
  
  // Clear localStorage if needed
  window.clearMockData = function() {
    localStorage.removeItem('mockListings');
    console.log('🧹 Cleared mock listings from localStorage');
  };
  
  console.log('💡 Run clearMockData() to clear stored data if needed');
};

console.log('🐛 Debug tools loaded. Run debugFormData() to analyze data.');
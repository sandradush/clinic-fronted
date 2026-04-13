// Debug version of fetchPayments function
// Add this to your Payments.tsx to see what's causing the error

const fetchPayments = async () => {
  try {
    setLoading(true);
    console.log('🔄 Fetching payments from:', 'http://localhost:3001/api/payments');
    
    const response = await fetch('http://localhost:3001/api/payments', {
      headers: {
        'accept': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Raw payment data:', data);
      console.log('📊 Number of payments:', data.length);
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('❌ Expected array but got:', typeof data, data);
        toast.error('Invalid data format received from server');
        return;
      }
      
      // Fetch additional details for each payment
      const paymentsWithDetails = await Promise.all(
        data.map(async (payment, index) => {
          console.log(`🔍 Processing payment ${index + 1}:`, payment);
          
          try {
            // Try to get patient name
            const patientResponse = await fetch(`http://localhost:3001/api/users/${payment.patient_id}`);
            let patient_name = `Patient ${payment.patient_id}`;
            
            console.log(`👤 Patient API response for ID ${payment.patient_id}:`, patientResponse.status);
            
            if (patientResponse.ok) {
              const patientData = await patientResponse.json();
              console.log(`👤 Patient data:`, patientData);
              patient_name = patientData.name || 
                           (patientData.first_name && patientData.last_name ? 
                            `${patientData.first_name} ${patientData.last_name}` : 
                            patient_name);
            } else {
              console.warn(`⚠️ Failed to fetch patient ${payment.patient_id}:`, patientResponse.status);
            }
            
            return {
              ...payment,
              patient_name
            };
          } catch (error) {
            console.error(`❌ Error processing payment ${index + 1}:`, error);
            return {
              ...payment,
              patient_name: `Patient ${payment.patient_id}`
            };
          }
        })
      );
      
      console.log('✅ Final processed payments:', paymentsWithDetails);
      setPayments(paymentsWithDetails);
      toast.success(`Loaded ${paymentsWithDetails.length} payments`);
      
    } else {
      const errorText = await response.text();
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      toast.error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Network/Fetch Error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error('Cannot connect to server. Is your backend running on http://localhost:3001?');
    } else {
      toast.error(`Network error: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};
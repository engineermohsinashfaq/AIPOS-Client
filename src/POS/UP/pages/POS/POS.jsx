import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Truck, User, Users, ClipboardList, TrendingUp } from 'lucide-react';

// --- Local Storage Initialization and Utility Hooks ---

// Mock data structure for demonstration
const initialProducts = [
  { id: 'p1', name: 'Laptop Pro X', basePrice: 1800.00 },
  { id: 'p2', name: 'Smartphone Ultra 15', basePrice: 1150.00 },
  { id: 'p3', name: 'Smart Watch Gen 3', basePrice: 300.00 },
  { id: 'p4', name: 'Wireless Earbuds', basePrice: 150.00 },
];
const initialCustomers = [
  { id: 'c1', name: 'Alice Johnson' },
  { id: 'c2', name: 'Bob Williams' },
  { id: 'c3', name: 'Chris Miller' },
];
const initialGuarantors = [
  { id: 'g1', name: 'Diana Smith' },
  { id: 'g2', name: 'Eric Brown' },
  { id: 'g3', name: 'Fiona Garcia' },
];

const useLocalData = (key, initialValue) => {
  const [data, setData] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing localStorage key:", key, error);
    }
  }, [key, data]);

  return data;
};

// --- Helper Functions ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper function to calculate next month's date
const getNextMonthDate = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  // Handle edge case where adding months rolls over to the next year
  if (d.getDate() !== new Date(date).getDate()) {
    d.setDate(0); // Go to the last day of the previous month
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- Main App Component ---

const POS = () => {
  // 1. Load Data from "Database" (localStorage)
  const products = useLocalData('pos_products', initialProducts);
  const customers = useLocalData('pos_customers', initialCustomers);
  const guarantors = useLocalData('pos_guarantors', initialGuarantors);
  
  // 2. Transaction State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerType, setCustomerType] = useState('cash'); // 'cash' or 'installment'
  const [price, setPrice] = useState(0);
  
  // Installment Specific State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedGuarantorId, setSelectedGuarantorId] = useState('');
  const [planMonths, setPlanMonths] = useState(6); // Default 6 months
  const [commissionRate, setCommissionRate] = useState(10); // Default 10%
  const [timeline, setTimeline] = useState([]);
  const [isTimelineGenerated, setIsTimelineGenerated] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  
  // 3. Derived State (Total Calculations)
  const productBasePrice = useMemo(() => {
    const product = products.find(p => p.id === selectedProductId);
    return product ? product.basePrice : 0;
  }, [selectedProductId, products]);

  const commissionAmount = useMemo(() => {
    if (customerType !== 'installment' || price <= 0) return 0;
    return price * (commissionRate / 100);
  }, [customerType, price, commissionRate]);

  const finalTotal = useMemo(() => {
    return price + commissionAmount;
  }, [price, commissionAmount]);
  
  const monthlyPayment = useMemo(() => {
    if (customerType !== 'installment' || finalTotal <= 0 || planMonths <= 0) return 0;
    return finalTotal / planMonths;
  }, [customerType, finalTotal, planMonths]);

  // 4. Effects (Syncing Price on Product Change)
  useEffect(() => {
    if (selectedProductId) {
      setPrice(productBasePrice);
    } else {
      setPrice(0);
    }
    // Reset timeline generation flag when core inputs change
    setIsTimelineGenerated(false);
  }, [selectedProductId, productBasePrice, customerType]);


  // 5. Handlers
  
  const handleGenerateTimeline = () => {
    if (finalTotal <= 0 || planMonths <= 0) {
      alert("Please ensure price and plan are valid before generating the timeline.");
      return;
    }

    const today = new Date();
    const timelineData = [];

    for (let i = 1; i <= planMonths; i++) {
      timelineData.push({
        dueDate: getNextMonthDate(today, i),
        paymentAmount: monthlyPayment,
        paymentNumber: i,
      });
    }

    setTimeline(timelineData);
    setIsTimelineGenerated(true);
  };
  
  const handleCheckout = () => {
    if (!selectedProductId) {
      setCheckoutMessage("Please select a product before checking out.");
      return;
    }
    
    let transactionDetails = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      product: products.find(p => p.id === selectedProductId)?.name,
      customerType,
      salePrice: price,
      finalTotal: finalTotal,
    };
    
    if (customerType === 'installment') {
      if (!selectedCustomerId || !selectedGuarantorId || !isTimelineGenerated) {
        setCheckoutMessage("Installment sales require a selected customer, guarantor, and a generated payment timeline.");
        return;
      }

      transactionDetails = {
        ...transactionDetails,
        customer: customers.find(c => c.id === selectedCustomerId)?.name,
        guarantor: guarantors.find(g => g.id === selectedGuarantorId)?.name,
        commissionRate: `${commissionRate}%`,
        planMonths: `${planMonths} months`,
        commissionAmount: commissionAmount,
        monthlyPayment: monthlyPayment,
        paymentTimeline: timeline,
      };
    }

    // Log the transaction (in a real app, this would be saved to Firestore)
    console.log("--- Checkout Transaction Details ---", transactionDetails);
    
    // Display success message
    setCheckoutMessage(`Checkout successful! Total: ${formatCurrency(finalTotal)}.`);
    
    // Reset state for a new transaction
    setSelectedProductId('');
    setPrice(0);
    setSelectedCustomerId('');
    setSelectedGuarantorId('');
    setCommissionRate(10);
    setPlanMonths(6);
    setTimeline([]);
    setIsTimelineGenerated(false);
    
    // Clear message after a short delay
    setTimeout(() => setCheckoutMessage(''), 5000);
  };

  // 6. UI Components/Render
  
  const renderCustomerTypeSelection = () => (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => { setCustomerType('cash'); setCheckoutMessage(''); }}
        className={`flex-1 flex items-center justify-center p-4 border rounded-md transition duration-300 ${
          customerType === 'cash' ? 'bg-cyan-800/80 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-cyan-950 border-white/30'
        }`}
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Cash Customer
      </button>
      <button
        onClick={() => { setCustomerType('installment'); setCheckoutMessage(''); }}
        className={`flex-1 flex items-center justify-center p-4 border rounded-md transition duration-300 ${
          customerType === 'installment' ? 'bg-cyan-800/80 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-cyan-950 border-white/30'
        }`}
      >
        <TrendingUp className="w-5 h-5 mr-2" />
        Installment Plan
      </button>
    </div>
  );
  
  const renderInputGroup = ({ label, children }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );

  const renderInstallmentInputs = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer Select */}
        {renderInputGroup({ label: 'Select Installment Customer', children: (
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full p-3 border border-white/30rounded-md focus:ring-cyan-800/80 focus:border-cyan-950 transition"
          >
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )})}
        
        {/* Guarantor Select */}
        {renderInputGroup({ label: 'Select Guarantor', children: (
          <select
            value={selectedGuarantorId}
            onChange={(e) => setSelectedGuarantorId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
          >
            <option value="">-- Select Guarantor --</option>
            {guarantors.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )})}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plan Selection */}
        {renderInputGroup({ label: 'Payment Plan (Months)', children: (
          <select
            value={planMonths}
            onChange={(e) => { setPlanMonths(Number(e.target.value)); setIsTimelineGenerated(false); }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
          >
            {[...Array(24).keys()].map(i => (i + 1)).filter(m => m % 3 === 0).map(m => (
              <option key={m} value={m}>{m} Months</option>
            ))}
          </select>
        )})}
        
        {/* Commission Input */}
        {renderInputGroup({ label: 'Commission Rate (%)', children: (
          <input
            type="number"
            value={commissionRate}
            onChange={(e) => { setCommissionRate(Number(e.target.value)); setIsTimelineGenerated(false); }}
            min="0"
            max="100"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
          />
        )})}
      </div>

      <div className="flex justify-between items-center mb-6 pt-2 border-t border-gray-100 mt-4">
        <div className="text-sm">
          <p className="font-semibold text-gray-800">Total Price (Incl. Commission): {formatCurrency(finalTotal)}</p>
          {finalTotal > 0 && <p className="text-cyan-800/80">Monthly Payment: {formatCurrency(monthlyPayment)}</p>}
        </div>
        <button
          onClick={handleGenerateTimeline}
          disabled={finalTotal <= 0}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-md shadow-md transition disabled:opacity-50 flex items-center"
        >
          <ClipboardList className="w-5 h-5 mr-2" />
          {isTimelineGenerated ? 'Regenerate Timeline' : 'Generate Timeline'}
        </button>
      </div>

      {isTimelineGenerated && renderTimelineTable()}
    </>
  );

  const renderTimelineTable = () => (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
        <Truck className="w-5 h-5 mr-2 text-cyan-500" />
        Payment Timeline ({planMonths} Payments)
      </h3>
      <div className="overflow-x-auto shadow-lg rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeline.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.paymentNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-cyan-800/80">{formatCurrency(item.paymentAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const isCheckoutEnabled = customerType === 'cash' 
    ? selectedProductId !== ''
    : selectedProductId !== '' && selectedCustomerId !== '' && selectedGuarantorId !== '' && isTimelineGenerated;

  return (
    <div className="min-h-screen  p-4 sm:p-8 font-[Inter]">
      <div className="max-w-8xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-10 ">
        <h1 className="text-3xl sm:text-4xl  text-white mb-2 border-b pb-4">POS Transaction</h1>
        <p className="text-gray-500 mb-8">Manage cash and installment sales efficiently.</p>
        
        {/* Customer Type Selection */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-white" /> Customer Type</h2>
        {renderCustomerTypeSelection()}
        
        {/* Product and Price Inputs (Common to both) */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4 pt-4 border-t flex items-center">Product Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderInputGroup({ label: 'Select Product', children: (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
            >
              <option value="" className='bg-black/90' >-- Select Product --</option>
              {products.map(p => (
                <option className='bg-black/90'  key={p.id} value={p.id}>{p.name} ({formatCurrency(p.basePrice)})</option>
              ))}
            </select>
          )})}
          
          {renderInputGroup({ label: 'Selling Price (USD)', children: (
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          )})}
        </div>
        
        {/* Conditional Installment Inputs */}
        {customerType === 'installment' && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><User className="w-5 h-5 mr-2 text-cyan-500" /> Installment Parameters</h2>
            {renderInstallmentInputs()}
          </div>
        )}

        {/* Checkout Section */}
        <div className="mt-10 pt-6 border-t border-white/30 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-lg font-bold text-gray-800 mb-4 sm:mb-0">
            Final Total: <span className="text-cyan-800/80 text-3xl">{formatCurrency(finalTotal)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!isCheckoutEnabled}
            className={`py-3 px-10 rounded-md text-lg transition duration-300 w-full sm:w-auto ${
              isCheckoutEnabled 
                ? 'bg-cyan-800/80 hover:bg-cyan-950 text-white shadow-xl hover:shadow-2xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Check Out
          </button>
        </div>
        
        {/* Checkout Message Box */}
        {checkoutMessage && (
          <div className="mt-4 p-4 rounded-md bg-green-100 text-green-700 border border-green-300 font-medium">
            {checkoutMessage}
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-gray-400">
          *Data is stored in browser's localStorage for demonstration purposes.
        </footer>
      </div>
    </div>
  );
};

export default POS;

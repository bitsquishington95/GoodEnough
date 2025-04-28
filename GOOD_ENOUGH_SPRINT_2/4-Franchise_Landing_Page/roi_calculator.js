/**
 * GOOD ENOUGH™ Market Partner ROI Calculator
 * 
 * This script calculates estimated ROI for potential market partners based on user inputs.
 * It can be embedded in the franchise landing page.
 */

class MarketPartnerROICalculator {
  constructor() {
    // Default values
    this.defaultValues = {
      initialInvestment: 20000,
      monthlyMarketDays: 8,
      dailyRevenue: 6500,
      royaltyRate: 0.08,
      productCostRate: 0.55,
      operationalCostRate: 0.10,
      staffingCostPerDay: 250,
      monthlyOtherCosts: 300
    };
    
    // Initialize with default values
    this.values = { ...this.defaultValues };
    
    // Results storage
    this.results = {};
  }
  
  /**
   * Set a specific input value
   * @param {string} key - The parameter to set
   * @param {number} value - The value to set
   */
  setInput(key, value) {
    if (key in this.values) {
      this.values[key] = parseFloat(value);
    }
  }
  
  /**
   * Reset all inputs to default values
   */
  resetInputs() {
    this.values = { ...this.defaultValues };
  }
  
  /**
   * Calculate ROI and related metrics
   * @returns {Object} Results object with financial projections
   */
  calculate() {
    // Monthly calculations
    const monthlyRevenue = this.values.dailyRevenue * this.values.monthlyMarketDays;
    const royaltyFees = monthlyRevenue * this.values.royaltyRate;
    const productCosts = monthlyRevenue * this.values.productCostRate;
    const operationalCosts = monthlyRevenue * this.values.operationalCostRate;
    const staffingCosts = this.values.staffingCostPerDay * this.values.monthlyMarketDays;
    const otherCosts = this.values.monthlyOtherCosts;
    
    // Total monthly costs
    const totalMonthlyCosts = royaltyFees + productCosts + operationalCosts + staffingCosts + otherCosts;
    
    // Monthly profit
    const monthlyProfit = monthlyRevenue - totalMonthlyCosts;
    
    // Annual profit
    const annualProfit = monthlyProfit * 12;
    
    // ROI percentage
    const roiPercentage = (annualProfit / this.values.initialInvestment) * 100;
    
    // Payback period in months
    const paybackPeriodMonths = this.values.initialInvestment / monthlyProfit;
    
    // Profit margin percentage
    const profitMarginPercentage = (monthlyProfit / monthlyRevenue) * 100;
    
    // Store results
    this.results = {
      monthlyRevenue,
      monthlyProfit,
      annualProfit,
      roiPercentage,
      paybackPeriodMonths,
      profitMarginPercentage,
      breakdown: {
        royaltyFees,
        productCosts,
        operationalCosts,
        staffingCosts,
        otherCosts,
        totalMonthlyCosts
      }
    };
    
    return this.results;
  }
  
  /**
   * Format currency values
   * @param {number} value - The number to format as currency
   * @returns {string} Formatted currency string
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  /**
   * Get formatted results suitable for display
   * @returns {Object} Formatted results
   */
  getFormattedResults() {
    if (Object.keys(this.results).length === 0) {
      this.calculate();
    }
    
    return {
      monthlyRevenue: this.formatCurrency(this.results.monthlyRevenue),
      monthlyProfit: this.formatCurrency(this.results.monthlyProfit),
      annualProfit: this.formatCurrency(this.results.annualProfit),
      roiPercentage: Math.round(this.results.roiPercentage) + '%',
      paybackPeriodMonths: Math.round(this.results.paybackPeriodMonths * 10) / 10 + ' months',
      profitMarginPercentage: Math.round(this.results.profitMarginPercentage) + '%',
      breakdown: {
        royaltyFees: this.formatCurrency(this.results.breakdown.royaltyFees),
        productCosts: this.formatCurrency(this.results.breakdown.productCosts),
        operationalCosts: this.formatCurrency(this.results.breakdown.operationalCosts),
        staffingCosts: this.formatCurrency(this.results.breakdown.staffingCosts),
        otherCosts: this.formatCurrency(this.results.breakdown.otherCosts),
        totalMonthlyCosts: this.formatCurrency(this.results.breakdown.totalMonthlyCosts)
      }
    };
  }
}

/**
 * Initialize the calculator when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  const calculator = new MarketPartnerROICalculator();
  const form = document.getElementById('roi-calculator-form');
  const resultsDiv = document.getElementById('roi-results');
  
  // Initialize form with default values if it exists
  if (form) {
    const inputs = form.querySelectorAll('input[type="number"], input[type="range"]');
    inputs.forEach(input => {
      const key = input.name.replace('roi-', '');
      if (key in calculator.defaultValues) {
        input.value = calculator.defaultValues[key];
      }
    });
    
    // Update results when form is submitted
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get all input values
      const inputs = form.querySelectorAll('input[type="number"], input[type="range"]');
      inputs.forEach(input => {
        const key = input.name.replace('roi-', '');
        calculator.setInput(key, input.value);
      });
      
      // Calculate and display results
      const results = calculator.getFormattedResults();
      displayResults(results);
    });
    
    // Function to display formatted results
    function displayResults(results) {
      if (!resultsDiv) return;
      
      // Create results HTML
      const resultsHTML = `
        <div class="roi-results-container">
          <h3>POTENTIAL RETURNS</h3>
          
          <div class="roi-highlight">
            <div class="roi-highlight-item">
              <span class="roi-label">Monthly Revenue</span>
              <span class="roi-value">${results.monthlyRevenue}</span>
            </div>
            <div class="roi-highlight-item">
              <span class="roi-label">Monthly Profit</span>
              <span class="roi-value">${results.monthlyProfit}</span>
            </div>
            <div class="roi-highlight-item">
              <span class="roi-label">Annual Profit</span>
              <span class="roi-value">${results.annualProfit}</span>
            </div>
          </div>
          
          <div class="roi-metrics">
            <div class="roi-metric-item">
              <span class="roi-label">ROI</span>
              <span class="roi-value">${results.roiPercentage}</span>
            </div>
            <div class="roi-metric-item">
              <span class="roi-label">Payback Period</span>
              <span class="roi-value">${results.paybackPeriodMonths}</span>
            </div>
            <div class="roi-metric-item">
              <span class="roi-label">Profit Margin</span>
              <span class="roi-value">${results.profitMarginPercentage}</span>
            </div>
          </div>
          
          <div class="roi-breakdown">
            <h4>Monthly Cost Breakdown</h4>
            <div class="roi-breakdown-item">
              <span class="roi-label">Product Costs</span>
              <span class="roi-value">${results.breakdown.productCosts}</span>
            </div>
            <div class="roi-breakdown-item">
              <span class="roi-label">Royalty Fees</span>
              <span class="roi-value">${results.breakdown.royaltyFees}</span>
            </div>
            <div class="roi-breakdown-item">
              <span class="roi-label">Operational Costs</span>
              <span class="roi-value">${results.breakdown.operationalCosts}</span>
            </div>
            <div class="roi-breakdown-item">
              <span class="roi-label">Staffing Costs</span>
              <span class="roi-value">${results.breakdown.staffingCosts}</span>
            </div>
            <div class="roi-breakdown-item">
              <span class="roi-label">Other Costs</span>
              <span class="roi-value">${results.breakdown.otherCosts}</span>
            </div>
            <div class="roi-breakdown-item roi-total">
              <span class="roi-label">Total Costs</span>
              <span class="roi-value">${results.breakdown.totalMonthlyCosts}</span>
            </div>
          </div>
          
          <p class="roi-disclaimer">
            <small>* These projections are estimates based on the inputs provided and pilot market data. Actual results may vary. Not a financial guarantee.</small>
          </p>
        </div>
      `;
      
      // Update results div
      resultsDiv.innerHTML = resultsHTML;
      resultsDiv.style.display = 'block';
    }
    
    // Initialize with default values
    const results = calculator.getFormattedResults();
    displayResults(results);
  }
}); 
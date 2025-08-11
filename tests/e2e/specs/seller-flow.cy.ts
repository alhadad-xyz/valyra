describe('Seller Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should allow founder to create a new deal listing', () => {
    // Login as founder
    cy.get('[data-testid="login-button"]').click()
    
    // Navigate to seller dashboard
    cy.get('[data-testid="seller-dashboard"]').click()
    
    // Create new listing
    cy.get('[data-testid="create-listing-button"]').click()
    
    // Fill out listing form
    cy.get('[data-testid="company-name"]').type('Test Startup Inc')
    cy.get('[data-testid="valuation"]').type('5000000')
    cy.get('[data-testid="revenue"]').type('1200000')
    
    // Submit listing
    cy.get('[data-testid="submit-listing"]').click()
    
    // Verify listing appears in dashboard
    cy.contains('Test Startup Inc').should('be.visible')
    cy.contains('$5,000,000').should('be.visible')
  })

  it('should allow founder to view and respond to offers', () => {
    // Assume logged in and have existing listing with offer
    cy.visit('/seller')
    
    // Check offers table
    cy.get('[data-testid="offers-table"]').should('be.visible')
    cy.get('[data-testid="offer-row"]').first().within(() => {
      cy.get('[data-testid="accept-offer"]').should('be.visible')
      cy.get('[data-testid="counter-offer"]').should('be.visible')
      cy.get('[data-testid="reject-offer"]').should('be.visible')
    })
    
    // Accept an offer
    cy.get('[data-testid="accept-offer"]').first().click()
    cy.get('[data-testid="confirm-accept"]').click()
    
    // Verify status change
    cy.contains('Accepted').should('be.visible')
  })

  it('should show escrow status for accepted deals', () => {
    cy.visit('/seller')
    
    // Should see escrow section for accepted deals
    cy.get('[data-testid="escrow-section"]').should('be.visible')
    cy.contains('Escrow Status').should('be.visible')
  })
})
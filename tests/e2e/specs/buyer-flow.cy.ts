describe('Buyer Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display recommended deals based on matching algorithm', () => {
    // Login as buyer/acquirer
    cy.get('[data-testid="login-button"]').click()
    
    // Navigate to buyer dashboard  
    cy.get('[data-testid="buyer-dashboard"]').click()
    
    // Should see recommended deals
    cy.get('[data-testid="recommended-deals"]').should('be.visible')
    cy.get('[data-testid="deal-card"]').should('have.length.at.least', 1)
    
    // Each deal card should show match score
    cy.get('[data-testid="deal-card"]').first().within(() => {
      cy.get('[data-testid="match-score"]').should('be.visible')
      cy.get('[data-testid="make-offer-button"]').should('be.visible')
    })
  })

  it('should allow buyer to make an offer', () => {
    cy.visit('/buyer')
    
    // Click make offer on first deal
    cy.get('[data-testid="make-offer-button"]').first().click()
    
    // Fill out offer modal
    cy.get('[data-testid="offer-amount"]').type('2000000')
    cy.get('[data-testid="equity-percentage"]').type('40')
    
    // Submit offer
    cy.get('[data-testid="submit-offer"]').click()
    
    // Should see success message
    cy.contains('Offer submitted successfully').should('be.visible')
    
    // Offer should appear in "My Offers" section
    cy.get('[data-testid="my-offers"]').within(() => {
      cy.contains('$2,000,000').should('be.visible')
      cy.contains('40%').should('be.visible')
      cy.contains('Pending').should('be.visible')
    })
  })

  it('should allow buyer to track offer status', () => {
    cy.visit('/buyer')
    
    // Should see all offers with status
    cy.get('[data-testid="offers-table"]').should('be.visible')
    
    // Click on offer to view details
    cy.get('[data-testid="view-offer"]').first().click()
    
    // Should show offer details and status
    cy.get('[data-testid="offer-details"]').should('be.visible')
    cy.get('[data-testid="offer-status"]').should('be.visible')
  })

  it('should allow buyer to set investment preferences', () => {
    cy.visit('/buyer')
    
    // Click preferences button
    cy.get('[data-testid="set-preferences"]').click()
    
    // Fill out preferences form
    cy.get('[data-testid="min-revenue"]').type('1000000')
    cy.get('[data-testid="max-valuation"]').type('10000000')
    cy.get('[data-testid="risk-tolerance"]').select('medium')
    
    // Save preferences
    cy.get('[data-testid="save-preferences"]').click()
    
    // Should see updated recommendations
    cy.contains('Preferences updated').should('be.visible')
  })
})
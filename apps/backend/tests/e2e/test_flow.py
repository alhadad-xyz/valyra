from playwright.sync_api import Page, expect
import pytest

def test_home_page_title(page: Page):
    """
    Basic E2E test to verify Playwright setup.
    This test attempts to load the backend API docs.
    """
    # Verify we can launch browser and navigate
    # Note: This requires the backend to be running on localhost:8000
    # If it fails to connect, it confirms Playwright is running but server isn't
    
    try:
        page.goto("http://localhost:8000/docs", timeout=5000)
        # Wait for title to fully load if needed
        page.wait_for_load_state("networkidle") 
        title = page.title()
        print(f"DEBUG: Page title is '{title}'")
        expect(page).to_have_title("Valyra Backend API - Swagger UI")
    except Exception as e:
        # If connection refused, we might skip or fail. 
        # For setup verification, we primarily want to ensure 'page' fixture works
        # and imports are correct.
        pytest.fail(f"Test failed. Error: {e}")

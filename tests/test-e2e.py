import pytest
import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
FRONTEND_URL = "https://globetrotterfrontend.vercel.app/"
TIMEOUT = 10  # seconds


@pytest.fixture(scope="module")
def driver():
    """Setup and teardown for WebDriver"""
    # Setup Chrome options
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Run headless for CI environments
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--start-maximized")

    # Initialize the driver
    driver = webdriver.Chrome(options=chrome_options)

    # Set an implicit wait to handle slow-loading elements
    driver.implicitly_wait(5)

    yield driver

    # Teardown
    driver.quit()


def generate_random_username(prefix="test_", length=8):
    """Generate a random username for testing"""
    random_part = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(length))
    return f"{prefix}{random_part}"


class TestGlobetrotterUI:

    def test_homepage_loads(self, driver):
        """Test that the homepage loads successfully"""
        driver.get(FRONTEND_URL)

        # Wait for the main elements to be visible
        WebDriverWait(driver, TIMEOUT).until(
            EC.text_to_be_present_in_element((By.XPATH, "//*[@id='root']/div[1]/div/div/p"),
                                             "Test your knowledge of world destinations! Get cryptic clues and guess the famous place.")
        )

        # Assert title contains Globetrotter
        assert "Globetrotter" in driver.title

        # Verify key elements are present - using the correct h1 text
        h1_element = driver.find_element(By.TAG_NAME, "h1")
        assert "Globetrotter" == h1_element.text.strip(), "Homepage h1 text doesn't match expected value"
        assert len(driver.find_elements(By.TAG_NAME, "button")) > 0

    def test_user_registration(self, driver):
        """Test user registration functionality"""
        driver.get(FRONTEND_URL)

        # Generate a random username
        username = generate_random_username()

        # Wait for the username input field using the provided XPath
        username_input = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.XPATH, "//*[@id='root']/div[1]/div/div/form/input"))
        )

        # Enter the username
        username_input.clear()
        username_input.send_keys(username)

        # Submit the form using the provided Start Adventure button XPath
        start_button = driver.find_element(By.XPATH, "//*[@id='root']/div[1]/div/div/form/button")
        start_button.click()

        # Wait for the game screen to load with the "Where am I?" heading
        try:
            where_am_i_heading = WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.XPATH, "//*[@id='root']/div[1]/div/div/div/div[1]/h2"))
            )
            assert "Where am I?" == where_am_i_heading.text.strip(), "Game screen heading doesn't match expected value"

            # If we made it here, the game loaded successfully after registration
            registration_successful = True
        except (TimeoutException, NoSuchElementException):
            registration_successful = False

        assert registration_successful, "Failed to register and enter the game"

        # Verify the username is displayed - this might need adjustment based on your actual UI structure
        # Since we don't have a direct XPath for the username display, we'll need to check in multiple places
        try:
            score_element = driver.find_element(By.XPATH, "//*[@id='root']/div[1]/div/div/header/div/div")
            assert username in score_element.text, "Username not found in score area"
        except (NoSuchElementException, AssertionError):
            # If username is not in the score area, check elsewhere in the page
            page_content = driver.find_element(By.XPATH, "/html/body/div").text
            assert username in page_content, "Username not displayed anywhere on the page after registration"

    def test_game_question_answering(self, driver):
        """Test answering questions in the game"""
        # Register a new user first (if not already on the game screen)
        if not self._is_on_game_screen(driver):
            self.test_user_registration(driver)

        # Wait for the game screen with questions and options
        try:
            # Wait for the "Where am I?" heading to confirm we're on the game screen
            WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.XPATH, "//*[@id='root']/div[1]/div/div/div/div[1]/h2"))
            )

            # Wait for the options container to be present
            options_container = WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.XPATH, "//*[@id='root']/div[1]/div/div/div/div[2]"))
            )

            # Find all option buttons within the container
            option_buttons = options_container.find_elements(By.TAG_NAME, "button")

            assert len(option_buttons) > 0, "No answer options found"

            # Get initial score for comparison
            initial_score = self._get_current_score(driver)

            # Click the first option
            option_buttons[0].click()

            # Wait briefly for the result to register
            time.sleep(2)

            # There should be feedback (correct or incorrect)
            # Since we don't have an exact XPath for feedback, we'll check if score changed
            current_score = self._get_current_score(driver)

            # Note: We're not asserting the score changed, just that we can still see it
            # The score might not change if the answer was incorrect

            game_works = True
        except (TimeoutException, NoSuchElementException) as e:
            game_works = False
            print(f"Game question test failed: {str(e)}")

        assert game_works, "Game question answering functionality failed"

    def test_score_tracking(self, driver):
        """Test that score is tracked correctly"""
        # Make sure we're on the game screen
        if not self._is_on_game_screen(driver):
            self.test_user_registration(driver)

        # Look for score element
        try:
            # Use the provided XPath for score
            score_element = WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.XPATH, "//*[@id='root']/div[1]/div/div/header/div/div"))
            )
            initial_score_text = score_element.text

            # Find the options container
            options_container = WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.XPATH, "//*[@id='root']/div[1]/div/div/div/div[2]"))
            )

            # Find all option buttons within the container
            option_buttons = options_container.find_elements(By.TAG_NAME, "button")

            # Click the first option
            option_buttons[0].click()

            # Wait for the result to register
            time.sleep(2)

            # Get updated score
            score_element = driver.find_element(By.XPATH, "//*[@id='root']/div[1]/div/div/header/div/div")
            updated_score_text = score_element.text

            # Verify score text exists (not checking if it changed since answer might be wrong)
            assert initial_score_text != "" and updated_score_text != ""

            score_tracked = True
        except (TimeoutException, NoSuchElementException) as e:
            score_tracked = False
            print(f"Score tracking test failed: {str(e)}")

        assert score_tracked, "Score tracking functionality failed"

    def test_challenge_friend_feature(self, driver):
        """Test the challenge a friend feature"""
        # Make sure we're on the game screen
        if not self._is_on_game_screen(driver):
            self.test_user_registration(driver)

        # Look for challenge button using the provided XPath
        try:
            challenge_button = WebDriverWait(driver, TIMEOUT).until(
                EC.element_to_be_clickable((By.XPATH, "//*[@id='root']/div[1]/div/div/div/button"))
            )
            challenge_button.click()

            time.sleep(2)

            # Wait for the Send invitation button to be visible (don't click it)
            send_invitation_button = WebDriverWait(driver, TIMEOUT).until(
                EC.presence_of_element_located((By.XPATH, "//*[@id='root']/div[1]/div/div/div[2]/div/div[2]/button[1]"))
            )
            assert send_invitation_button.is_displayed(), "Send invitation button is not displayed"

            # Click cancel to close the popup
            cancel_button = driver.find_element(By.XPATH, "//*[@id='root']/div[1]/div/div/div[2]/div/button")
            cancel_button.click()

            # Wait for the popup to close
            time.sleep(1)

            challenge_works = True
        except (TimeoutException, NoSuchElementException) as e:
            challenge_works = False
            print(f"Challenge feature test failed: {str(e)}")

        assert challenge_works, "Challenge a friend functionality failed"

    def test_responsive_design(self, driver):
        """Test responsive design by changing window size"""
        driver.get(FRONTEND_URL)

        # Test on mobile size
        driver.set_window_size(375, 667)  # iPhone size
        time.sleep(1)  # Allow time for responsive changes

        # Verify the page still loads properly
        h1_element = driver.find_element(By.TAG_NAME, "h1")
        assert "🌍\nGlobetrotter" == h1_element.text.strip()

        # Test on tablet size
        driver.set_window_size(768, 1024)  # iPad size
        time.sleep(1)

        # Verify the page still loads properly
        h1_element = driver.find_element(By.TAG_NAME, "h1")
        assert "🌍\nGlobetrotter" == h1_element.text.strip()

        # Test on desktop size
        driver.set_window_size(1920, 1080)
        time.sleep(1)

        # Verify the page still loads properly
        h1_element = driver.find_element(By.TAG_NAME, "h1")
        assert "🌍\nGlobetrotter" == h1_element.text.strip()

    # Helper methods
    def _is_on_game_screen(self, driver):
        """Check if the user is already on the game screen"""
        try:
            # Check for the "Where am I?" heading
            where_am_i_heading = driver.find_element(By.XPATH, "//*[@id='root']/div[1]/div/div/div/div[1]/h2")
            return where_am_i_heading.is_displayed() and where_am_i_heading.text.strip() == "Where am I?"
        except NoSuchElementException:
            return False

    def _get_current_score(self, driver):
        """Get the current score from the UI"""
        try:
            score_element = driver.find_element(By.XPATH, "//*[@id='root']/div[1]/div/div/header/div/div")
            score_text = score_element.text
            # You might need to parse the score from text like "Score: 100" or similar
            return score_text
        except NoSuchElementException:
            return "Score element not found"


if __name__ == "__main__":
    # This allows running the tests without pytest command
    pytest.main(["-v", __file__])
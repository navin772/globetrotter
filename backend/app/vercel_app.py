# This file serves as the entry point for Vercel deployment
# It imports and re-exports the main FastAPI app

# Import the main app directly
from .main import *

# The app object from main.py is now available for Vercel to use
# No need to create a new app or include routers

# Note: This file exists solely to provide a clear entry point for Vercel
# All actual functionality is defined in main.py
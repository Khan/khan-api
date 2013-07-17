"""Configuration for Flask app

Important: Place your keys in the secrets.py module,
           which should be kept out of version control.

"""

import logging
import os
import sys

# Sensitive values are placed in a secrets file that isn't checked into
# version control.
try:
    import secrets
except ImportError:
    # If the secrets aren't present, we can't run the server.
    logging.critical("Can't find secrets.py.\nCopy secrets.example.py" +
        " to secrets.py, enter the necessary values, and try again.")
    sys.exit(1)

DEBUG_MODE = False

# Auto-set debug mode based on App Engine dev environ
if os.environ.get("SERVER_SOFTWARE", "").startswith("Dev"):
    DEBUG_MODE = True

DEBUG = DEBUG_MODE

# Set secret keys for CSRF protection
SECRET_KEY = secrets.app_secret_key

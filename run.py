"""Wrapper for server app to include third_party libraries and have nicer
function name in app.yaml. Called by google app engine as defined in app.yaml
"""

import os
import sys

sys.path.insert(0, os.path.abspath('third_party'))

from explorer import explorer  # @UnusedImport

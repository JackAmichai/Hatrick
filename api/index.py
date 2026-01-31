import sys
import os
from pathlib import Path

# Add the backend directory to Python path
current_dir = Path(__file__).parent
backend_dir = current_dir.parent / "backend"
sys.path.insert(0, str(backend_dir))

# Change to backend directory for imports
os.chdir(backend_dir)

# Import and run the FastAPI app
from main import app
from mangum import Mangum

# Create a handler for Vercel
handler = Mangum(app)
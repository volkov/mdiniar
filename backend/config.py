import os
from pathlib import Path

TASKS_DIR = Path(os.environ.get("MDINIAR_TASKS_DIR", os.path.join(os.path.dirname(__file__), "..", "tasks")))

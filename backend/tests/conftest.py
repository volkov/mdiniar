import os
import sys
import tempfile
from pathlib import Path

import pytest

# Add backend root to sys.path so imports work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Set up a temp tasks directory before importing anything that reads config
_tmp_dir = tempfile.mkdtemp()
os.environ["MDINIAR_TASKS_DIR"] = _tmp_dir


@pytest.fixture(autouse=True)
def clean_tasks_dir():
    """Remove all .md files from the tasks dir before each test."""
    from config import TASKS_DIR

    for f in TASKS_DIR.glob("*.md"):
        f.unlink()
    yield
    for f in TASKS_DIR.glob("*.md"):
        f.unlink()


@pytest.fixture
def task_dir():
    from config import TASKS_DIR

    return TASKS_DIR

from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import pytest

from app.main import app

@pytest.fixture(scope="module", autouse=True)
def mock_db_jobs():
    with patch("app.services.db.get_db") as mock_get_db:
        mock_firestore_client = MagicMock()
        mock_get_db.return_value = mock_firestore_client
        yield mock_firestore_client

client = TestClient(app)

def test_list_jobs_empty(mock_db_jobs):
    """
    Test that listing jobs returns an empty list when no jobs are available.
    """
    mock_db_jobs.collection.return_value.stream.return_value = []
    
    response = client.get("/api/jobs/")
    assert response.status_code == 200
    assert response.json() == []

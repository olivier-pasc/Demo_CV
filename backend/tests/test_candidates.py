from fastapi.testclient import TestClient
import pytest
from unittest.mock import MagicMock, patch

from app.main import app

# Mock the database for testing
@pytest.fixture(scope="module", autouse=True)
def mock_db():
    with patch("app.services.db.get_db") as mock_get_db:
        mock_firestore_client = MagicMock()
        mock_get_db.return_value = mock_firestore_client
        yield mock_firestore_client

client = TestClient(app)

def test_read_single_candidate_success(mock_db):
    """
    Test that a single candidate can be retrieved by ID.
    """
    candidate_id = "test_candidate_id_123"
    expected_candidate_data = {
        "id": candidate_id,
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "skills": ["Python", "FastAPI"],
        "cv_url": "http://example.com/cv.pdf",
        "extracted_data": {},
        "created_at": "2024-01-01T00:00:00"
    }

    # Configure the mock Firestore client to return the expected candidate
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = expected_candidate_data
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get(f"/api/candidates/{candidate_id}")
    assert response.status_code == 200
    assert response.json() == expected_candidate_data

def test_read_single_candidate_not_found(mock_db):
    """
    Test that a 404 is returned for a non-existent candidate.
    """
    candidate_id = "non_existent_id"
    
    # Configure the mock Firestore client to indicate the document does not exist
    mock_doc = MagicMock()
    mock_doc.exists = False
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get(f"/api/candidates/{candidate_id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Candidate not found"}

def test_read_candidate_match_history_success(mock_db):
    """
    Test that fetching a candidate's job match history returns a list of matches.
    """
    from app.routers.candidates import Match

    candidate_id = "test_candidate_id_with_matches"
    
    # Construct expected matches using the Pydantic Match model for exact comparison
    expected_matches = [
        Match(
            id="match_id_1",
            candidate_id=candidate_id,
            job_id="job_id_1",
            score=0.85,
            analysis={"reason": "Good fit"},
            created_at="2024-01-01T10:00:00"
        ).model_dump(), # Use model_dump for dictionary representation
        Match(
            id="match_id_2",
            candidate_id=candidate_id,
            job_id="job_id_2",
            score=0.70,
            analysis={"reason": "Decent fit"},
            created_at="2024-01-01T11:00:00"
        ).model_dump(), # Use model_dump for dictionary representation
    ]
    
    # Configure the mock Firestore client to return the expected matches
    mock_stream_docs = [MagicMock(to_dict=lambda m=m: m) for m in expected_matches]
    mock_db.collection.return_value.where.return_value.stream.return_value = mock_stream_docs

    response = client.get(f"/api/candidates/{candidate_id}/matches")
    assert response.status_code == 200
    assert sorted(response.json(), key=lambda x: x['id']) == sorted(expected_matches, key=lambda x: x['id'])

def test_read_candidate_match_history_empty(mock_db):
    """
    Test that fetching a candidate's job match history returns an empty list if no matches are found.
    """
    candidate_id = "test_candidate_id_no_matches"
    
    # Configure the mock Firestore client to return an empty list
    mock_db.collection.return_value.where.return_value.stream.return_value = []

    response = client.get(f"/api/candidates/{candidate_id}/matches")
    assert response.status_code == 200
    assert response.json() == []
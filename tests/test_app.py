import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    # Register a new participant
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    signup_resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert signup_resp.status_code == 200
    # Check participant is added
    activities = client.get("/activities").json()
    assert email in activities[activity]["participants"]
    # Remove participant
    unregister_resp = client.post(f"/activities/{activity}/unregister?name={email}")
    assert unregister_resp.status_code == 200
    # Check participant is removed
    activities = client.get("/activities").json()
    assert email not in activities[activity]["participants"]

def test_signup_duplicate():
    activity = "Programming Class"
    email = "emma@mergington.edu"  # already registered
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Already registered"

def test_unregister_not_found():
    activity = "Chess Club"
    email = "notfound@mergington.edu"
    resp = client.post(f"/activities/{activity}/unregister?name={email}")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Participant not found"

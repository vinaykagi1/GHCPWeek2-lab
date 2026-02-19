import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data) >= 4  # At least 4 activities

def test_signup_for_activity():
    # Pick an activity from the list
    response = client.get("/activities")
    activities = response.json()
    activity_name = list(activities.keys())[0]
    email = "testuser@mergington.edu"

    # Try to sign up
    signup_response = client.post(f"/activities/{activity_name}/signup?email={email}")
    # Accept either success or already signed up
    assert signup_response.status_code in (200, 400)
    if signup_response.status_code == 400:
        assert "already signed up" in signup_response.json().get("detail", "")

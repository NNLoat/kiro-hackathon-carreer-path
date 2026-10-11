"""Integration tests for the contract endpoints (API-CONTRACT sections 2-6)."""

from __future__ import annotations


def test_catalog_lists_are_seeded(client) -> None:
    skills = client.get("/api/catalog/skills").json()["items"]
    courses = client.get("/api/catalog/courses").json()["items"]
    careers = client.get("/api/catalog/careers").json()["items"]
    assert len(skills) == 29
    assert len(courses) == 22
    assert len(careers) == 10
    # shape checks
    assert {"id", "name", "category"} <= set(skills[0])
    c0 = courses[0]
    assert {"id", "code", "source", "skill_contributions", "prerequisites", "terms_offered"} <= set(c0)
    assert c0["source"] in {"university", "online"}


def test_catalog_filters(client) -> None:
    online = client.get("/api/catalog/courses", params={"source": "online"}).json()["items"]
    assert online and all(c["source"] == "online" for c in online)
    q = client.get("/api/catalog/skills", params={"query": "python"}).json()["items"]
    assert any("Python" in s["name"] for s in q)


def test_profile_create_is_idempotent(client) -> None:
    r1 = client.post("/api/profiles", json={"username": "nam"})
    assert r1.status_code == 201
    pid = r1.json()["id"]
    r2 = client.post("/api/profiles", json={"username": "nam"})
    assert r2.status_code == 200
    assert r2.json()["id"] == pid


def test_profile_create_rejects_empty_username(client) -> None:
    r = client.post("/api/profiles", json={"username": "   "})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "validation_error"


def test_profile_update_and_get(client) -> None:
    pid = client.post("/api/profiles", json={"username": "lee"}).json()["id"]
    body = {
        "completed_course_ids": ["6-0001"],
        "interest_skill_ids": ["SK-002"],
        "selected_career_ids": ["CR-003"],
    }
    r = client.put(f"/api/profiles/{pid}", json=body)
    assert r.status_code == 200
    assert r.json()["completed_course_ids"] == ["6-0001"]
    got = client.get(f"/api/profiles/{pid}").json()
    assert got["interest_skill_ids"] == ["SK-002"]


def test_profile_update_rejects_unknown_ids(client) -> None:
    pid = client.post("/api/profiles", json={"username": "bad"}).json()["id"]
    r = client.put(
        f"/api/profiles/{pid}",
        json={"completed_course_ids": ["nope"], "interest_skill_ids": [], "selected_career_ids": []},
    )
    assert r.status_code == 422


def test_profile_not_found(client) -> None:
    r = client.get("/api/profiles/prof_missing")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "not_found"


def test_competency_endpoint(client) -> None:
    r = client.post("/api/skills/competency", json={"completed_course_ids": ["6-0001"]})
    assert r.status_code == 200
    comp = r.json()["competency"]
    assert comp
    assert all(0.0 <= item["level"] <= 1.0 for item in comp)


def test_radar_covers_required_skills(client) -> None:
    career = client.get("/api/catalog/careers").json()["items"][0]
    r = client.post(
        "/api/radar",
        json={"career_id": career["id"], "completed_course_ids": ["6-0001"]},
    )
    assert r.status_code == 200
    data = r.json()
    axis_ids = {a["skill_id"] for a in data["axes"]}
    required_ids = {rs["skill_id"] for rs in career["required_skills"]}
    assert required_ids <= axis_ids
    assert all(0.0 <= a["current"] <= 1.0 for a in data["axes"])


def test_radar_unknown_career(client) -> None:
    r = client.post("/api/radar", json={"career_id": "CR-999", "completed_course_ids": []})
    assert r.status_code == 404


def test_pathway_shape_and_prereq_order(client) -> None:
    r = client.post(
        "/api/pathway",
        json={"career_id": "CR-004", "completed_course_ids": [], "interest_skill_ids": ["SK-017"]},
    )
    assert r.status_code == 200
    data = r.json()
    assert "steps" in data and "conflicts" in data and "fully_schedulable" in data
    # prerequisites appear in strictly earlier steps
    seen: set[str] = set()
    for step in data["steps"]:
        for c in step["courses"]:
            for p in c["prerequisites"]:
                # prereq must be earlier OR not part of this pathway (pre-completed / unscheduled)
                scheduled_ids = {
                    cc["course_id"] for s in data["steps"] for cc in s["courses"]
                }
                if p in scheduled_ids:
                    assert p in seen, f"{c['course_id']} scheduled before prereq {p}"
        for c in step["courses"]:
            seen.add(c["course_id"])


def test_plans_crud(client) -> None:
    pid = client.post("/api/profiles", json={"username": "planner"}).json()["id"]
    pathway = client.post(
        "/api/pathway", json={"career_id": "CR-003", "completed_course_ids": []}
    ).json()
    created = client.post(
        f"/api/profiles/{pid}/plans",
        json={"name": "DS Fall", "career_id": "CR-003", "pathway": pathway},
    )
    assert created.status_code == 201
    plan_id = created.json()["id"]
    listed = client.get(f"/api/profiles/{pid}/plans").json()["items"]
    assert any(p["id"] == plan_id for p in listed)
    one = client.get(f"/api/profiles/{pid}/plans/{plan_id}")
    assert one.status_code == 200
    assert one.json()["name"] == "DS Fall"

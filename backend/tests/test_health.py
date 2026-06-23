import pytest
from fastapi.testclient import TestClient

from app import main


@pytest.fixture()
def client(tmp_path: pytest.TempPathFactory) -> TestClient:
    # The real static dir is only populated inside the Docker image. Point the
    # app at a temp dir with a stub index.html so serving logic is testable
    # without a built frontend.
    (tmp_path / "index.html").write_text(
        "<html><body>Kanban</body></html>", encoding="utf-8"
    )
    (tmp_path / "_next").mkdir()
    (tmp_path / "_next" / "static").mkdir()
    (tmp_path / "_next" / "static" / "app.js").write_text(
        "console.log('app')", encoding="utf-8"
    )
    main.STATIC_DIR = tmp_path
    main.INDEX_FILE = tmp_path / "index.html"
    return TestClient(main.app)


def test_health_ok() -> None:
    client = TestClient(main.app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_serves_index(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "Kanban" in response.text


def test_static_asset_is_served(client: TestClient) -> None:
    response = client.get("/_next/static/app.js")
    assert response.status_code == 200
    assert "console.log" in response.text


def test_unknown_path_falls_back_to_index(client: TestClient) -> None:
    response = client.get("/some/spa/route")
    assert response.status_code == 200
    assert "Kanban" in response.text


def test_path_traversal_is_confined(client: TestClient, tmp_path) -> None:
    # A file living OUTSIDE the static dir must never be served, even via "..".
    secret = tmp_path.parent / "secret.txt"
    secret.write_text("TOPSECRET", encoding="utf-8")
    try:
        response = client.get("/%2e%2e/secret.txt")
        assert response.status_code == 200
        assert "TOPSECRET" not in response.text
        assert "Kanban" in response.text
    finally:
        secret.unlink(missing_ok=True)


def test_immutable_asset_is_cached(client: TestClient) -> None:
    response = client.get("/_next/static/app.js")
    assert response.status_code == 200
    assert response.headers["cache-control"] == "public, max-age=31536000, immutable"

from backend.src.services.sql_validator import validate_select_only


def test_validate_select_only_rejects_insert() -> None:
    try:
        validate_select_only("insert into foo values (1)", 1000, None)
    except Exception as exc:  # noqa: BLE001
        assert "SELECT" in str(exc)
    else:
        assert False, "Expected validation error"


def test_validate_select_only_adds_limit() -> None:
    sql, limit = validate_select_only("select * from foo", 1000, None)
    assert "LIMIT" in sql.upper()
    assert limit == 1000

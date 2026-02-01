from __future__ import annotations

from typing import Iterable

from sqlglot import exp, parse

from ..utils.app_errors import AppError

_DISALLOWED_NODES: Iterable[type[exp.Expression]] = (
    exp.Insert,
    exp.Update,
    exp.Delete,
    exp.Create,
    exp.Drop,
    exp.Alter,
    exp.Truncate,
    exp.Command,
)


def _find_disallowed(expression: exp.Expression) -> type[exp.Expression] | None:
    for node_type in _DISALLOWED_NODES:
        if expression.find(node_type) is not None:
            return node_type
    return None


def validate_select_only(sql_text: str, default_limit: int, dialect: str | None = None) -> tuple[str, int]:
    try:
        statements = parse(sql_text, read=dialect)
    except Exception as exc:  # noqa: BLE001
        raise AppError(code="INVALID_SQL", message="SQL syntax error.", details={"error": str(exc)}) from exc

    if len(statements) != 1:
        raise AppError(code="INVALID_SQL", message="Only single statement SQL is allowed.")

    expression = statements[0]
    if isinstance(expression, exp.With):
        select_expr = expression.this
        if not isinstance(select_expr, exp.Select):
            raise AppError(code="INVALID_SQL", message="Only SELECT statements are allowed.")
    elif isinstance(expression, exp.Select):
        select_expr = expression
    else:
        raise AppError(code="INVALID_SQL", message="Only SELECT statements are allowed.")

    disallowed = _find_disallowed(expression)
    if disallowed is not None:
        raise AppError(code="INVALID_SQL", message="Only SELECT statements are allowed.")

    limit_applied = default_limit
    if select_expr.args.get("limit") is None:
        select_expr = select_expr.limit(default_limit)
        if isinstance(expression, exp.With):
            expression.set("this", select_expr)
        else:
            expression = select_expr
    else:
        limit_expr = select_expr.args.get("limit")
        if isinstance(limit_expr, exp.Limit) and isinstance(limit_expr.expression, exp.Literal):
            try:
                limit_applied = int(limit_expr.expression.name)
            except ValueError:
                limit_applied = default_limit

    return expression.sql(dialect=dialect), limit_applied

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import TYPE_CHECKING, Any, Self

if TYPE_CHECKING:
    from collections.abc import Sequence


class InsertQueryBuilder:
    """A class for building SQL INSERT queries with dynamic parameters."""

    def __init__(self, table: str, db: Db) -> None:
        self.table: str = table
        self.db: Db = db
        self.columns: list[str] = []
        self._values: list[Any] = []

    def value(self, column: str, value: Any) -> Self:
        """Add a column-value pair to the INSERT query."""
        self.columns.append(column)
        self._values.append(value)
        return self

    def values(self, data: dict[str, Any]) -> Self:
        """Add multiple column-value pairs from a dictionary."""
        for column, value in data.items():
            self.value(column, value)
        return self

    def build(self) -> tuple[str, list[Any]]:
        """Build the INSERT query and return the SQL string and parameters."""
        if not self.columns:
            msg = "No columns specified"
            raise ValueError(msg)

        columns_str = ", ".join(self.columns)
        placeholders = ", ".join("?" * len(self._values))
        sql = f"INSERT INTO {self.table} ({columns_str}) VALUES ({placeholders})"  # noqa: S608

        return sql, self._values

    def execute(self) -> Db:
        """Execute the INSERT query and return the database instance."""
        sql, params = self.build()
        return self.db(sql, params)


class UpdateQueryBuilder:
    """A class for building SQL UPDATE queries with dynamic parameters."""

    def __init__(self, table: str, db: Db) -> None:
        self.table: str = table
        self.db: Db = db
        self.set_clauses: list[str] = []
        self.where_clauses: list[str] = []
        self.parameters: list[Any] = []

    def set(self, column: str, value: Any) -> Self:
        """Add a SET clause to the UPDATE query."""
        self.set_clauses.append(f"{column} = ?")
        self.parameters.append(value)
        return self

    def where(self, condition: str, *values: Any) -> Self:
        """Add a WHERE clause to the UPDATE query."""
        self.where_clauses.append(condition)
        self.parameters.extend(values)
        return self

    def where_eq(self, column: str, value: Any) -> Self:
        """Add a WHERE clause with equality comparison."""
        return self.where(f"{column} = ?", value)

    def where_in(self, column: str, values: Sequence[Any]) -> Self:
        """Add a WHERE clause with IN operator."""
        placeholders = ",".join("?" * len(values))
        return self.where(f"{column} IN ({placeholders})", *values)

    def build(self) -> tuple[str, list[Any]]:
        """Build the UPDATE query and return the SQL string and parameters."""
        if not self.set_clauses:
            msg = "No SET clauses specified"
            raise ValueError(msg)

        sql = f"UPDATE {self.table} SET {', '.join(self.set_clauses)}"  # noqa: S608

        if self.where_clauses:
            sql += f" WHERE {' AND '.join(self.where_clauses)}"

        return sql, self.parameters

    def execute(self) -> Db:
        """Execute the UPDATE query and return the database instance."""
        sql, params = self.build()
        return self.db(sql, params)


class Row:
    def __init__(self, cursor: sqlite3.Cursor, row: sqlite3.Row) -> None:
        fields = [column[0] for column in cursor.description]
        self._dict: Any = dict(zip(fields, row, strict=True))

    def __getattr__(self, name: str) -> Any:
        try:
            return self._dict[name]
        except KeyError:
            msg = f"row has no column '{name}'"
            raise AttributeError(msg) from None

    def into_obj[T](self, cls: type[T]) -> T:
        return cls(**self._dict)


def cursor_factory(con: sqlite3.Connection) -> sqlite3.Cursor:
    cur = sqlite3.Cursor(con)
    cur.row_factory = Row
    return cur


class Db:
    path: str = "database.sqlite3"

    def __init__(self) -> None:
        self._con: sqlite3.Connection = sqlite3.connect(self.path)
        self._cur: sqlite3.Cursor = self._con.cursor(cursor_factory)

    def __enter__(self, *args) -> Self:
        return self

    def __exit__(self, *_args) -> None:
        self._con.commit()
        self._cur.close()
        self._con.close()

    def __call__(self, sql: str, params: Sequence[object] = ()) -> Self:
        self._cur.execute(sql, params)
        return self

    def script(self, sql: str) -> Self:
        self._cur.executescript(sql)
        return self

    def one(self) -> Row | None:
        return self._cur.fetchone()

    def all(self) -> list[Row]:
        return self._cur.fetchall()

    def lastrowid(self) -> int | None:
        return self._cur.lastrowid

    def commit(self) -> Self:
        self._con.commit()
        return self

    def exists(self) -> bool:
        return self._cur.fetchone() is not None

    def rowcount(self) -> int:
        return self._cur.rowcount

    def update(self, table: str) -> UpdateQueryBuilder:
        """Create an UpdateQueryBuilder for the specified table."""
        return UpdateQueryBuilder(table, self)

    def execute_update(self, builder: UpdateQueryBuilder) -> Self:
        """Execute an UPDATE query built with UpdateQueryBuilder."""
        sql, params = builder.build()
        return self(sql, params)

    def insert(self, table: str) -> InsertQueryBuilder:
        """Create an InsertQueryBuilder for the specified table."""
        return InsertQueryBuilder(table, self)

    def execute_insert(self, builder: InsertQueryBuilder) -> Self:
        """Execute an INSERT query built with InsertQueryBuilder."""
        sql, params = builder.build()
        return self(sql, params)


if __name__ == "__main__":
    import argparse

    argparser = argparse.ArgumentParser()
    argparser.add_argument("FILE", type=Path, help="Path to the SQL file to execute")
    args = argparser.parse_args()
    with Db() as db:
        with args.FILE.open() as file:
            sql = file.read()
        db.script(sql)

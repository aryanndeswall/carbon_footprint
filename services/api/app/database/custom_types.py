from sqlalchemy.types import UserDefinedType

class Vector(UserDefinedType):
    """
    Custom SQLAlchemy UserDefinedType representing the pgvector VECTOR type.
    Allows passing a list of floats and querying it seamlessly.
    """
    cache_ok = True

    def __init__(self, dim: int):
        self.dim = dim

    def get_col_spec(self, **kw):
        return f"VECTOR({self.dim})"

    def bind_processor(self, dialect):
        def process(value):
            if value is None:
                return None
            if isinstance(value, list):
                return "[" + ",".join(map(str, value)) + "]"
            return value
        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is None:
                return None
            if isinstance(value, list):
                return value
            if isinstance(value, str):
                clean = value.strip("[]")
                if not clean:
                    return []
                return [float(x) for x in clean.split(",") if x]
            return value
        return process

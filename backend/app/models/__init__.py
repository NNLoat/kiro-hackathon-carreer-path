"""Central import point for all SQLModel table models.

Every table=True model must be imported here so that SQLModel.metadata is fully
populated before init_db() calls create_all().
"""

from app.models.item import Item  # noqa: F401

"""Central import point for all SQLModel table models.

Every table=True model must be imported here so that SQLModel.metadata is fully
populated before init_db() calls create_all().
"""

from app.models.catalog import Career, Course, Skill  # noqa: F401
from app.models.profile import Plan, Profile  # noqa: F401

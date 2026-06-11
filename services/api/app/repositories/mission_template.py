from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from app.models.mission import MissionTemplate

class MissionTemplateRepository:
    """
    CRUD repository for database queries and mutations on the MissionTemplate model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, template_id: UUID) -> Optional[MissionTemplate]:
        """
        Retrieve a single mission template by its ID.
        """
        return self.db.query(MissionTemplate).filter(MissionTemplate.id == template_id).first()

    def get_active_templates(self) -> List[MissionTemplate]:
        """
        Retrieve all active mission templates.
        """
        return self.db.query(MissionTemplate).filter(MissionTemplate.is_active).all()

    def create(self, template: MissionTemplate) -> MissionTemplate:
        """
        Insert a new mission template.
        """
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

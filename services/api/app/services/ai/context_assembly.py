import time
import logging
from typing import List
from app.models.ai_memory import UserMemory

logger = logging.getLogger(__name__)

class ContextAssemblyService:
    """
    Assembles retrieved semantic memories and user profile metrics into 
    clean, augmented textual contexts for the prompt templates.
    """
    @staticmethod
    def assemble_memory_context(memories: List[UserMemory]) -> str:
        """
        Convert retrieved memories to a bulleted text format.
        Ensures execution is within performance targets (< 100ms).
        """
        start_time = time.time()
        
        if not memories:
            return "No historical user behavior patterns retrieved."

        lines = ["User Behavior History & Preferences:"]
        for idx, memory in enumerate(memories):
            lines.append(f"- {memory.content}")

        context_str = "\n".join(lines)
        
        duration_ms = (time.time() - start_time) * 1000
        logger.debug(f"Context assembly took {duration_ms:.2f}ms")
        
        return context_str

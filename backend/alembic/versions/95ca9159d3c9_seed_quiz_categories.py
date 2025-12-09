"""seed_quiz_categories

Revision ID: 95ca9159d3c9
Revises: d3559ab3efb7
Create Date: 2025-12-09 10:20:37.534978

"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column


# revision identifiers, used by Alembic.
revision: str = '95ca9159d3c9'
down_revision: Union[str, None] = 'd3559ab3efb7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Define the categories table structure for data operations
    categories_table = table(
        'quizzes_category',
        column('name', sa.String),
        column('slug', sa.String),
        column('description', sa.Text),
        column('icon', sa.String),
        column('color', sa.String),
        column('created_at', sa.DateTime),
    )
    
    # Insert default categories
    op.bulk_insert(
        categories_table,
        [
            {
                'name': 'General Knowledge',
                'slug': 'general-knowledge',
                'description': 'Test your general knowledge',
                'icon': '🌍',
                'color': '#3498db',
                'created_at': datetime.utcnow(),
            },
            {
                'name': 'Science',
                'slug': 'science',
                'description': 'Physics, Chemistry, and Biology',
                'icon': '🔬',
                'color': '#2ecc71',
                'created_at': datetime.utcnow(),
            },
            {
                'name': 'History',
                'slug': 'history',
                'description': 'World History and Events',
                'icon': '📜',
                'color': '#e74c3c',
                'created_at': datetime.utcnow(),
            },
            {
                'name': 'Technology',
                'slug': 'technology',
                'description': 'Computers, AI, and Gadgets',
                'icon': '💻',
                'color': '#9b59b6',
                'created_at': datetime.utcnow(),
            },
        ]
    )


def downgrade() -> None:
    # Remove the seeded categories
    op.execute(
        """
        DELETE FROM quizzes_category 
        WHERE slug IN ('general-knowledge', 'science', 'history', 'technology')
        """
    )


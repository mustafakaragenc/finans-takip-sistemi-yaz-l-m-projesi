"""
Backend Routes __init__.py
Tüm route'ları merkezi yerde yönet
"""
from .auth_routes import auth_bp
from .transaction_routes import transaction_bp
from .budget_routes import budget_bp
from .family_routes import family_bp
from .admin_routes import admin_bp

__all__ = [
    'auth_bp',
    'transaction_bp',
    'budget_bp',
    'family_bp',
    'admin_bp'
]

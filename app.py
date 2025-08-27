import os
import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1) # needed for url_for to generate with https

# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///doctless_paint.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Paystack configuration
app.config["PAYSTACK_PUBLIC_KEY"] = os.environ.get("PAYSTACK_PUBLIC_KEY", "pk_test_default")
app.config["PAYSTACK_SECRET_KEY"] = os.environ.get("PAYSTACK_SECRET_KEY", "sk_test_default")

# initialize the app with the extension, flask-sqlalchemy >= 3.0.x
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Import models and routes after app configuration
import models  # noqa: F401

# Register blueprints
from routes import main_bp
from auth_routes import auth_bp
from admin_routes import admin_bp
from google_auth import google_auth_bp

app.register_blueprint(main_bp)
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(google_auth_bp, url_prefix='/google_auth')

# Register template filters
from utils import from_json
app.jinja_env.filters['from_json'] = from_json

with app.app_context():
    db.create_all()

    # Create default admin user if none exists
    from models import User
    from werkzeug.security import generate_password_hash

    admin_user = User.query.filter_by(email='admin@doctlesspaint.com').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@doctlesspaint.com',
            password_hash=generate_password_hash('admin123'),
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Default admin user created: admin@doctlesspaint.com / admin123")
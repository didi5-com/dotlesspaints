
from werkzeug.security import generate_password_hash
from app import app, db
from models import User

def create_admin_user():
    with app.app_context():
        # Check if admin user already exists
        admin_user = User.query.filter_by(email='admin@doctlesspaint.com').first()
        
        if admin_user:
            # Update existing user
            admin_user.password_hash = generate_password_hash('admin123')
            admin_user.is_admin = True
            admin_user.username = 'admin'
            admin_user.first_name = 'Admin'
            admin_user.last_name = 'User'
            print("Admin user updated successfully!")
        else:
            # Create new admin user
            admin_user = User(
                username='admin',
                email='admin@doctlesspaint.com',
                first_name='Admin',
                last_name='User',
                password_hash=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin_user)
            print("Admin user created successfully!")
        
        db.session.commit()

if __name__ == '__main__':
    create_admin_user()

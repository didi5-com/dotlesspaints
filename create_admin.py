
from app import app, db
from models import User
from werkzeug.security import generate_password_hash
import sys

def create_admin_user():
    with app.app_context():
        # Check if admin already exists
        admin_email = "admin@doctlesspaint.com"
        existing_admin = User.query.filter_by(email=admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists: {admin_email}")
            # Update password and ensure admin status
            existing_admin.password_hash = generate_password_hash("admin123")
            existing_admin.is_admin = True
            db.session.commit()
            print("Admin password updated to 'admin123' and admin status confirmed.")
        else:
            # Create new admin user
            admin_user = User(
                email=admin_email,
                full_name="System Administrator",
                phone="08119563832",
                password_hash=generate_password_hash("admin123"),
                is_admin=True
            )
            
            db.session.add(admin_user)
            db.session.commit()
            print(f"Admin user created successfully: {admin_email}")
            print("Password: admin123")

        # Verify the creation
        verify_admin = User.query.filter_by(email=admin_email).first()
        if verify_admin and verify_admin.is_admin:
            print("✓ Admin user verification successful")
            print(f"  Email: {verify_admin.email}")
            print(f"  Name: {verify_admin.full_name}")
            print(f"  Is Admin: {verify_admin.is_admin}")
        else:
            print("✗ Admin user verification failed")
            return False
        
        return True

if __name__ == "__main__":
    try:
        success = create_admin_user()
        if success:
            print("\nAdmin user is ready for login!")
        else:
            print("\nFailed to create admin user!")
            sys.exit(1)
    except Exception as e:
        print(f"Error creating admin user: {e}")
        sys.exit(1)

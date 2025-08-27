from app import app  # noqa: F401
from models import db  # Assuming db is imported from models

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Create default payment methods if none exist
        from models import PaymentMethod
        if not PaymentMethod.query.first():
            # Default Paystack
            paystack = PaymentMethod(
                name='Paystack (Card Payment)',
                method_type='gateway',
                configuration='{"public_key": "", "secret_key": ""}',
                instructions='Pay securely with your debit/credit card',
                is_active=True
            )

            # Default Bank Transfer
            bank_transfer = PaymentMethod(
                name='Bank Transfer',
                method_type='manual',
                configuration='{"account_number": "1234567890", "account_name": "Doctless Paint Ltd", "bank_name": "First Bank of Nigeria"}',
                instructions='Transfer to our account and send proof of payment to complete your order.',
                is_active=True
            )

            db.session.add(paystack)
            db.session.add(bank_transfer)
            db.session.commit()
            print("Default payment methods created!")

        print("Database tables created successfully!")
    app.run(host='0.0.0.0', port=5000, debug=True)
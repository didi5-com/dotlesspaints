from app import app, db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Check if payment_method_id column exists, if not add it
        try:
            from sqlalchemy import text
            result = db.engine.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='order' AND column_name='payment_method_id'"))
            if not result.fetchone():
                print("Adding payment_method_id column to order table...")
                db.engine.execute(text('ALTER TABLE "order" ADD COLUMN payment_method_id INTEGER'))
                db.engine.execute(text('ALTER TABLE "order" ADD CONSTRAINT fk_order_payment_method FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)'))
                print("Column added successfully!")
        except Exception as e:
            print(f"Error checking/adding column: {e}")

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
                configuration='{"account_number": "1234567890", "account_name": "Dotless Paint Ltd", "bank_name": "First Bank of Nigeria"}',
                instructions='Transfer to our account and send proof of payment to complete your order.',
                is_active=True
            )

            # Default Crypto
            crypto = PaymentMethod(
                name='Cryptocurrency',
                method_type='crypto',
                configuration='{"btc_address": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", "eth_address": "0x742F5a5b8cF9F6b77Db81845A9E9E6eE52A6F2D1"}',
                instructions='Send payment to the provided crypto address and confirm payment.',
                is_active=True
            )

            db.session.add(paystack)
            db.session.add(bank_transfer)
            db.session.add(crypto)
            db.session.commit()
            print("Default payment methods created!")

        print("Database setup completed successfully!")
    app.run(host='0.0.0.0', port=5000, debug=True)
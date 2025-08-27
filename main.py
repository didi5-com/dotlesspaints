
from app import app, db

if __name__ == '__main__':
    with app.app_context():
        # Import models first
        from models import PaymentMethod, Order
        
        # Create all tables
        db.create_all()

        # Check if payment_method_id column exists, if not add it
        try:
            from sqlalchemy import text, inspect
            
            # Check if the column exists
            inspector = inspect(db.engine)
            columns = inspector.get_columns('order')
            column_names = [col['name'] for col in columns]
            
            if 'payment_method_id' not in column_names:
                print("Adding payment_method_id column to order table...")
                
                # Add the column
                db.engine.execute(text('ALTER TABLE "order" ADD COLUMN payment_method_id INTEGER'))
                
                # Add foreign key constraint
                db.engine.execute(text('ALTER TABLE "order" ADD CONSTRAINT fk_order_payment_method FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)'))
                
                print("payment_method_id column added successfully!")
            else:
                print("payment_method_id column already exists")
                
        except Exception as e:
            print(f"Error checking/adding column: {e}")

        # Create default payment methods if none exist
        if not PaymentMethod.query.first():
            print("Creating default payment methods...")
            
            # Default Paystack
            paystack = PaymentMethod(
                name='Paystack (Card Payment)',
                method_type='gateway',
                configuration='{"public_key": "", "secret_key": ""}',
                instructions='Pay securely with your debit/credit card',
                is_active=True
            )
            db.session.add(paystack)

            # Default Bank Transfer
            bank_transfer = PaymentMethod(
                name='Bank Transfer',
                method_type='manual',
                configuration='{"account_name": "Your Business Name", "account_number": "1234567890", "bank_name": "Your Bank"}',
                instructions='Transfer to the account details provided and confirm payment',
                is_active=True
            )
            db.session.add(bank_transfer)

            # Default Crypto
            crypto = PaymentMethod(
                name='Cryptocurrency',
                method_type='crypto',
                configuration='{"btc_address": "", "eth_address": "", "usdt_address": ""}',
                instructions='Send cryptocurrency to the provided wallet address',
                is_active=False
            )
            db.session.add(crypto)

            try:
                db.session.commit()
                print("Default payment methods created successfully!")
            except Exception as e:
                print(f"Error creating payment methods: {e}")
                db.session.rollback()

    # Start the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)

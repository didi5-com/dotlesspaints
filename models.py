from app import db
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import func


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    is_admin = db.Column(db.Boolean, default=False)
    google_id = db.Column(db.String(100), unique=True)
    facebook_id = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', backref='user', lazy=True)
    cart_items = db.relationship('CartItem',
                                 backref='user',
                                 lazy=True,
                                 cascade='all, delete-orphan')


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)  # For showing discounts
    image_url = db.Column(db.String(200))
    category = db.Column(db.String(50))
    stock_quantity = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    cart_items = db.relationship('CartItem', backref='product', lazy=True)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)


class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer,
                           db.ForeignKey('product.id'),
                           nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(
        db.String(20),
        default='pending')  # pending, confirmed, shipped, delivered, cancelled
    payment_status = db.Column(
        db.String(20), default='pending')  # pending, paid, failed, refunded
    payment_reference = db.Column(db.String(100))  # Paystack reference
    payment_method_id = db.Column(db.Integer,
                                  db.ForeignKey('payment_method.id'))
    shipping_address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)

    # Relationships
    order_items = db.relationship('OrderItem',
                                  backref='order',
                                  lazy=True,
                                  cascade='all, delete-orphan')
    payment_method = db.relationship('PaymentMethod',
                                     backref='orders',
                                     lazy=True)


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer,
                           db.ForeignKey('product.id'),
                           nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)


class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SiteCustomization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    section = db.Column(db.String(50),
                        nullable=False)  # header, hero, about, footer, etc.
    element_type = db.Column(db.String(30),
                             nullable=False)  # text, image, color, style
    element_key = db.Column(db.String(100),
                            nullable=False)  # specific identifier
    content = db.Column(db.Text)  # the actual content
    style_properties = db.Column(db.Text)  # JSON string for CSS properties
    position_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime,
                           default=datetime.utcnow,
                           onupdate=datetime.utcnow)


class PaymentMethod(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50),
                     nullable=False)  # Paystack, Bank Transfer, Crypto, etc.
    method_type = db.Column(db.String(30),
                            nullable=False)  # gateway, manual, crypto
    is_active = db.Column(db.Boolean, default=True)
    configuration = db.Column(
        db.Text)  # JSON string for method-specific config
    instructions = db.Column(db.Text)  # Instructions for manual methods
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Customization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_name = db.Column(db.String(100), nullable=False)
    theme_color = db.Column(db.String(50), nullable=False, default="blue")
    logo = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return f"<Customization {self.site_name}>"

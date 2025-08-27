import os
import secrets
from PIL import Image
from flask import current_app, url_for
from werkzeug.utils import secure_filename
from models import SiteCustomization, PaymentMethod
import json


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_picture(form_picture, folder):
    """Save uploaded picture and return the filename"""
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(current_app.root_path, 'static', folder, picture_fn)

    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(picture_path), exist_ok=True)

    # Resize image to save space
    output_size = (800, 600)
    img = Image.open(form_picture)
    img.thumbnail(output_size)
    img.save(picture_path)

    return picture_fn


def format_currency(amount):
    """Format amount as Nigerian Naira"""
    return f"₦{amount:,.2f}"


def calculate_discount_percentage(original_price, current_price):
    """Calculate discount percentage"""
    if original_price and current_price and original_price > current_price:
        discount = ((original_price - current_price) / original_price) * 100
        return round(discount)
    return 0


def get_site_customization(section=None, element_key=None):
    """Get site customizations, optionally filtered by section or element_key"""
    query = SiteCustomization.query.filter_by(is_active=True)

    if section:
        query = query.filter_by(section=section)

    if element_key:
        query = query.filter_by(element_key=element_key)
        customization = query.first()
        return customization.content if customization else None

    customizations = query.order_by(SiteCustomization.position_order).all()
    return {c.element_key: c.content for c in customizations}


def get_site_styles(section=None):
    """Get CSS styles for site customizations"""
    query = SiteCustomization.query.filter_by(is_active=True, element_type='style')

    if section:
        query = query.filter_by(section=section)

    customizations = query.all()
    styles = {}

    for c in customizations:
        if c.style_properties:
            try:
                styles[c.element_key] = json.loads(c.style_properties)
            except json.JSONDecodeError:
                pass

    return styles


def get_active_payment_methods():
    """Get all active payment methods"""
    return PaymentMethod.query.filter_by(is_active=True).all()


def format_payment_config(config_json):
    """Parse and format payment method configuration"""
    if not config_json:
        return {}

    try:
        return json.loads(config_json)
    except json.JSONDecodeError:
        return {}
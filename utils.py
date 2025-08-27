import os
import secrets
from PIL import Image
from flask import current_app, url_for
from werkzeug.utils import secure_filename


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

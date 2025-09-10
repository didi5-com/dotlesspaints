from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_required, current_user
from app import db
from models import Product, CartItem, Order, OrderItem, ContactMessage, PaymentMethod
from forms import ContactForm, CheckoutForm
from utils import get_site_customization, get_site_styles, get_active_payment_methods, format_payment_config
import requests
import os
import json
from models import News

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    featured_products = Product.query.filter_by(is_active=True).limit(6).all()
    
    # Get site customizations
    customizations = {
        'hero': get_site_customization('hero'),
        'general': get_site_customization('general')
    }
    
    return render_template('index.html', products=featured_products, customizations=customizations)


@main_bp.route('/products')
def products():
    page = request.args.get('page', 1, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = Product.query.filter_by(is_active=True)
    
    if category:
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(Product.name.contains(search))
    
    products = query.order_by(Product.created_at.desc()).paginate(page=page, per_page=12, error_out=False)
    categories = db.session.query(Product.category).filter(Product.is_active == True).distinct().all()
    categories = [cat[0] for cat in categories if cat[0]]
    
    return render_template('products.html', products=products, categories=categories, 
                         current_category=category, search=search)


@main_bp.route('/product/<int:product_id>')
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    related_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product.id,
        Product.is_active == True
    ).limit(4).all()
    
    return render_template('product_detail.html', product=product, related_products=related_products)


@main_bp.route('/add_to_cart/<int:product_id>', methods=['POST'])
@login_required
def add_to_cart(product_id):
    product = Product.query.get_or_404(product_id)
    quantity = request.form.get('quantity', 1, type=int)
    
    if quantity <= 0:
        flash('Invalid quantity.', 'error')
        return redirect(url_for('main.product_detail', product_id=product_id))
    
    if product.stock_quantity < quantity:
        flash('Insufficient stock available.', 'error')
        return redirect(url_for('main.product_detail', product_id=product_id))
    
    # Check if item already in cart
    cart_item = CartItem.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    
    if cart_item:
        if cart_item.quantity + quantity > product.stock_quantity:
            flash('Cannot add more items. Insufficient stock.', 'error')
        else:
            cart_item.quantity += quantity
            db.session.commit()
            flash(f'Updated quantity of {product.name} in cart.', 'success')
    else:
        cart_item = CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)
        db.session.commit()
        flash(f'Added {product.name} to cart.', 'success')
    
    return redirect(url_for('main.cart'))


@main_bp.route('/cart')
@login_required
def cart():
    cart_items = db.session.query(CartItem, Product).join(Product).filter(
        CartItem.user_id == current_user.id
    ).all()
    
    total = sum(item.quantity * product.price for item, product in cart_items)
    
    return render_template('cart.html', cart_items=cart_items, total=total)


@main_bp.route('/update_cart/<int:item_id>', methods=['POST'])
@login_required
def update_cart(item_id):
    cart_item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
    quantity = request.form.get('quantity', type=int)
    
    if quantity <= 0:
        db.session.delete(cart_item)
        flash('Item removed from cart.', 'info')
    else:
        if quantity > cart_item.product.stock_quantity:
            flash('Insufficient stock available.', 'error')
        else:
            cart_item.quantity = quantity
            flash('Cart updated.', 'success')
    
    db.session.commit()
    return redirect(url_for('main.cart'))


@main_bp.route('/remove_from_cart/<int:item_id>', methods=['POST'])
@login_required
def remove_from_cart(item_id):
    cart_item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
    db.session.delete(cart_item)
    db.session.commit()
    flash('Item removed from cart.', 'info')
    return redirect(url_for('main.cart'))


@main_bp.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    cart_items = db.session.query(CartItem, Product).join(Product).filter(
        CartItem.user_id == current_user.id
    ).all()
    
    if not cart_items:
        flash('Your cart is empty.', 'info')
        return redirect(url_for('main.products'))
    
    total = sum(item.quantity * product.price for item, product in cart_items)
    form = CheckoutForm()
    
    # Get available payment methods
    payment_methods = get_active_payment_methods()
    form.payment_method.choices = [(str(pm.id), pm.name) for pm in payment_methods]
    
    if form.validate_on_submit():
        # Get selected payment method
        payment_method = PaymentMethod.query.get(int(form.payment_method.data))
        
        if not payment_method:
            flash('Invalid payment method selected.', 'error')
            return render_template('checkout.html', cart_items=cart_items, total=total, form=form, payment_methods=payment_methods)
        
        # Create order
        order = Order(
            user_id=current_user.id,
            total_amount=total,
            shipping_address=form.shipping_address.data,
            phone=form.phone.data,
            payment_method_id=payment_method.id
        )
        
        db.session.add(order)
        db.session.flush()  # Get the order ID
        
        # Create order items
        for cart_item, product in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=cart_item.quantity,
                unit_price=product.price,
                total_price=cart_item.quantity * product.price
            )
            db.session.add(order_item)
            
            # Update stock
            product.stock_quantity -= cart_item.quantity
        
        # Clear cart
        CartItem.query.filter_by(user_id=current_user.id).delete()
        db.session.commit()
        
        # Redirect to payment based on payment method type
        return redirect(url_for('main.payment', order_id=order.id))
    
    return render_template('checkout.html', cart_items=cart_items, total=total, form=form, payment_methods=payment_methods)


@main_bp.route('/payment/<int:order_id>')
@login_required
def payment(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    
    if order.payment_status == 'paid':
        flash('This order has already been paid for.', 'info')
        return redirect(url_for('main.order_detail', order_id=order.id))
    
    # Paystack configuration
    paystack_public_key = os.environ.get("PAYSTACK_PUBLIC_KEY", "pk_test_default")
    
    return render_template('payment.html', order=order, paystack_public_key=paystack_public_key)


@main_bp.route('/verify_payment/<int:order_id>')
@login_required
def verify_payment(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    reference = request.args.get('reference')
    
    if not reference:
        flash('Payment verification failed. No reference provided.', 'error')
        return redirect(url_for('main.payment', order_id=order.id))
    
    # Verify payment with Paystack
    paystack_secret_key = os.environ.get("PAYSTACK_SECRET_KEY", "sk_test_default")
    headers = {
        'Authorization': f'Bearer {paystack_secret_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(
            f'https://api.paystack.co/transaction/verify/{reference}',
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] and data['data']['status'] == 'success':
                # Payment successful
                order.payment_status = 'paid'
                order.payment_reference = reference
                order.status = 'confirmed'
                db.session.commit()
                
                flash('Payment successful! Your order has been confirmed.', 'success')
                return redirect(url_for('main.order_detail', order_id=order.id))
            else:
                flash('Payment verification failed. Please try again.', 'error')
        else:
            flash('Unable to verify payment. Please contact support.', 'error')
            
    except Exception as e:
        flash('Payment verification error. Please contact support.', 'error')
    
    return redirect(url_for('main.payment', order_id=order.id))


@main_bp.route('/orders')
@login_required
def orders():
    page = request.args.get('page', 1, type=int)
    orders = Order.query.filter_by(user_id=current_user.id).order_by(
        Order.created_at.desc()
    ).paginate(page=page, per_page=10, error_out=False)
    
    return render_template('orders.html', orders=orders)


@main_bp.route('/order/<int:order_id>')
@login_required
def order_detail(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    return render_template('order_detail.html', order=order)


@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        message = ContactMessage(
            name=form.name.data,
            email=form.email.data,
            message=form.message.data
        )
        db.session.add(message)
        db.session.commit()
        flash('Your message has been sent! We will get back to you soon.', 'success')
        return redirect(url_for('main.contact'))
    
    return render_template('contact.html', form=form)


@main_bp.route('/confirm_manual_payment/<int:order_id>', methods=['POST'])
@login_required
def confirm_manual_payment(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    
    if order.payment_status == 'paid':
        return jsonify({'success': False, 'message': 'Order already paid'})
    
    order.payment_status = 'pending_verification'
    order.status = 'pending_verification'
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Payment confirmation received'})


@main_bp.route('/confirm_crypto_payment/<int:order_id>', methods=['POST'])
@login_required
def confirm_crypto_payment(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    
    if order.payment_status == 'paid':
        return jsonify({'success': False, 'message': 'Order already paid'})
    
    order.payment_status = 'pending_verification'
    order.status = 'pending_verification'
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Crypto payment confirmation received'})


@main_bp.route('/about')
def about():
    return render_template('about.html')


@main_bp.route('/news')
@login_required
def user_news():
    news = News.query.order_by(News.created_at.desc()).all()
    return render_template('news.html', news=news)
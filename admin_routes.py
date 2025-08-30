from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_required
from functools import wraps
from app import db
from models import User, Product, Order, ContactMessage
from forms import ProductForm
from werkzeug.security import check_password_hash
from models import Customization  # make sure you have this model defined
from models import PaymentMethod
from forms import PaymentMethodForm

admin_bp = Blueprint('admin', __name__)


def admin_required(f):

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if a user is logged in and if they have admin privileges using session
        if 'admin_user_id' not in session:
            flash('Please log in to access the admin panel.', 'error')
            return redirect(url_for('admin.login'))

        user = User.query.get(session['admin_user_id'])
        if not user or not user.is_admin:
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)

    return decorated_function


@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        print(f"Login attempt - Email: {email}")  # Debug log

        # Check if user exists and is admin
        user = User.query.filter_by(email=email).first()

        if user:
            print(f"User found - Is Admin: {user.is_admin}")  # Debug log
            if user.is_admin and check_password_hash(user.password_hash,
                                                     password):
                session['admin_user_id'] = user.id
                flash('Login successful!', 'success')
                return redirect(url_for('admin.dashboard'))
            elif not user.is_admin:
                flash('Access denied. Admin privileges required.', 'error')
            else:
                flash('Invalid password.', 'error')
        else:
            flash('Admin user not found.', 'error')

    return render_template('admin/login.html')


@admin_bp.route('/')
@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    # Dashboard statistics
    total_users = User.query.count()
    total_products = Product.query.count()
    total_orders = Order.query.count()
    pending_orders = Order.query.filter_by(status='pending').count()
    unread_messages = ContactMessage.query.filter_by(is_read=False).count()

    # Recent orders
    recent_orders = Order.query.order_by(
        Order.created_at.desc()).limit(5).all()

    # Revenue calculation (simplified)
    total_revenue = db.session.query(db.func.sum(
        Order.total_amount)).filter_by(payment_status='paid').scalar() or 0

    stats = {
        'total_users': total_users,
        'total_products': total_products,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'unread_messages': unread_messages,
        'total_revenue': total_revenue,
        'recent_orders': recent_orders
    }

    return render_template('admin/dashboard.html', stats=stats)


@admin_bp.route('/products')
@login_required
@admin_required
def products():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    category = request.args.get('category', '')

    query = Product.query

    if search:
        query = query.filter(Product.name.contains(search))

    if category:
        query = query.filter_by(category=category)

    products = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=20, error_out=False)

    categories = db.session.query(Product.category).distinct().all()
    categories = [cat[0] for cat in categories if cat[0]]

    return render_template('admin/products.html',
                           products=products,
                           categories=categories,
                           search=search,
                           current_category=category)


@admin_bp.route('/products/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_product():
    form = ProductForm()

    if form.validate_on_submit():
        product = Product(name=form.name.data,
                          description=form.description.data,
                          price=form.price.data,
                          original_price=form.original_price.data,
                          image_url=form.image_url.data,
                          category=form.category.data,
                          stock_quantity=form.stock_quantity.data,
                          is_active=form.is_active.data)
        db.session.add(product)
        db.session.commit()
        flash('Product added successfully!', 'success')
        return redirect(url_for('admin.products'))

    return render_template('admin/product_form.html',
                           form=form,
                           title='Add Product')


@admin_bp.route('/products/edit/<int:product_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    form = ProductForm(obj=product)

    if form.validate_on_submit():
        product.name = form.name.data
        product.description = form.description.data
        product.price = form.price.data
        product.original_price = form.original_price.data
        product.image_url = form.image_url.data
        product.category = form.category.data
        product.stock_quantity = form.stock_quantity.data
        product.is_active = form.is_active.data
        db.session.commit()
        flash('Product updated successfully!', 'success')
        return redirect(url_for('admin.products'))

    return render_template('admin/product_form.html',
                           form=form,
                           title='Edit Product',
                           product=product)


@admin_bp.route('/products/delete/<int:product_id>', methods=['POST'])
@login_required
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted successfully!', 'success')
    return redirect(url_for('admin.products'))


@admin_bp.route('/orders')
@login_required
@admin_required
def orders():
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', '')

    query = Order.query

    if status_filter:
        query = query.filter_by(status=status_filter)

    orders = query.order_by(Order.created_at.desc()).paginate(page=page,
                                                              per_page=20,
                                                              error_out=False)

    return render_template('admin/orders.html',
                           orders=orders,
                           current_status=status_filter)


@admin_bp.route('/orders/<int:order_id>')
@login_required
@admin_required
def order_detail(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template('admin/order_detail.html', order=order)


@admin_bp.route('/orders/update_status/<int:order_id>', methods=['POST'])
@login_required
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.form.get('status')

    if new_status in [
            'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    ]:
        order.status = new_status
        db.session.commit()
        flash(f'Order status updated to {new_status}.', 'success')
    else:
        flash('Invalid status.', 'error')

    return redirect(url_for('admin.order_detail', order_id=order.id))


@admin_bp.route('/users')
@login_required
@admin_required
def users():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')

    query = User.query

    if search:
        query = query.filter((User.username.contains(search))
                             | (User.email.contains(search))
                             | (User.first_name.contains(search))
                             | (User.last_name.contains(search)))

    users = query.order_by(User.created_at.desc()).paginate(page=page,
                                                            per_page=20,
                                                            error_out=False)

    return render_template('admin/users.html', users=users, search=search)


@admin_bp.route('/messages')
@login_required
@admin_required
def messages():
    page = request.args.get('page', 1, type=int)
    messages = ContactMessage.query.order_by(
        ContactMessage.created_at.desc()).paginate(page=page,
                                                   per_page=20,
                                                   error_out=False)
    return render_template('admin/messages.html', messages=messages)


@admin_bp.route('/messages/mark_read/<int:message_id>')
@login_required
@admin_required
def mark_message_read(message_id):
    message = ContactMessage.query.get_or_404(message_id)
    message.is_read = True
    db.session.commit()
    return redirect(url_for('admin.messages'))


# ---- Site Customization List ----
@admin_bp.route('/site-customization')
@login_required
@admin_required
def site_customization():
    page = request.args.get('page', 1, type=int)

    customizations = Customization.query.order_by(
        Customization.position_order.asc()).paginate(page=page,
                                                     per_page=10,
                                                     error_out=False)

    return render_template('admin/site_customization.html',
                           customizations=customizations)


# ---- Create Customization ----
@admin_bp.route('/create-customization', methods=['GET', 'POST'])
@login_required
@admin_required
def create_customization():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        position_order = request.form.get('position_order',
                                          type=int,
                                          default=0)

        new_customization = Customization(title=title,
                                          content=content,
                                          position_order=position_order)
        db.session.add(new_customization)
        db.session.commit()
        flash("Customization created successfully.", "success")
        return redirect(url_for('admin.site_customization'))

    return render_template('admin/create_customization.html')


# ---- Edit Customization ----
@admin_bp.route('/edit-customization/<int:id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_customization(id):
    customization = Customization.query.get_or_404(id)

    if request.method == 'POST':
        customization.title = request.form['title']
        customization.content = request.form['content']
        customization.position_order = request.form.get('position_order',
                                                        type=int,
                                                        default=0)

        db.session.commit()
        flash("Customization updated successfully.", "success")
        return redirect(url_for('admin.site_customization'))

    return render_template('admin/edit_customization.html',
                           customization=customization)


# ---- Delete Customization ----
@admin_bp.route('/delete-customization/<int:id>', methods=['POST'])
@login_required
@admin_required
def delete_customization(id):
    customization = Customization.query.get_or_404(id)
    db.session.delete(customization)
    db.session.commit()
    flash("Customization deleted successfully.", "success")
    return redirect(url_for('admin.site_customization'))


# ---- List Payment Methods ----
@admin_bp.route('/payment-methods')
@login_required
@admin_required
def payment_methods():
    methods = PaymentMethod.query.order_by(
        PaymentMethod.created_at.desc()).all()
    return render_template('admin/payment_methods.html', methods=methods)


# ---- Add Payment Method ----
@admin_bp.route('/payment-methods/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_payment_method():
    form = PaymentMethodForm()
    if form.validate_on_submit():
        method = PaymentMethod(name=form.name.data,
                               method_type=form.method_type.data,
                               configuration=form.configuration.data,
                               instructions=form.instructions.data,
                               is_active=form.is_active.data)
        db.session.add(method)
        db.session.commit()
        flash("Payment method added successfully!", "success")
        return redirect(url_for('admin.payment_methods'))
    return render_template('admin/payment_method_form.html',
                           form=form,
                           title="Add Payment Method")


# ---- Edit Payment Method ----
@admin_bp.route('/payment-methods/edit/<int:method_id>',
                methods=['GET', 'POST'])
@login_required
@admin_required
def edit_payment_method(method_id):
    method = PaymentMethod.query.get_or_404(method_id)
    form = PaymentMethodForm(obj=method)
    if form.validate_on_submit():
        method.name = form.name.data
        method.method_type = form.method_type.data
        method.configuration = form.configuration.data
        method.instructions = form.instructions.data
        method.is_active = form.is_active.data
        db.session.commit()
        flash("Payment method updated successfully!", "success")
        return redirect(url_for('admin.payment_methods'))
    return render_template('admin/payment_method_form.html',
                           form=form,
                           title="Edit Payment Method",
                           method=method)


# ---- Delete Payment Method ----
@admin_bp.route('/payment-methods/delete/<int:method_id>', methods=['POST'])
@login_required
@admin_required
def delete_payment_method(method_id):
    method = PaymentMethod.query.get_or_404(method_id)
    db.session.delete(method)
    db.session.commit()
    flash("Payment method deleted successfully!", "success")
    return redirect(url_for('admin.payment_methods'))

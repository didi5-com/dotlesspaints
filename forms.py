from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, FloatField, IntegerField, BooleanField, SelectField, PasswordField, SubmitField, HiddenField
from wtforms.validators import DataRequired, Email, Length, NumberRange, Optional
from wtforms.widgets import TextArea


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])


class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name', validators=[DataRequired(), Length(max=50)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(max=50)])
    phone = StringField('Phone Number', validators=[DataRequired(), Length(max=20)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', 
                                   validators=[DataRequired(), EqualTo('password')])


class ProfileForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    first_name = StringField('First Name', validators=[DataRequired(), Length(max=50)])
    last_name = StringField('Last Name', validators=[DataRequired(), Length(max=50)])
    phone = StringField('Phone Number', validators=[DataRequired(), Length(max=20)])
    address = TextAreaField('Address', validators=[Length(max=200)])


class ProductForm(FlaskForm):
    name = StringField('Product Name', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', widget=TextArea())
    price = FloatField('Price (NGN)', validators=[DataRequired(), NumberRange(min=0)])
    original_price = FloatField('Original Price (NGN)', validators=[NumberRange(min=0)])
    image_url = StringField('Image URL', validators=[Length(max=200)])
    category = SelectField('Category', choices=[
        ('paints', 'Paints'),
        ('brushes', 'Brushes'),
        ('accessories', 'Accessories'),
        ('tools', 'Tools')
    ])
    stock_quantity = IntegerField('Stock Quantity', validators=[DataRequired(), NumberRange(min=0)])
    is_active = BooleanField('Active')


class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    message = TextAreaField('Message', validators=[DataRequired(), Length(max=1000)])


class CheckoutForm(FlaskForm):
    shipping_address = TextAreaField('Shipping Address', validators=[DataRequired(), Length(min=10, max=500)])
    phone = StringField('Phone Number', validators=[DataRequired(), Length(min=10, max=20)])
    payment_method = SelectField('Payment Method', validators=[DataRequired()])
    submit = SubmitField('Place Order')


class SiteCustomizationForm(FlaskForm):
    section = SelectField('Section', choices=[
        ('header', 'Header'),
        ('hero', 'Hero Section'),
        ('about', 'About Section'),
        ('footer', 'Footer'),
        ('general', 'General')
    ], validators=[DataRequired()])
    element_type = SelectField('Element Type', choices=[
        ('text', 'Text'),
        ('image', 'Image'),
        ('color', 'Color'),
        ('style', 'Style')
    ], validators=[DataRequired()])
    element_key = StringField('Element Key', validators=[DataRequired(), Length(max=100)])
    content = TextAreaField('Content')
    style_properties = TextAreaField('Style Properties (CSS)')
    position_order = IntegerField('Position Order', default=0)
    is_active = BooleanField('Active', default=True)
    submit = SubmitField('Save Customization')


class PaymentMethodForm(FlaskForm):
    name = StringField('Payment Method Name', validators=[DataRequired(), Length(max=50)])
    method_type = SelectField('Method Type', choices=[
        ('gateway', 'Payment Gateway'),
        ('manual', 'Manual Payment'),
        ('crypto', 'Cryptocurrency')
    ], validators=[DataRequired()])
    configuration = TextAreaField('Configuration (JSON)')
    instructions = TextAreaField('Payment Instructions')
    is_active = BooleanField('Active', default=True)
    submit = SubmitField('Save Payment Method')
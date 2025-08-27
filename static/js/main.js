// Main JavaScript for Doctless Paint

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initProductInteractions();
    initImageHandling();
    initFormValidation();
    initTooltips();
    initSmoothScrolling();
    initCartCounter();
    initSearchFunctionality();
});

// Navigation functionality
function initNavigation() {
    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Add active class to current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Product interaction functionality
function initProductInteractions() {
    // Product card hover effects
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        });
    });

    // Quantity input validation
    const quantityInputs = document.querySelectorAll('input[type="number"]');

    quantityInputs.forEach(input => {
        input.addEventListener('input', function() {
            const min = parseInt(this.getAttribute('min')) || 1;
            const max = parseInt(this.getAttribute('max'));
            let value = parseInt(this.value);

            if (value < min) {
                this.value = min;
            } else if (max && value > max) {
                this.value = max;
                showNotification('Maximum stock limit reached', 'warning');
            }
        });
    });

    // Add to cart button loading state
    const addToCartForms = document.querySelectorAll('form[action*="add_to_cart"]');

    addToCartForms.forEach(form => {
        form.addEventListener('submit', function() {
            const button = this.querySelector('button[type="submit"]');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
                button.disabled = true;

                // Re-enable after 2 seconds (form will redirect anyway)
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            }
        });
    });
}

// Image handling functionality
function initImageHandling() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }

    // Image error handling
    const allImages = document.querySelectorAll('img');

    allImages.forEach(img => {
        img.addEventListener('error', function() {
            // Replace with placeholder if image fails to load
            this.src = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
            this.alt = 'Image not available';
        });
    });

    // Product image zoom functionality
    const productImages = document.querySelectorAll('.main-product-image');

    productImages.forEach(img => {
        img.addEventListener('click', function() {
            openImageModal(this.src, this.alt);
        });

        img.style.cursor = 'zoom-in';
    });

    // Image URL preview
    const imageUrlInput = document.getElementById('image_url');
    if (imageUrlInput) {
        // Create preview element
        const previewDiv = document.createElement('div');
        previewDiv.className = 'mt-2';
        previewDiv.innerHTML = '<img id="imagePreview" class="img-fluid rounded border" style="max-height: 150px; display: none;">';
        imageUrlInput.parentNode.appendChild(previewDiv);

        const imagePreview = document.getElementById('imagePreview');

        imageUrlInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url) {
                imagePreview.src = url;
                imagePreview.style.display = 'block';
                imagePreview.onerror = function() {
                    this.style.display = 'none';
                };
            } else {
                imagePreview.style.display = 'none';
            }
        });
    }
}

// Form validation functionality
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');

                    // Remove invalid class when user starts typing
                    field.addEventListener('input', function() {
                        this.classList.remove('is-invalid');
                    });
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
            }
        });
    });

    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');

    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (this.value && !emailRegex.test(this.value)) {
                this.classList.add('is-invalid');
                showNotification('Please enter a valid email address', 'error');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    });

    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');

    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove non-numeric characters except +
            let value = this.value.replace(/[^\d+]/g, '');

            // Ensure it starts with + if it's an international number
            if (value.length > 0 && !value.startsWith('+')) {
                if (value.startsWith('234') || value.startsWith('0')) {
                    // Nigerian number
                    if (value.startsWith('0')) {
                        value = '+234' + value.substring(1);
                    } else if (value.startsWith('234')) {
                        value = '+' + value;
                    }
                }
            }

            this.value = value;
        });
    });
}

// Initialize tooltips
function initTooltips() {
    // Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Smooth scrolling functionality
function initSmoothScrolling() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Cart counter functionality
function initCartCounter() {
    const cartCounter = document.querySelector('.cart-count');

    if (cartCounter) {
        // Update cart counter after adding items
        const addToCartButtons = document.querySelectorAll('button[type="submit"]');

        addToCartButtons.forEach(button => {
            const form = button.closest('form');
            if (form && form.action.includes('add_to_cart')) {
                form.addEventListener('submit', function() {
                    // Increment cart counter (simplified)
                    setTimeout(() => {
                        const currentCount = parseInt(cartCounter.textContent) || 0;
                        cartCounter.textContent = currentCount + 1;

                        // Add animation
                        cartCounter.classList.add('animate__animated', 'animate__pulse');
                        setTimeout(() => {
                            cartCounter.classList.remove('animate__animated', 'animate__pulse');
                        }, 1000);
                    }, 500);
                });
            }
        });
    }
}

// Search functionality
function initSearchFunctionality() {
    const searchForms = document.querySelectorAll('form[method="GET"]');

    searchForms.forEach(form => {
        const searchInput = form.querySelector('input[name="search"]');

        if (searchInput) {
            // Add search icon
            const searchIcon = document.createElement('i');
            searchIcon.className = 'fas fa-search position-absolute';
            searchIcon.style.cssText = 'right: 15px; top: 50%; transform: translateY(-50%); color: #999; pointer-events: none;';

            const inputContainer = searchInput.parentElement;
            inputContainer.style.position = 'relative';
            inputContainer.appendChild(searchIcon);

            searchInput.style.paddingRight = '40px';

            // Clear search functionality
            if (searchInput.value) {
                const clearButton = document.createElement('button');
                clearButton.type = 'button';
                clearButton.className = 'btn btn-sm btn-outline-secondary position-absolute';
                clearButton.style.cssText = 'right: 50px; top: 50%; transform: translateY(-50%); z-index: 10;';
                clearButton.innerHTML = '<i class="fas fa-times"></i>';

                clearButton.addEventListener('click', function() {
                    searchInput.value = '';
                    form.submit();
                });

                inputContainer.appendChild(clearButton);
                searchInput.style.paddingRight = '80px';
            }
        }
    });
}

// Payment method selection
document.addEventListener('DOMContentLoaded', function() {
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all payment details
            document.querySelectorAll('.payment-details').forEach(detail => {
                detail.style.display = 'none';
            });

            // Show selected payment details
            const selectedDetails = document.querySelector('#payment-details-' + this.value);
            if (selectedDetails) {
                selectedDetails.style.display = 'block';
            }
        });
    });

    // Initialize Paystack payment
    const paystackBtn = document.querySelector('#paystack-btn');
    if (paystackBtn) {
        paystackBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const amountField = document.querySelector('#amount');
            const emailField = document.querySelector('#email');
            const referenceField = document.querySelector('#reference');
            const publicKeyField = document.querySelector('#paystack-public-key');

            if (!amountField || !emailField || !referenceField || !publicKeyField) {
                alert('Payment form is missing required fields');
                return;
            }

            const amount = parseInt(amountField.value) * 100; // Convert to kobo
            const email = emailField.value;
            const reference = referenceField.value;

            let handler = PaystackPop.setup({
                key: publicKeyField.value,
                email: email,
                amount: amount,
                currency: 'NGN',
                ref: reference,
                callback: function(response) {
                    // Payment successful
                    const paystackRefField = document.querySelector('#paystack-reference');
                    if (paystackRefField) {
                        paystackRefField.value = response.reference;
                    }
                    const paymentForm = document.querySelector('#payment-form');
                    if (paymentForm) {
                        paymentForm.submit();
                    }
                },
                onClose: function() {
                    alert('Payment cancelled');
                }
            });

            handler.openIframe();
        });
    }

    // Handle crypto payment
    const cryptoBtn = document.querySelector('#crypto-btn');
    if (cryptoBtn) {
        cryptoBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const walletField = document.querySelector('#crypto-wallet');
            const amountField = document.querySelector('#crypto-amount');

            if (!walletField || !amountField) {
                alert('Crypto form fields are missing');
                return;
            }

            const walletAddress = walletField.value;
            const amount = amountField.value;

            if (!walletAddress || !amount) {
                alert('Please fill in all crypto payment details');
                return;
            }

            // Submit crypto payment form
            const cryptoForm = document.querySelector('#crypto-form');
            if (cryptoForm) {
                cryptoForm.submit();
            }
        });
    }

    // Handle bank transfer
    const bankBtn = document.querySelector('#bank-btn');
    if (bankBtn) {
        bankBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Submit bank transfer form
            const bankForm = document.querySelector('#bank-form');
            if (bankForm) {
                bankForm.submit();
            }
        });
    }

    // Handle form submission
    const checkoutForm = document.querySelector('#checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            const selectedPayment = document.querySelector('input[name="payment_method"]:checked');
            if (!selectedPayment) {
                e.preventDefault();
                alert('Please select a payment method');
                return;
            }
        });
    }
});

// Product image preview
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.querySelector('#image-preview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Form validation
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let hasErrors = false;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    hasErrors = true;
                } else {
                    field.classList.remove('is-invalid');
                }
            });

            if (hasErrors) {
                e.preventDefault();
            }
        });
    });
});

// Quantity controls
document.addEventListener('DOMContentLoaded', function() {
    const quantityInputs = document.querySelectorAll('.quantity-input');

    quantityInputs.forEach(input => {
        const minusBtn = input.parentElement.querySelector('.quantity-minus');
        const plusBtn = input.parentElement.querySelector('.quantity-plus');

        if (minusBtn) {
            minusBtn.addEventListener('click', function() {
                let value = parseInt(input.value);
                if (value > 1) {
                    input.value = value - 1;
                }
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', function() {
                let value = parseInt(input.value);
                const max = parseInt(input.getAttribute('max')) || 999;
                if (value < max) {
                    input.value = value + 1;
                }
            });
        }
    });
});

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';

    notification.innerHTML = `
        <i class="fas fa-${getIconForType(type)}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getIconForType(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function openImageModal(src, alt) {
    // Create modal for image zoom
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body p-0">
                    <img src="${src}" alt="${alt}" class="img-fluid w-100">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

// Price formatting utility
function formatPrice(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount);
}

// Loading states
function showLoading(element) {
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-overlay';
    loadingSpinner.innerHTML = '<div class="loading-spinner"></div>';

    element.style.position = 'relative';
    element.appendChild(loadingSpinner);
}

function hideLoading(element) {
    const loadingOverlay = element.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
window.DoctlessPaint = {
    showNotification,
    formatPrice,
    showLoading,
    hideLoading,
    debounce
};
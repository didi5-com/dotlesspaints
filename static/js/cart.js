// Cart functionality for Doctless Paint

document.addEventListener('DOMContentLoaded', function() {
    initCartFunctionality();
    initQuantityUpdates();
    initCartSummary();
    initCheckoutValidation();
});

// Initialize cart functionality
function initCartFunctionality() {
    // Cart item removal confirmation
    const removeButtons = document.querySelectorAll('form[action*="remove_from_cart"]');
    
    removeButtons.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const confirmation = confirm('Are you sure you want to remove this item from your cart?');
            if (confirmation) {
                this.submit();
            }
        });
    });

    // Update cart item quantities
    const quantityForms = document.querySelectorAll('form[action*="update_cart"]');
    
    quantityForms.forEach(form => {
        const quantityInput = form.querySelector('input[name="quantity"]');
        
        if (quantityInput) {
            // Debounce quantity updates to prevent excessive requests
            let timeoutId;
            
            quantityInput.addEventListener('input', function() {
                clearTimeout(timeoutId);
                
                timeoutId = setTimeout(() => {
                    if (this.value > 0) {
                        updateCartItemQuantity(form, this.value);
                    }
                }, 1000);
            });
        }
    });

    // Empty cart animation
    animateEmptyCartState();
}

// Initialize quantity update functionality
function initQuantityUpdates() {
    const quantityInputs = document.querySelectorAll('.cart-item-row input[name="quantity"]');
    
    quantityInputs.forEach(input => {
        const row = input.closest('.cart-item-row');
        const maxStock = parseInt(input.getAttribute('max'));
        
        input.addEventListener('change', function() {
            const quantity = parseInt(this.value);
            
            if (quantity <= 0) {
                // Ask for confirmation before removing
                const confirmation = confirm('Setting quantity to 0 will remove this item. Continue?');
                if (confirmation) {
                    this.closest('form').submit();
                } else {
                    this.value = 1;
                }
                return;
            }
            
            if (quantity > maxStock) {
                this.value = maxStock;
                if (window.DoctlessPaint) {
                    window.DoctlessPaint.showNotification(`Only ${maxStock} items available in stock`, 'warning');
                }
                return;
            }
            
            // Update row total
            updateRowTotal(row, quantity);
        });
        
        // Add quantity control buttons
        addQuantityControls(input);
    });
}

// Add quantity control buttons
function addQuantityControls(input) {
    const container = document.createElement('div');
    container.className = 'quantity-controls d-flex align-items-center';
    
    const decreaseBtn = document.createElement('button');
    decreaseBtn.type = 'button';
    decreaseBtn.className = 'btn btn-outline-secondary btn-sm';
    decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
    
    const increaseBtn = document.createElement('button');
    increaseBtn.type = 'button';
    increaseBtn.className = 'btn btn-outline-secondary btn-sm';
    increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
    
    // Wrap input with container
    input.parentNode.insertBefore(container, input);
    container.appendChild(decreaseBtn);
    container.appendChild(input);
    container.appendChild(increaseBtn);
    
    // Add styling to input
    input.className = 'form-control form-control-sm text-center mx-2';
    input.style.width = '80px';
    
    // Add event listeners
    decreaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(input.value) || 1;
        if (currentValue > 1) {
            input.value = currentValue - 1;
            input.dispatchEvent(new Event('change'));
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(input.value) || 0;
        const maxValue = parseInt(input.getAttribute('max')) || 999;
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
            input.dispatchEvent(new Event('change'));
        }
    });
}

// Update row total
function updateRowTotal(row, quantity) {
    const priceElement = row.querySelector('[data-unit-price]');
    if (!priceElement) return;
    
    const unitPrice = parseFloat(priceElement.dataset.unitPrice);
    const totalPrice = unitPrice * quantity;
    
    const totalElement = row.querySelector('.row-total');
    if (totalElement && window.DoctlessPaint) {
        totalElement.textContent = window.DoctlessPaint.formatPrice(totalPrice);
    }
    
    // Update cart summary
    updateCartSummary();
}

// Initialize cart summary
function initCartSummary() {
    const cartSummary = document.querySelector('.card-body');
    if (!cartSummary) return;
    
    // Add real-time total updates
    updateCartSummary();
    
    // Add promotional codes functionality
    addPromotionalCodeInput();
}

// Update cart summary totals
function updateCartSummary() {
    const cartRows = document.querySelectorAll('.cart-item-row');
    let subtotal = 0;
    let itemCount = 0;
    
    cartRows.forEach(row => {
        const quantityInput = row.querySelector('input[name="quantity"]');
        const priceElement = row.querySelector('[data-unit-price]');
        
        if (quantityInput && priceElement) {
            const quantity = parseInt(quantityInput.value) || 0;
            const unitPrice = parseFloat(priceElement.dataset.unitPrice) || 0;
            
            subtotal += quantity * unitPrice;
            itemCount += quantity;
        }
    });
    
    // Update summary display
    const summarySubtotal = document.querySelector('.summary-row:first-child span:last-child');
    const summaryTotal = document.querySelector('.summary-total strong:last-child');
    const itemCountSpan = document.querySelector('.summary-row span:first-child');
    
    if (summarySubtotal && window.DoctlessPaint) {
        summarySubtotal.textContent = window.DoctlessPaint.formatPrice(subtotal);
    }
    
    if (summaryTotal && window.DoctlessPaint) {
        summaryTotal.textContent = window.DoctlessPaint.formatPrice(subtotal);
    }
    
    if (itemCountSpan) {
        itemCountSpan.textContent = `Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
    }
    
    // Update cart badge in navigation
    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
        cartBadge.textContent = itemCount;
        
        if (itemCount === 0) {
            cartBadge.style.display = 'none';
        } else {
            cartBadge.style.display = 'inline-block';
        }
    }
}

// Add promotional code input
function addPromotionalCodeInput() {
    const cartSummary = document.querySelector('.card-body');
    if (!cartSummary || document.querySelector('.promo-code-section')) return;
    
    const promoSection = document.createElement('div');
    promoSection.className = 'promo-code-section mt-3';
    promoSection.innerHTML = `
        <hr>
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Enter promotional code" id="promoCode">
            <button class="btn btn-outline-primary" type="button" onclick="applyPromoCode()">
                Apply
            </button>
        </div>
        <div id="promoMessage" class="mt-2"></div>
    `;
    
    const checkoutButton = cartSummary.querySelector('.btn-primary');
    if (checkoutButton) {
        checkoutButton.parentNode.insertBefore(promoSection, checkoutButton);
    } else {
        cartSummary.appendChild(promoSection);
    }
}

// Apply promotional code
function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    const messageDiv = document.getElementById('promoMessage');
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Please enter a promotional code', 'warning');
        return;
    }
    
    // Simulate promo code validation (in real app, this would be a server request)
    const validCodes = {
        'SAVE10': { discount: 0.10, message: '10% discount applied!' },
        'NEWCUSTOMER': { discount: 0.15, message: '15% new customer discount applied!' },
        'PAINT20': { discount: 0.20, message: '20% paint special discount applied!' }
    };
    
    if (validCodes[code]) {
        const promo = validCodes[code];
        applyDiscount(promo.discount);
        showPromoMessage(promo.message, 'success');
        promoInput.disabled = true;
    } else {
        showPromoMessage('Invalid promotional code', 'error');
    }
}

// Show promotional code message
function showPromoMessage(message, type) {
    const messageDiv = document.getElementById('promoMessage');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-sm`;
    messageDiv.textContent = message;
    
    if (type === 'error') {
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }, 3000);
    }
}

// Apply discount to cart
function applyDiscount(discountPercent) {
    const summaryTotal = document.querySelector('.summary-total strong:last-child');
    const summarySection = document.querySelector('.summary-total').parentElement;
    
    if (!summaryTotal) return;
    
    // Get current total
    const totalText = summaryTotal.textContent.replace(/[^\d.]/g, '');
    const currentTotal = parseFloat(totalText);
    const discountAmount = currentTotal * discountPercent;
    const newTotal = currentTotal - discountAmount;
    
    // Add discount row
    const discountRow = document.createElement('div');
    discountRow.className = 'summary-row d-flex justify-content-between mb-2 text-success';
    discountRow.innerHTML = `
        <span>Discount (${Math.round(discountPercent * 100)}%)</span>
        <span>-${window.DoctlessPaint ? window.DoctlessPaint.formatPrice(discountAmount) : '₦' + discountAmount.toLocaleString()}</span>
    `;
    
    summarySection.insertBefore(discountRow, summarySection.querySelector('.summary-total'));
    
    // Update total
    summaryTotal.textContent = window.DoctlessPaint ? window.DoctlessPaint.formatPrice(newTotal) : '₦' + newTotal.toLocaleString();
}

// Initialize checkout validation
function initCheckoutValidation() {
    const checkoutButton = document.querySelector('.btn[href*="checkout"], .btn-primary[onclick*="checkout"]');
    
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function(e) {
            const cartRows = document.querySelectorAll('.cart-item-row');
            
            if (cartRows.length === 0) {
                e.preventDefault();
                if (window.DoctlessPaint) {
                    window.DoctlessPaint.showNotification('Your cart is empty', 'warning');
                }
                return;
            }
            
            // Check for out of stock items
            let hasOutOfStock = false;
            cartRows.forEach(row => {
                const stockWarning = row.querySelector('.alert-warning');
                if (stockWarning) {
                    hasOutOfStock = true;
                }
            });
            
            if (hasOutOfStock) {
                e.preventDefault();
                if (window.DoctlessPaint) {
                    window.DoctlessPaint.showNotification('Please adjust quantities for out-of-stock items', 'error');
                }
            }
        });
    }
}

// Update cart item quantity via AJAX-like behavior
function updateCartItemQuantity(form, quantity) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Updating...';
    button.disabled = true;
    
    // Simulate form submission after delay
    setTimeout(() => {
        form.submit();
    }, 500);
}

// Animate empty cart state
function animateEmptyCartState() {
    const emptyCartSection = document.querySelector('.text-center.py-5');
    
    if (emptyCartSection) {
        const icon = emptyCartSection.querySelector('.fa-shopping-cart');
        if (icon) {
            // Add floating animation
            icon.style.animation = 'float 3s ease-in-out infinite';
            
            // Add CSS for floating animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Save cart state to localStorage for persistence
function saveCartState() {
    const cartItems = [];
    const cartRows = document.querySelectorAll('.cart-item-row');
    
    cartRows.forEach(row => {
        const quantityInput = row.querySelector('input[name="quantity"]');
        const productName = row.querySelector('h6')?.textContent;
        
        if (quantityInput && productName) {
            cartItems.push({
                name: productName,
                quantity: quantityInput.value
            });
        }
    });
    
    localStorage.setItem('doctless_cart', JSON.stringify(cartItems));
}

// Auto-save cart state on changes
document.addEventListener('change', function(e) {
    if (e.target.matches('input[name="quantity"]')) {
        saveCartState();
    }
});

// Export cart functions
window.CartManager = {
    updateCartSummary,
    applyPromoCode,
    saveCartState
};

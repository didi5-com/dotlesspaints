// Admin Panel JavaScript for Doctless Paint

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    initializeTooltips();
    initializeSidebarToggle();
    initializeDataTables();
    initializeFormValidation();
    initializeNotifications();
});

// Initialize main admin panel functionality
function initializeAdminPanel() {
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert && !alert.classList.contains('permanent')) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    });

    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('[data-bs-toggle="modal"][data-action="delete"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.getAttribute('data-item-name') || 'this item';
            const confirmModal = document.querySelector('#deleteConfirmModal');
            if (confirmModal) {
                const modalBody = confirmModal.querySelector('.modal-body');
                modalBody.innerHTML = `Are you sure you want to delete <strong>${itemName}</strong>? This action cannot be undone.`;
            }
        });
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize sidebar toggle for mobile
function initializeSidebarToggle() {
    const sidebarToggle = document.querySelector('#sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }
}

// Initialize data tables with search and pagination
function initializeDataTables() {
    const searchInputs = document.querySelectorAll('[data-table-search]');

    searchInputs.forEach(input => {
        const targetTable = document.querySelector(input.getAttribute('data-table-search'));
        if (targetTable) {
            input.addEventListener('input', function() {
                filterTable(targetTable, this.value);
            });
        }
    });
}

// Filter table rows based on search term
function filterTable(table, searchTerm) {
    const rows = table.querySelectorAll('tbody tr');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

// Initialize form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');

    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Real-time validation for specific fields
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
        input.addEventListener('input', clearValidation);
    });

    const priceInputs = document.querySelectorAll('input[name="price"], input[name="original_price"]');
    priceInputs.forEach(input => {
        input.addEventListener('blur', validatePrice);
        input.addEventListener('input', clearValidation);
    });
}

// Validate email format
function validateEmail(event) {
    const input = event.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (input.value && !emailRegex.test(input.value)) {
        showFieldError(input, 'Please enter a valid email address');
    }
}

// Validate price format
function validatePrice(event) {
    const input = event.target;
    const value = parseFloat(input.value);

    if (input.value && (isNaN(value) || value < 0)) {
        showFieldError(input, 'Please enter a valid positive number');
    }
}

// Clear field validation
function clearValidation(event) {
    const input = event.target;
    clearFieldError(input);
}

// Show field error
function showFieldError(input, message) {
    clearFieldError(input);

    input.classList.add('is-invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(input) {
    input.classList.remove('is-invalid');
    const errorDiv = input.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Initialize notifications
function initializeNotifications() {
    // Auto-hide success notifications
    const successAlerts = document.querySelectorAll('.alert-success');
    successAlerts.forEach(alert => {
        setTimeout(() => {
            if (alert) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }
        }, 4000);
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const alertContainer = document.querySelector('#alertContainer') || createAlertContainer();

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertContainer.appendChild(alertDiv);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv) {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }
    }, 5000);
}

// Create alert container if it doesn't exist
function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Bulk actions functionality
function initializeBulkActions() {
    const selectAllCheckbox = document.querySelector('#selectAll');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');
    const bulkActionButton = document.querySelector('#bulkActionButton');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            itemCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBulkActionButton();
        });
    }

    itemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActionButton);
    });

    function updateBulkActionButton() {
        const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');
        if (bulkActionButton) {
            bulkActionButton.disabled = checkedBoxes.length === 0;
            bulkActionButton.textContent = `Actions (${checkedBoxes.length})`;
        }
    }
}

// Export functions for global use
window.AdminPanel = {
    showNotification,
    filterTable,
    initializeBulkActions
};
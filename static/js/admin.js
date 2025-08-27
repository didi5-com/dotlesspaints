// Admin panel JavaScript for Doctless Paint

document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initDataTables();
    initCharts();
    initFormValidation();
    initImagePreviews();
    initBulkActions();
    initNotifications();
    initOrderManagement();
    initProductManagement();
});

// Sidebar functionality
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 768 && 
                    !sidebar.contains(e.target) && 
                    !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            });
        });
    }

    // Set active navigation item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href) && href !== '#') {
            link.classList.add('active');
        }
    });

    // Auto-collapse sidebar on small screens
    function handleResize() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
        }
    }
    
    window.addEventListener('resize', handleResize);
}

// Initialize enhanced data tables
function initDataTables() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        // Add search functionality to tables
        addTableSearch(table);
        
        // Add sorting functionality
        addTableSorting(table);
        
        // Add row selection for bulk actions
        addRowSelection(table);
        
        // Add responsive behavior
        makeTableResponsive(table);
    });
}

// Add search functionality to tables
function addTableSearch(table) {
    const tableContainer = table.closest('.card');
    if (!tableContainer) return;
    
    const existingSearch = tableContainer.querySelector('.table-search');
    if (existingSearch) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'table-search mb-3 d-flex justify-content-between align-items-center';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control';
    searchInput.placeholder = 'Search table...';
    searchInput.style.maxWidth = '300px';
    
    const entriesSelect = document.createElement('select');
    entriesSelect.className = 'form-select';
    entriesSelect.style.maxWidth = '120px';
    entriesSelect.innerHTML = `
        <option value="10">10 entries</option>
        <option value="25" selected>25 entries</option>
        <option value="50">50 entries</option>
        <option value="100">100 entries</option>
    `;
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(entriesSelect);
    
    const cardBody = tableContainer.querySelector('.card-body');
    cardBody.insertBefore(searchContainer, table);
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Add sorting functionality to tables
function addTableSorting(table) {
    const headers = table.querySelectorAll('thead th');
    
    headers.forEach((header, index) => {
        if (header.textContent.trim()) {
            header.style.cursor = 'pointer';
            header.innerHTML += ' <i class="fas fa-sort text-muted"></i>';
            
            header.addEventListener('click', function() {
                sortTable(table, index);
            });
        }
    });
}

// Sort table by column
function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const header = table.querySelectorAll('thead th')[columnIndex];
    const sortIcon = header.querySelector('i');
    
    // Determine sort direction
    let ascending = !header.classList.contains('sort-asc');
    
    // Reset all sort indicators
    table.querySelectorAll('thead th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        const icon = th.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-sort text-muted';
        }
    });
    
    // Sort rows
    rows.sort((a, b) => {
        const aVal = a.cells[columnIndex].textContent.trim();
        const bVal = b.cells[columnIndex].textContent.trim();
        
        // Handle numbers
        if (!isNaN(aVal) && !isNaN(bVal)) {
            return ascending ? aVal - bVal : bVal - aVal;
        }
        
        // Handle text
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    
    // Update DOM
    rows.forEach(row => tbody.appendChild(row));
    
    // Update sort indicator
    header.classList.add(ascending ? 'sort-asc' : 'sort-desc');
    sortIcon.className = `fas fa-sort-${ascending ? 'up' : 'down'} text-primary`;
}

// Add row selection for bulk actions
function addRowSelection(table) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    // Add master checkbox in header
    const headerRow = table.querySelector('thead tr');
    if (headerRow && !headerRow.querySelector('.select-all-checkbox')) {
        const masterCheckboxTh = document.createElement('th');
        masterCheckboxTh.innerHTML = '<input type="checkbox" class="form-check-input select-all-checkbox">';
        headerRow.insertBefore(masterCheckboxTh, headerRow.firstChild);
        
        const masterCheckbox = masterCheckboxTh.querySelector('input');
        masterCheckbox.addEventListener('change', function() {
            const rowCheckboxes = tbody.querySelectorAll('.row-checkbox');
            rowCheckboxes.forEach(cb => cb.checked = this.checked);
            updateBulkActionButtons();
        });
    }
    
    // Add checkboxes to each row
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        if (!row.querySelector('.row-checkbox')) {
            const checkboxTd = document.createElement('td');
            checkboxTd.innerHTML = '<input type="checkbox" class="form-check-input row-checkbox">';
            row.insertBefore(checkboxTd, row.firstChild);
            
            const checkbox = checkboxTd.querySelector('input');
            checkbox.addEventListener('change', updateBulkActionButtons);
        }
    });
}

// Make table responsive
function makeTableResponsive(table) {
    if (!table.closest('.table-responsive')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    }
}

// Initialize charts for dashboard
function initCharts() {
    // Revenue chart
    const revenueChart = document.getElementById('revenueChart');
    if (revenueChart) {
        createRevenueChart(revenueChart);
    }
    
    // Orders chart
    const ordersChart = document.getElementById('ordersChart');
    if (ordersChart) {
        createOrdersChart(ordersChart);
    }
    
    // Products chart
    const productsChart = document.getElementById('productsChart');
    if (productsChart) {
        createProductsChart(productsChart);
    }
}

// Create revenue chart
function createRevenueChart(canvas) {
    // Sample data - in real app, this would come from server
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [65000, 59000, 80000, 81000, 56000, 95000],
                borderColor: '#667EEA',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₦' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Enhanced form validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });
        
        // Form submission validation
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please correct the errors in the form', 'error');
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Number validation
    if (field.type === 'number' && value) {
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        const numValue = parseFloat(value);
        
        if (min && numValue < parseFloat(min)) {
            isValid = false;
            errorMessage = `Value must be at least ${min}`;
        } else if (max && numValue > parseFloat(max)) {
            isValid = false;
            errorMessage = `Value must be no more than ${max}`;
        }
    }
    
    // Update field appearance
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) feedback.remove();
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        // Add error message
        let feedback = field.parentNode.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            field.parentNode.appendChild(feedback);
        }
        feedback.textContent = errorMessage;
    }
    
    return isValid;
}

// Initialize image previews
function initImagePreviews() {
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    
    imageInputs.forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    showImagePreview(input, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

// Show image preview
function showImagePreview(input, imageSrc) {
    let preview = input.parentNode.querySelector('.image-preview');
    
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'image-preview mt-2';
        input.parentNode.appendChild(preview);
    }
    
    preview.innerHTML = `
        <img src="${imageSrc}" alt="Preview" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
        <button type="button" class="btn btn-sm btn-danger ms-2" onclick="removeImagePreview(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
}

// Remove image preview
function removeImagePreview(button) {
    const preview = button.closest('.image-preview');
    const input = preview.parentNode.querySelector('input[type="file"]');
    
    input.value = '';
    preview.remove();
}

// Initialize bulk actions
function initBulkActions() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const tableContainer = table.closest('.card');
        if (!tableContainer) return;
        
        // Add bulk action buttons
        const bulkActionsContainer = document.createElement('div');
        bulkActionsContainer.className = 'bulk-actions mb-3';
        bulkActionsContainer.style.display = 'none';
        bulkActionsContainer.innerHTML = `
            <div class="d-flex gap-2 align-items-center">
                <span class="text-muted">Selected: <span class="selected-count">0</span> items</span>
                <button type="button" class="btn btn-danger btn-sm" onclick="bulkDelete()">
                    <i class="fas fa-trash"></i> Delete Selected
                </button>
                <button type="button" class="btn btn-warning btn-sm" onclick="bulkToggleStatus()">
                    <i class="fas fa-toggle-on"></i> Toggle Status
                </button>
            </div>
        `;
        
        const cardBody = tableContainer.querySelector('.card-body');
        cardBody.insertBefore(bulkActionsContainer, table);
    });
}

// Update bulk action buttons
function updateBulkActionButtons() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const bulkActions = document.querySelector('.bulk-actions');
    const selectedCount = document.querySelector('.selected-count');
    
    if (bulkActions && selectedCount) {
        if (selectedCheckboxes.length > 0) {
            bulkActions.style.display = 'block';
            selectedCount.textContent = selectedCheckboxes.length;
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

// Bulk delete action
function bulkDelete() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const count = selectedCheckboxes.length;
    
    if (count === 0) return;
    
    const confirmation = confirm(`Are you sure you want to delete ${count} selected item(s)?`);
    if (confirmation) {
        // In a real app, this would make API calls
        selectedCheckboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.style.opacity = '0.5';
        });
        
        showNotification(`${count} item(s) deleted successfully`, 'success');
        
        setTimeout(() => {
            selectedCheckboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                row.remove();
            });
            updateBulkActionButtons();
        }, 1000);
    }
}

// Initialize notifications
function initNotifications() {
    // Auto-dismiss notifications
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        if (alert.classList.contains('alert-dismissible')) {
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.style.opacity = '0';
                    setTimeout(() => alert.remove(), 300);
                }
            }, 5000);
        }
    });
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Initialize order management
function initOrderManagement() {
    // Order status updates
    const statusForms = document.querySelectorAll('form[action*="update_order_status"]');
    
    statusForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const select = this.querySelector('select[name="status"]');
            const currentStatus = select.value;
            
            if (currentStatus === 'cancelled') {
                const confirmation = confirm('Are you sure you want to cancel this order?');
                if (!confirmation) {
                    e.preventDefault();
                }
            }
        });
    });
    
    // Order filters
    initOrderFilters();
}

// Initialize order filters
function initOrderFilters() {
    const statusFilter = document.querySelector('select[name="status"]');
    const dateFilter = document.querySelector('input[name="date"]');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            // Auto-submit form or apply filter
            if (this.closest('form')) {
                this.closest('form').submit();
            }
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            if (this.closest('form')) {
                this.closest('form').submit();
            }
        });
    }
}

// Initialize product management
function initProductManagement() {
    // Stock alerts
    const stockInputs = document.querySelectorAll('input[name="stock_quantity"]');
    
    stockInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseInt(this.value);
            const warning = this.parentNode.querySelector('.stock-warning');
            
            if (value <= 5) {
                if (!warning) {
                    const warningDiv = document.createElement('div');
                    warningDiv.className = 'stock-warning text-warning small mt-1';
                    warningDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Low stock alert';
                    this.parentNode.appendChild(warningDiv);
                }
            } else if (warning) {
                warning.remove();
            }
        });
    });
    
    // Price validation
    const priceInputs = document.querySelectorAll('input[name="price"], input[name="original_price"]');
    
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Format price display
            const value = parseFloat(this.value);
            if (!isNaN(value)) {
                this.title = `₦${value.toLocaleString()}`;
            }
        });
    });
}

// Export admin functions
window.AdminPanel = {
    showNotification,
    validateField,
    bulkDelete,
    updateBulkActionButtons
};

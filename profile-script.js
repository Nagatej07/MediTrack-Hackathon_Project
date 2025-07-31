// DOM Elements
const profileForm = document.getElementById('profileForm');
const backButton = document.getElementById('backButton');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const profileAvatarLarge = document.getElementById('profileAvatarLarge');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const successModal = document.getElementById('successModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// Form state management
let originalFormData = {};
let hasUnsavedChanges = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadUserProfile();
    setupFormValidation();
    console.log('MediTrack+ Profile Page Initialized');
});

// Event Listeners
function initializeEventListeners() {
    // Navigation events
    backButton.addEventListener('click', handleBackNavigation);
    
    // Profile photo events
    changePhotoBtn.addEventListener('click', handlePhotoChange);
    profileAvatarLarge.addEventListener('click', handlePhotoChange);
    
    // Form events
    profileForm.addEventListener('submit', handleFormSubmit);
    profileForm.addEventListener('input', handleFormChange);
    profileForm.addEventListener('change', handleFormChange);
    
    // Button events
    saveBtn.addEventListener('click', handleFormSubmit);
    cancelBtn.addEventListener('click', handleCancelChanges);
    modalCloseBtn.addEventListener('click', closeSuccessModal);
    
    // Modal events
    successModal.addEventListener('click', handleModalOverlayClick);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Before unload warning
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Auto-save functionality (optional)
    setInterval(autoSave, 30000); // Auto-save every 30 seconds
}

// Navigation handling
function handleBackNavigation(e) {
    e.preventDefault();
    
    if (hasUnsavedChanges) {
        const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
        if (!confirmLeave) return;
    }
    
    // Navigate back to chat interface
    window.location.href = 'dashboard.html';
}

function handleBeforeUnload(e) {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
}

// Profile photo handling
function handlePhotoChange() {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file', 'error');
                return;
            }
            
            // Read and display the image
            const reader = new FileReader();
            reader.onload = (e) => {
                updateProfilePhoto(e.target.result);
                hasUnsavedChanges = true;
                updateSaveButtonState();
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function updateProfilePhoto(imageSrc) {
    // Create image element
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
    `;
    
    // Replace avatar content
    profileAvatarLarge.innerHTML = '';
    profileAvatarLarge.appendChild(img);
    
    // Add upload overlay back
    const overlay = document.createElement('div');
    overlay.className = 'avatar-upload-overlay';
    overlay.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
    `;
    profileAvatarLarge.appendChild(overlay);
    
    showNotification('Profile photo updated successfully', 'success');
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please correct the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    saveBtn.classList.add('loading');
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        saveProfile();
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
    }, 2000);
}

function handleFormChange() {
    hasUnsavedChanges = true;
    updateSaveButtonState();
    
    // Real-time validation
    const changedElement = event.target;
    validateField(changedElement);
}

function handleCancelChanges() {
    if (hasUnsavedChanges) {
        const confirmCancel = confirm('Are you sure you want to discard your changes?');
        if (!confirmCancel) return;
    }
    
    // Reset form to original state
    loadFormData(originalFormData);
    hasUnsavedChanges = false;
    updateSaveButtonState();
    clearValidationStates();
    
    showNotification('Changes discarded', 'info');
}

// Form validation
function setupFormValidation() {
    const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateField(field));
        }
    });
}

function validateField(field) {
    const fieldGroup = field.closest('.form-group');
    const fieldValue = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing validation states
    fieldGroup.classList.remove('error', 'success');
    const existingError = fieldGroup.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Required field validation
    if (field.hasAttribute('required') && !fieldValue) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && fieldValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fieldValue)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && fieldValue) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(fieldValue.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Date of birth validation
    if (field.type === 'date' && fieldValue) {
        const birthDate = new Date(fieldValue);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (birthDate > today) {
            isValid = false;
            errorMessage = 'Birth date cannot be in the future';
        } else if (age > 150) {
            isValid = false;
            errorMessage = 'Please enter a valid birth date';
        }
    }
    
    // Height validation
    if (field.id === 'height' && fieldValue) {
        const height = parseInt(fieldValue);
        if (height < 50 || height > 300) {
            isValid = false;
            errorMessage = 'Height must be between 50-300 cm';
        }
    }
    
    // Weight validation
    if (field.id === 'weight' && fieldValue) {
        const weight = parseInt(fieldValue);
        if (weight < 20 || weight > 500) {
            isValid = false;
            errorMessage = 'Weight must be between 20-500 kg';
        }
    }
    
    // Apply validation state
    if (isValid && fieldValue) {
        fieldGroup.classList.add('success');
    } else if (!isValid) {
        fieldGroup.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        fieldGroup.appendChild(errorDiv);
    }
    
    return isValid;
}

function validateForm() {
    const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender'];
    let isFormValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

function clearValidationStates() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) errorMessage.remove();
    });
}

// Data management
function loadUserProfile() {
    // Simulate loading user data
    const userData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        height: '',
        weight: '',
        allergies: '',
        medications: '',
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',
        dataSharing: false,
        appointmentReminders: true,
        medicationAlerts: true,
        healthTips: true
    };
    
    // Store original data
    originalFormData = { ...userData };
    
    // Load data into form
    loadFormData(userData);
}

function loadFormData(data) {
    Object.keys(data).forEach(key => {
        const field = document.getElementById(key);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else {
                field.value = data[key];
            }
        }
    });
}

function getFormData() {
    const formData = new FormData(profileForm);
    const data = {};
    
    // Get all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Handle checkboxes separately
    const checkboxes = profileForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        data[checkbox.name] = checkbox.checked;
    });
    
    return data;
}

function saveProfile() {
    const profileData = getFormData();
    
    // Simulate API call to save profile
    console.log('Saving profile data:', profileData);
    
    // Update original data
    originalFormData = { ...profileData };
    hasUnsavedChanges = false;
    updateSaveButtonState();
    
    // Show success modal
    showSuccessModal();
    
    // Update local storage (for demo purposes)
    localStorage.setItem('meditrack_profile', JSON.stringify(profileData));
}

function autoSave() {
    if (hasUnsavedChanges && validateForm()) {
        const profileData = getFormData();
        localStorage.setItem('meditrack_profile_draft', JSON.stringify(profileData));
        console.log('Auto-saved profile draft');
    }
}

// UI state management
function updateSaveButtonState() {
    if (hasUnsavedChanges) {
        saveBtn.style.opacity = '1';
        saveBtn.disabled = false;
        cancelBtn.style.opacity = '1';
        cancelBtn.disabled = false;
    } else {
        saveBtn.style.opacity = '0.6';
        saveBtn.disabled = true;
        cancelBtn.style.opacity = '0.6';
        cancelBtn.disabled = true;
    }
}

// Modal handling
function showSuccessModal() {
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus the close button for accessibility
    setTimeout(() => {
        modalCloseBtn.focus();
    }, 300);
}

function closeSuccessModal() {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleModalOverlayClick(e) {
    if (e.target === successModal) {
        closeSuccessModal();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        font-family: 'Inter', sans-serif;
    `;
    
    // Set colors based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#43A047';
            notification.style.color = '#FFFFFF';
            break;
        case 'error':
            notification.style.backgroundColor = '#F44336';
            notification.style.color = '#FFFFFF';
            break;
        case 'info':
            notification.style.backgroundColor = '#1976D2';
            notification.style.color = '#FFFFFF';
            break;
        default:
            notification.style.backgroundColor = '#9E9E9E';
            notification.style.color = '#FFFFFF';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Keyboard navigation
function handleKeyboardNavigation(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        if (successModal.classList.contains('active')) {
            closeSuccessModal();
        }
    }
    
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!saveBtn.disabled) {
            handleFormSubmit(e);
        }
    }
    
    // Ctrl/Cmd + Z to cancel changes
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (hasUnsavedChanges) {
            handleCancelChanges();
        }
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Enhanced form interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add focus enhancement to form fields
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            field.closest('.input-wrapper').style.transform = 'scale(1.02)';
            field.closest('.input-wrapper').style.transition = 'transform 0.2s ease';
        });
        
        field.addEventListener('blur', () => {
            field.closest('.input-wrapper').style.transform = 'scale(1)';
        });
    });
    
    // Add hover effects to privacy options
    const privacyOptions = document.querySelectorAll('.privacy-option');
    privacyOptions.forEach(option => {
        option.addEventListener('mouseenter', () => {
            option.style.transform = 'translateY(-2px)';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.transform = 'translateY(0)';
        });
    });
});

// Initialize save button state
updateSaveButtonState();

console.log('MediTrack+ Profile Management Ready');
console.log('Features: Real-time validation, auto-save, photo upload, accessibility support');
console.log('Keyboard shortcuts: ESC (close modal), Ctrl/Cmd+S (save), Ctrl/Cmd+Z (cancel changes)');
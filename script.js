// Variables globales
let currentImage = null;
let currentFilter = 'aesthetic-basic';
let isCustomMode = false;

// Elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const originalImage = document.getElementById('originalImage');
const filteredImage = document.getElementById('filteredImage');
const filterButtons = document.querySelectorAll('.filter-btn');
const downloadBtn = document.getElementById('downloadBtn');

// Controles personalizados
const controls = {
    contrast: document.getElementById('contrast'),
    saturate: document.getElementById('saturate'),
    brightness: document.getElementById('brightness'),
    sepia: document.getElementById('sepia'),
    hueRotate: document.getElementById('hueRotate'),
    blur: document.getElementById('blur')
};

const resetBtn = document.getElementById('resetBtn');

// Configuración de filtros
const filters = {
    'aesthetic-basic': {
        name: 'Básico',
        filter: 'contrast(1.4) saturate(0.5) brightness(0.8) sepia(0.0) hue-rotate(-20deg) blur(0.0px)'
    },
    'aesthetic-vintage': {
        name: 'Vintage',
        filter: 'contrast(1.3) saturate(0.6) brightness(0.85) sepia(0.2) hue-rotate(-15deg)'
    },
    'aesthetic-cold': {
        name: 'Frío',
        filter: 'contrast(1.4) saturate(0.5) brightness(0.8) hue-rotate(-30deg) blur(0.2px)'
    },
    'aesthetic-warm': {
        name: 'Cálido',
        filter: 'contrast(1.1) saturate(0.8) brightness(0.95) sepia(0.15) hue-rotate(10deg)'
    },
    'aesthetic-dreamy': {
        name: 'Soñador',
        filter: 'contrast(1.1) saturate(0.6) brightness(1.1) sepia(0.1) hue-rotate(-5deg) blur(0.5px)'
    },
    'aesthetic-dark': {
        name: 'Oscuro',
        filter: 'contrast(1.3) saturate(0.4) brightness(0.7) sepia(0.3) hue-rotate(-20deg)'
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeCustomControls();
    currentImage = originalImage.src; // Usar la imagen por defecto
});

// Event Listeners
function initializeEventListeners() {
    // Upload button event
    uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        imageInput.click();
    });
    
    // Upload area events (for drag and drop)
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input
    imageInput.addEventListener('change', handleFileSelect);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });
    
    // Download button
    downloadBtn.addEventListener('click', downloadFilteredImage);
    
    // Reset button
    resetBtn.addEventListener('click', resetCustomControls);
}

// Drag and Drop handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// File selection handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// File handling
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        displayImages();
    };
    reader.readAsDataURL(file);
}

// Display images
function displayImages() {
    if (!currentImage) return;
    
    originalImage.src = currentImage;
    filteredImage.src = currentImage;
    applyCurrentFilter();
}

// Apply filter
function applyFilter(filterClass) {
    currentFilter = filterClass;
    isCustomMode = false;
    
    // Update button states
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterClass) {
            btn.classList.add('active');
        }
    });
    
    // Apply filter to image
    applyCurrentFilter();
}

// Apply current filter
function applyCurrentFilter() {
    if (!currentImage) return;
    
    if (isCustomMode) {
        updateCustomFilter();
    } else if (filters[currentFilter]) {
        const filterValue = filters[currentFilter].filter;
        filteredImage.style.filter = filterValue;
    }
}

// Download filtered image
function downloadFilteredImage() {
    if (!currentImage) {
        alert('Por favor sube una imagen primero.');
        return;
    }
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply filter to canvas context
        if (isCustomMode) {
            ctx.filter = getCustomFilterValue();
        } else {
            ctx.filter = filters[currentFilter].filter;
        }
        
        // Draw image with filter
        ctx.drawImage(img, 0, 0);
        
        // Download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filterName = isCustomMode ? 'personalizado' : filters[currentFilter].name.toLowerCase();
            a.download = `imagen-aesthetic-${filterName}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    };
    
    img.src = currentImage;
}

// Initialize custom controls
function initializeCustomControls() {
    // Add event listeners to all range inputs
    Object.values(controls).forEach(control => {
        control.addEventListener('input', function() {
            isCustomMode = true;
            updateCustomFilter();
            updateControlValue(this.id, this.value);
        });
    });
}

// Update custom filter
function updateCustomFilter() {
    const filterValue = getCustomFilterValue();
    filteredImage.style.filter = filterValue;
}

// Get custom filter value
function getCustomFilterValue() {
    return `
        contrast(${controls.contrast.value})
        saturate(${controls.saturate.value})
        brightness(${controls.brightness.value})
        sepia(${controls.sepia.value})
        hue-rotate(${controls.hueRotate.value}deg)
        blur(${controls.blur.value}px)
    `.replace(/\s+/g, ' ').trim();
}

// Update control value display
function updateControlValue(controlId, value) {
    const valueElement = document.getElementById(controlId + 'Value');
    if (valueElement) {
        valueElement.textContent = value;
    }
}

// Reset custom controls
function resetCustomControls() {
    const defaultValues = {
        contrast: '1.4',
        saturate: '0.5',
        brightness: '0.8',
        sepia: '0.0',
        hueRotate: '-20',
        blur: '0.0'
    };
    
    Object.keys(controls).forEach(key => {
        controls[key].value = defaultValues[key];
        updateControlValue(controls[key].id, defaultValues[key]);
    });
    
    isCustomMode = false;
    applyFilter('aesthetic-basic');
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#ef4444' : '#10b981',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Error:', e.error);
    showNotification('Ha ocurrido un error. Por favor intenta de nuevo.', 'error');
});

// Prevent default drag behaviors on the page
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());

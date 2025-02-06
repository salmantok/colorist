// Mengambil elemen-elemen HTML yang diperlukan
const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d');
const pointer = document.getElementById('pointer');
const formatSelect = document.getElementById('formatSelect');

let dragging = false; // Menandakan apakah pointer sedang drag
let currentColor = { r: 0, g: 0, b: 0, a: 1 }; // Warna yang dipilih

// Fungsi untuk menggambar lingkaran warna pada canvas
function drawColorCircle() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Loop untuk setiap pixel di canvas
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - canvas.width / 2;
            const dy = y - canvas.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < canvas.width / 2) {
                const angle = Math.atan2(dy, dx) + Math.PI;
                const hue = (angle / (2 * Math.PI)) * 360;
                const saturation = distance / (canvas.width / 2);
                const rgb = hslToRgb(hue, saturation, 0.5);

                // Mengatur warna pada pixel
                const index = (y * canvas.width + x) * 4;
                data[index] = rgb.r;
                data[index + 1] = rgb.g;
                data[index + 2] = rgb.b;
                data[index + 3] = 255;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

// Fungsi konversi HSL ke RGB
function hslToRgb(h, s, l) {
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r, g, b;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
}

// Fungsi untuk mengonversi RGB ke HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let h = 0,
        s = 0,
        l = (max + min) / 2;

    if (diff !== 0) {
        s = diff / (1 - Math.abs(2 * l - 1));
        if (max === r) {
            h = (g - b) / diff + (g < b ? 6 : 0);
        } else if (max === g) {
            h = (b - r) / diff + 2;
        } else {
            h = (r - g) / diff + 4;
        }
        h *= 60;
    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

// Fungsi untuk memilih warna berdasarkan posisi x dan y pada canvas
function pickColor(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] !== 0) {
        currentColor = { r: pixel[0], g: pixel[1], b: pixel[2], a: 1 };
        updateColor();
        movePointer(x, y);
    }
}

// Fungsi untuk memindahkan pointer ke posisi yang sesuai
function movePointer(x, y) {
    pointer.style.left = `${x}px`;
    pointer.style.top = `${y}px`;
}

// Fungsi untuk memperbarui warna sesuai format yang dipilih
function updateColor() {
    let format = formatSelect.value;
    let colorString = formatColor(currentColor, format);

    document.getElementById('colorValue').textContent = colorString;
    document.getElementById('colorPreview').style.backgroundColor = colorString;
}

// Fungsi untuk memformat warna sesuai dengan format yang dipilih
function formatColor({ r, g, b, a }, format) {
    switch (format) {
        case 'hex':
            return rgbToHex(r, g, b);
        case 'rgb':
            return `rgb(${r}, ${g}, ${b})`;
        case 'rgba':
            return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
        case 'hsl':
            const { h, s, l } = rgbToHsl(r, g, b);
            return `hsl(${h}, ${s}%, ${l}%)`;
        case 'hsla':
            const hsl = rgbToHsl(r, g, b);
            return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a.toFixed(2)})`;
        default:
            return '-';
    }
}

// Fungsi untuk mengonversi RGB ke HEX
function rgbToHex(r, g, b) {
    return (
        '#' +
        ((1 << 24) | (r << 16) | (g << 8) | b)
            .toString(16)
            .slice(1)
            .toUpperCase()
    );
}

// Menambahkan event listener untuk mouse
canvas.addEventListener('mousedown', (event) => {
    dragging = true;
    const rect = canvas.getBoundingClientRect();
    pickColor(event.clientX - rect.left, event.clientY - rect.top);
});

// Menambahkan event listener untuk mouse move
canvas.addEventListener('mousemove', (event) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        pickColor(event.clientX - rect.left, event.clientY - rect.top);
    }
});

// Menambahkan event listener untuk mouse up
window.addEventListener('mouseup', () => {
    dragging = false;
});

// Menambahkan event listener untuk touch start
canvas.addEventListener(
    'touchstart',
    (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        pickColor(touch.clientX - rect.left, touch.clientY - rect.top);
        dragging = true;
    },
    { passive: false }
);

// Menambahkan event listener untuk touch move
canvas.addEventListener(
    'touchmove',
    (event) => {
        if (dragging) {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = event.touches[0];
            pickColor(touch.clientX - rect.left, touch.clientY - rect.top);
        }
    },
    { passive: false }
);

// Menambahkan event listener untuk touch end
window.addEventListener('touchend', () => {
    dragging = false;
});

// Inisialisasi saat halaman dimuat
function init() {
    drawColorCircle();
    pickColor(canvas.width / 2, canvas.height / 2); // Set pointer ke tengah canvas
}

window.onload = init;

// Footer
const currentYear = new Date().getFullYear();
const startYear = 2025;

if (currentYear > startYear) {
    document.getElementById('year').textContent =
        `${startYear} - ${currentYear}`;
} else {
    document.getElementById('year').textContent = startYear;
}

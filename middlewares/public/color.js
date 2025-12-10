

function muteIfUgly(hex) {
    const rgb = hexToRgb(hex);
    let { h, s, l } = rgbToHsl(rgb);

    // If the color is overly saturated or too bright,
    // we tone it down like a noisy neighbor after 10 pm.
    if (s > 0.75) s = 0.55; // too neon → reduce saturation
    if (l > 0.95) l = 0.95; // too bright → reduce lightness
    // if (l < 0.25) l = 0.3; // too dark → lighten slightly

    // Reconvert to a muted hex
    return rgbToHex(hslToRgb({ h, s, l }));

    // --- helper functions ---
    function hexToRgb(hex) {
        hex = hex.replace("#", "");
        if (hex.length === 3) {
            hex = hex
                .split("")
                .map((c) => c + c)
                .join("");
        }
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255,
        };
    }

    function rgbToHex({ r, g, b }) {
        return (
            "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
        );
    }

    function rgbToHsl({ r, g, b }) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h,
            s,
            l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h, s, l };
    }

    function hslToRgb({ h, s, l }) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // grayscale
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }
}
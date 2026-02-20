
const AssetProcessor = {
    // Loads an image, resizes it, and optionally removes the checkerboard background
    processImage: async function(imgSrc, targetWidth, targetHeight, removeBg = false) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Helps prevent canvas security errors
            img.onload = () => {
                // Create an off-screen canvas
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                
                // Draw and resize the raw image onto the canvas
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Pixel manipulation to remove the fake checkerboard
                if (removeBg) {
                    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];

                        // The checkerboard is strictly grayscale (white/gray/black).
                        // Wood is brown/yellow (high Red, medium Green, low Blue).
                        // We check if the pixel lacks color saturation (is grayscale).
                        const isGrayscale = Math.abs(r - g) < 20 && Math.abs(r - b) < 20 && Math.abs(g - b) < 20;

                        // If it is grayscale, we make it transparent (Alpha = 0)
                        if (isGrayscale) {
                            data[i + 3] = 0; 
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                // Return the processed canvas as an image element for the game to use
                const processedImg = new Image();
                processedImg.onload = () => resolve(processedImg);
                processedImg.src = canvas.toDataURL('image/png');
            };
            img.onerror = reject;
            img.src = imgSrc;
        });
    }
};

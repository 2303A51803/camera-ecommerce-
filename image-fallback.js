(function () {
    function getKeyword(image) {
        var text = ((image.alt || '') + ' ' + (image.getAttribute('src') || '')).toLowerCase();

        if (text.indexOf('logo') !== -1) return 'camera brand logo';
        if (text.indexOf('lens') !== -1) return 'camera lens';
        if (text.indexOf('tripod') !== -1 || text.indexOf('stabilizer') !== -1) return 'camera tripod';
        if (text.indexOf('accessor') !== -1) return 'camera accessories';
        if (text.indexOf('nikon') !== -1) return 'nikon camera';
        if (text.indexOf('canon') !== -1) return 'canon camera';
        if (text.indexOf('sony') !== -1) return 'sony camera';
        if (text.indexOf('fujifilm') !== -1 || text.indexOf('fuji') !== -1) return 'fujifilm camera';
        if (text.indexOf('panasonic') !== -1 || text.indexOf('lumix') !== -1) return 'panasonic camera';

        return 'camera photography gear';
    }

    function setFallback(image) {
        if (image.dataset.fallbackApplied === '1') return;
        image.dataset.fallbackApplied = '1';
        var keyword = getKeyword(image);
        image.src = 'https://picsum.photos/seed/' + encodeURIComponent(keyword) + '/800/600';
    }

    function setupImageFallbacks() {
        var images = document.querySelectorAll('img');
        images.forEach(function (image) {
            image.addEventListener('error', function () {
                setFallback(image);
            });

            if (image.complete && image.naturalWidth === 0) {
                setFallback(image);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupImageFallbacks);
    } else {
        setupImageFallbacks();
    }
})();
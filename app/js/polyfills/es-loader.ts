(() => {
    function supportsClasses() {
        try {
            eval('class TESTCLASS {}');
            return true;
        } catch(e) {
            return false;
        }
    }

    const tag = document.createElement('script');
    if (supportsClasses()) {
        tag.src = 'options.js';
    } else {
        tag.src = 'options.es3.js';
    }
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(tag);
    });
})();

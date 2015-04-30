describe('converterSpec', function() {

    var mockDiv = document.createElement('div');
    /**
     * Init editor before each test
     */
    beforeEach(function() {
        chaynsEditor.init();
    });

    /**
     * chanysEditor.init()
     * not throwing errors
     */
    it('does not throw', function() {
        expect(chaynsEditor.init).not.toThrow();
    });

    /**
     * util.addToolbarMargin(el)
     */
    it('returns 30px', function() {
        mockDiv.style.marginTop = '0px';
        chaynsEditor.util.addToolbarMargin(mockDiv);
        expect(mockDiv.style.marginTop).toBe('30px');
    });

    /**
     * util.removeToolbarMargin(el)
     */
    it('returns 0px', function() {
        mockDiv.style.marginTop = '30px';
        chaynsEditor.util.removeToolbarMargin(mockDiv);
        expect(mockDiv.style.marginTop).toBe('0px');
    });

    /**
     * util.addToolbarMargin()
     */
    it('returns 30px', function() {
        mockDiv.style.marginTop = '';
        chaynsEditor.util.addToolbarMargin(mockDiv);
        expect(mockDiv.style.marginTop).toBe('30px');
    });

    /**
     * util.getElementTop()
     */
    it('return element top', function() {
        expect(chaynsEditor.util.getElementTop(mockDiv)).not.toBeNull();
    });

    /**
     * util.getElementLeft()
     */
    it('return element left', function() {
        expect(chaynsEditor.util.getElementLeft(mockDiv)).not.toBeNull();
    });

    /**
     * dom.createToolbar()
     */
    it('returns DOMElement', function() {
        expect(chaynsEditor.dom.createToolbar()).not.toBeNull();
        expect(chaynsEditor.dom.createToolbar()).not.toBeUndefined();
    });

});
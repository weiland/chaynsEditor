var chaynsEditor = (function(window, document, undefined) {

    'use strict';

    /*
     * Global Vars
     */
    var
        $toolbar        = null,     // Toolbar for editing texts
        $attachedTo     = null,     // Element, the toolbar is currently attached to
        isChanged       = false,    // True, if the editable element's content changed
        isHtmlView      = false,    // True, if html view is enabled
        elBefore        = {         // Backup of editable element, to restore it to defaults
            'content': null,
            'backgroundColor': null,
            'color': null
        };

    /**
     * Base URL of LangRes EP
     * @type {string}
     * @const
     */
    var LANGRES_URL = 'https://chayns1.tobit.com/TappApi/LangRes/TextString';

    /**
     * Init function.
     *
     * @public
     * @description
     * This function inits the chaynsEditor.
     */
    function init(isInternal) {
        if (util.isChaynsEnvironment() && (isInternal || util.isAdmin())) {
            document.head.appendChild(dom.createDomElement("link", {
                href: '//chayns1.tobit.com/SlitteRessource/ChaynsEditor/css/chaynsEditor.css',
                rel: "stylesheet",
                type: "text/css" }, undefined));
            $toolbar = dom.createToolbar();
            initAttachHandler();
            document.addEventListener('mousedown', leaveHandler);
        } else {
            console.error('Error initializing chaynsEditor.');
        }
    }

    /**
     * Attaches handlers to all [data-lang] elements.
     *
     * @private
     */
    function initAttachHandler() {
        [].forEach.call(document.querySelectorAll('[data-lang]'), function(el) {
            el.addEventListener('click', attachHandler);
        });
    }

    /**
     * Handles clicks on [data-lang] elements.
     *
     * @param e Click event
     * @private
     */
    function attachHandler(e) {
        var el = util.getEditableParent(e.target || e.srcElement);
        if (el !== $attachedTo && e.ctrlKey) {
            if ($attachedTo) {
                detachToolbar($attachedTo);
            }
            attachToolbar(el);
        }
    }

    /**
     * Attaches change handler to element.
     *
     * @param el Element
     * @private
     */
    function initChangeHandler(el) {
        el.addEventListener('keyup', changeHandler);
    }

    /**
     * Detaches change handler from element.
     *
     * @param el Element
     * @private
     */
    function removeChangeHandler(el) {
        el.removeEventListener('keyup');
    }

    /**
     * Handles the changes of content in editable element.
     *
     * @param e Input event
     */
    function changeHandler(e) {
        var el = (e.target || e.srcElement);
        isChanged = (el.innerHTML.trim() != elBefore.content.trim());
        document.querySelector('#save-button').style.display = (isChanged) ? 'inline-block' : 'none';
    }

    /**
     * Handles the event when the user clicks outside of the editable element.
     *
     * @param e Click event
     * @private
     */
    function leaveHandler(e) {
        var el = (e.target || e.srcElement);
        if ($attachedTo
            && !el.isContentEditable
            && !(el === $toolbar)
            && !util.isChildOf($toolbar, el)
        ) {
            if (isChanged) {
                if (isHtmlView) {
                    toggleHtmlView();
                }
                util.confirmAndCall('Willst Du die &Auml;nderungen speichern?', saveChanges, discardChanges);
            }
            detachToolbar($attachedTo);
        }
    }

    /**
     * Backs up the editable element.
     *
     * @param el Element
     * @private
     */
    function backupElement(el) {
        elBefore.content = el.innerHTML;
        elBefore.backgroundColor = el.style.backgroundColor;
        elBefore.color = el.style.color;
    }

    /**
     * Attaches the toolbar to the element,
     * if it is not attached to one.
     *
     * @param el Element
     * @public
     */
    function attachToolbar(el) {
        if (!$attachedTo) {
            dom.setToolbarPosition(el);
            util.addToolbarMargin(el);
            document.body.appendChild($toolbar);
            document.querySelector('#save-button').style.display = 'none';

            $attachedTo = el;
            backupElement(el);
            initChangeHandler(el);
            setEditMode(true);
        }
    }

    /**
     * Detaches the toolbar from the element.
     *
     * @param el Element to detach from
     * @public
     */
    function detachToolbar(el) {
        if ($attachedTo) {
            util.removeToolbarMargin(el);
            document.body.removeChild($toolbar);

            setEditMode(false);
            removeChangeHandler(el);
            $attachedTo = null;
        }
    }

    /**
     * Enables or disables editability of element.
     *
     * @param {boolean} isEditMode True, if edit mode shall be enabled.
     * @private
     */
    function setEditMode(isEditMode) {
        $attachedTo.contentEditable = isEditMode;
        $attachedTo.style.color = (isEditMode) ? elBefore.color : elBefore.color;
        $attachedTo.style.backgroundColor = (isEditMode) ? 'white' : elBefore.backgroundColor;
    }

    /**
     * Switches between rich text and html content inside the editable element.
     *
     * @private
     */
    function toggleHtmlView() {
        if (!isHtmlView) {
            isHtmlView = true;
            document.querySelector('#html-button').classList.add('icon-html-active');
            $attachedTo.innerText = $attachedTo.innerHTML;
        } else {
            isHtmlView = false;
            document.querySelector('#html-button').classList.remove('icon-html-active');
            $attachedTo.innerHTML = $attachedTo.innerText;
        }
    }

    /**
     * Saves the content of the editable element.
     *
     * @private
     */
    function saveChanges() {
        if (isHtmlView) {
            toggleHtmlView();
        }
        var language = chayns.utils.lang.getMappedLanguage() ? chayns.utils.lang.getMappedLanguage() : chayns.utils.lang.langStringMap[chayns.env.language];
        var stringName = chayns.utils.lang.getPrefix() + $attachedTo.dataset.lang;
        var text = $attachedTo.innerHTML;
        var data = 'StringName=' + stringName + '&Text=' + encodeURIComponent(text) + '&Language=' + language;
        window.fetch(LANGRES_URL, {
            mode: 'cors',
            method: 'post',
            headers: {
                'Accept': 'application/x-www-form-urlencoded',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        }).then(function(response) {
            if (response.status === 200) {
                chayns.dialog.alert('', 'Die &Auml;nderungen wurden erfolgreich gespeichert.');
            } else {
                chayns.dialog.alert('', 'Es ist ein Fehler aufgetreten.');
            }
        });
    }

    /**
     * Discards the changes made to the editable element.
     *
     * @private
     */
    function discardChanges() {
        if (isHtmlView) {
            toggleHtmlView();
        }
        $attachedTo.innerHTML = elBefore.content;
    }

    /**
     * Handles button clicks on the toolbar.
     *
     * @param action Action as string to execute
     * @private
     */
    function toolbarButtonListener(action) {
        switch (action) {
            case 'save':
                saveChanges();
                detachToolbar($attachedTo);
                break;
            case 'discard':
                discardChanges();
                detachToolbar($attachedTo);
                break;
            case 'html':
                toggleHtmlView();
                break;
            case 'h1':
            case 'h2':
                document.execCommand('formatBlock', false, action);
                break;
            case 'p':
                document.execCommand('formatBlock', false, action);
                break;
            case 'insertOrderedList':
                document.execCommand('insertHTML', false, '<ol class="list"><li>' + document.getSelection() + '</li></ol>');
                break;
            case 'insertUnorderedList':
                document.execCommand('insertHTML', false, '<ul class="list list--square"><li>' + document.getSelection() + '</li></ul>');
                break;
            case 'seperator':
                break;
            case 'CreateLink':
                // TODO: Better solution?
                // Chayns V3 Prompt?
                var tar = prompt("Link-URL:");
                if (tar !== null) {
                    document.execCommand("CreateLink", false, tar);
                }
                break;
            default:
                document.execCommand(action, false, null);
                break;
        }
    }

    /**
     * Util functions that most likely calculate something.
     */
    var util = (function() {

        /**
         * Checks, if Chayns(R) V3 API is present.
         *
         * @returns {boolean} True, if API is present
         */
        function isChaynsEnvironment() {
            return chayns !== undefined;
        }

        /**
         * Checks, if user is internal.
         *
         * @returns {boolean} True, if user is internal.
         */
        function isAdmin() {
            for (var i = 0; i < chayns.env.user.groups.length; i++) {
                if (chayns.env.user.groups[i].id === 1) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Adds margin according to toolbar height to the element.
         *
         * @param el Element
         */
        function addToolbarMargin(el) {
            var margin = el.style.paddingTop; //marginTop
            margin = (margin) ? (parseInt(margin) + dom.TOOLBAR_SIZE).toPixel() : dom.TOOLBAR_SIZE.toPixel();
            el.style.paddingTop = margin; //marginTop
        }

        /**
         * Removes margin according to toolbar height from the element.
         *
         * @param el Element
         */
        function removeToolbarMargin(el) {
            var margin = el.style.paddingTop; //marginTop
            margin = (parseInt(margin) - dom.TOOLBAR_SIZE).toPixel();
            el.style.paddingTop = margin; //marginTop
        }

        /**
         * Returns top position of element relative to document.
         *
         * @param el Element
         * @returns {string} Top position as pixel string
         */
        function getElementTop(el) {
            return (el.getBoundingClientRect().top + window.pageYOffset - el.ownerDocument.documentElement.clientTop).toPixel();
        }

        /**
         * Returns left position of element relative to document.
         *
         * @param el Element
         * @returns {string} Left position as pixel string
         */
        function getElementLeft(el) {
            return (el.getBoundingClientRect().left + window.pageXOffset - el.ownerDocument.documentElement.clientLeft).toPixel();
        }

        /**
         * Returns width of element.
         *
         * @param el Element
         * @returns {string} Width as pixel string
         */
        function getElementWidth(el) {
            return el.getBoundingClientRect().width.toPixel();
        }

        /**
         * Returns the nearest parent of the element that is eligible for editing.
         *
         * @param el Element
         * @returns Parent element
         */
        function getEditableParent(el) {
            var node = el;
            while (node != null) {
                if (node.tagName.toLowerCase() === 'body') {
                    return null;
                }
                if (node.hasAttribute('data-lang')) {
                    return node;
                }
                node = node.parentNode;
            }
            return null;
        }

        /**
         * Checks if the specified node is the child of the specified parent node.
         *
         * @private
         * @param parent Parent node
         * @param child Child node
         * @return {boolean} true if child descends parent
         */
        function isChildOf(parent, child) {
            var node = child.parentNode;
            while (node) {
                if (node === parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }

        /**
         * Displays a confirm dialog and calls the function matching user input.
         *
         * @param text Text to display within the dialog
         * @param fnYes Function to call, if user response is positive
         * @param fnNo Function to call, if user response is negative
         */
        function confirmAndCall(text, fnYes, fnNo) {
            chayns.dialog.confirm('', text)
                .then(function resolved(data) {
                    if (data === 1) {
                        fnYes();
                    } else {
                        fnNo();
                    }
                }
            );
        }

        /**
         * Converts a number to css compatible pixel string.
         *
         * @returns {string} Number + 'px'
         */
        Number.prototype.toPixel = function() {
            return this.valueOf().toString() + 'px';
        };

        /**
         * Public functions
         */
        return {
            addToolbarMargin: addToolbarMargin,
            removeToolbarMargin: removeToolbarMargin,
            getElementTop: getElementTop,
            getElementLeft: getElementLeft,
            getElementWidth: getElementWidth,
            getEditableParent: getEditableParent,
            isChildOf: isChildOf,
            confirmAndCall: confirmAndCall,
            isChaynsEnvironment: isChaynsEnvironment,
            isAdmin: isAdmin
        };

    })();

    /**
     * Functions that create or manipulate DOMElements
     */
    var dom = (function() {

        var
            TOOLBAR_SIZE = 30,
            TOOLBAR_BUTTONS = [
                { 'name': 'Fett', 'action': 'bold', 'faClass': 'bold', 'float': 'left' },
                { 'name': 'Kursiv', 'action': 'italic', 'faClass': 'italic', 'float': 'left' },
                { 'name': 'Unterstrichen', 'action': 'underline', 'faClass': 'underline', 'float': 'left' },
                { 'name': 'seperator' },
                { 'name': 'Aufzählung', 'action': 'insertUnorderedList', 'faClass': 'list-ul', 'float': 'left' },
                { 'name': 'Nummerierung', 'action': 'insertOrderedList', 'faClass': 'list-ol', 'float': 'left' },
                { 'name': 'Überschrift 1', 'action': 'h1', 'faClass': 'header-1', 'float': 'left' },
                { 'name': 'Überschrift 2', 'action': 'h2', 'faClass': 'header-2', 'float': 'left' },
                { 'name': 'Absatz', 'action': 'p', 'faClass': 'paragraph', 'float': 'left' },
                { 'name': 'Hyperlink', 'action': 'CreateLink', 'faClass': 'anchor', 'float': 'left' },
                { 'name': 'seperator' },
                { 'name': 'HTML anzeigen', 'action': 'html', 'faClass': 'html', 'float': 'left', 'id': 'html-button' },
                { 'name': 'seperator' },
                { 'name': 'Speichern', 'action': 'save', 'faClass': 'save', 'float': 'right', 'id': 'save-button'},
                { 'name': 'Verwerfen', 'action': 'discard', 'faClass': 'discard', 'float': 'right'}
            ];

        /**
         * Creates DOMElement
         *
         * @param type Type of element
         * @param attributes Attributes as json object
         * @param innerHTML innerHTML of the element
         * @returns {Element} created element
         */
        function createDomElement(type, attributes, innerHTML) {
            var DOMElement = document.createElement(type);
            if (innerHTML)
                DOMElement.innerHTML = innerHTML;
            if (attributes && typeof attributes == "object") {
                for (var key in attributes) {
                    DOMElement.setAttribute(key, attributes[key]);
                }
            }
            return DOMElement;
        }

        /**
         * Creates and returns the DOMElement for the toolbar.
         *
         * @public
         */
        function createToolbar() {
            var tb = document.createElement('div');
            {
                tb.style.display = 'block';
                tb.style.position = 'absolute';
                tb.style.backgroundColor = '#F2F2F2';
                tb.style.cursor = 'pointer';
                tb.style.height = TOOLBAR_SIZE;
                for (var i = 0; i < TOOLBAR_BUTTONS.length; i += 1) {
                    tb.appendChild(createToolbarButton(TOOLBAR_BUTTONS[i]));
                }
            }
            return tb;
        }

        /**
         * Creates and return the DOMElement for a toolbar button.
         * @param button Button-JSON-object
         * @returns {Element} Toolbar button
         */
        function createToolbarButton(button) {
            var btn = document.createElement('button');
            if (button.name !== 'seperator') {
                if (button.id) {
                    btn.setAttribute('id', button.id);
                }
                btn.style.height = TOOLBAR_SIZE.toPixel();
                btn.style.width = TOOLBAR_SIZE.toPixel();
                btn.style.float = button.float;
                btn.style.border = 'none';
                btn.style.backgroundColor = 'transparent';
                btn.style.cursor = 'pointer';
                btn.className = 'icon ce-icon icon-' + button.faClass;
                btn.addEventListener('click', function() {
                    toolbarButtonListener(button.action);
                });
            } else {
                btn.style.width = '10px';
                btn.style.float = 'left';
                btn.style.border = 'none';
                btn.style.backgroundColor = 'transparent';
            }
            return btn;
        }

        /**
         * Sets the position of the toolbar to fit the element.
         *
         * @param el Element to attach toolbar to
         */
        function setToolbarPosition(el) {
            $toolbar.style.top = util.getElementTop(el);
            $toolbar.style.left = util.getElementLeft(el);
            $toolbar.style.width = util.getElementWidth(el);
        }

        return {
            createToolbar: createToolbar,
            setToolbarPosition: setToolbarPosition,
            createDomElement: createDomElement,
            TOOLBAR_SIZE: TOOLBAR_SIZE
        };

    })();

    /**
     * Public functions
     */
    return {
        init: init,
        util: util,
        dom: dom,
        attachToolbar: attachToolbar,
        detachToolbar: detachToolbar
    };

})(window, document);
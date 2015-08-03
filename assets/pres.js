document.addEventListener("DOMContentLoaded", function( event ) {

    var codeArrowContainer = $("#code-arrow"),
        codeArrow = codeArrowContainer.find("span");

    function showArrow() {
        codeArrow.css("opacity", 0);
        codeArrow.css("visibility", "visible");
        codeArrow.animate({"opacity":1},2000);
    }

    function hideArrow() {
        codeArrow.css("visibility", "hidden");
    }

    //Code arrow
    codeArrow.draggable({
          axis: "y"
    });

    //This is terrible idea usually, but for our purposes, setup our own logging
    window.console.log = function( val ) {
        setResultsWindow(JSON.stringify(val));
    };

    var mobilecheck = function() {
        var check = false;
        return check;
    };

    var currentInputEditor,
        currentOutputEditor,
        currentResultsWindow,
        native;

    // Full list of configuration options available at:
    // https://github.com/hakimel/reveal.js#configuration
    Reveal.initialize({
        controls: true,
        progress: true,
        history: true,
        center: true,

        transition: 'slide', // none/fade/slide/convex/concave/zoom

        // Optional reveal.js plugins
        dependencies: [
            {
                src: 'plugin/markdown/marked.js', condition: function() {
                    return !!document.querySelector('[data-markdown]');
                }
            },
            {
                src: 'plugin/markdown/markdown.js', condition: function() {
                    return !!document.querySelector('[data-markdown]');
                }
            },
            {
                src: 'plugin/highlight/highlight.js', condition: function() {
                    return !!document.querySelector('pre code');
                },
                callback: function() {
                    window.hljs = hljs;
                    hljs.configure({
                        languages: ["javascript"]
                    });
                    hljs.initHighlightingOnLoad();
                }
            }
        ]
    });

    /**
     * Transform ES6 text to ES5.1 using 6to5
     */
    function transformText( input, opts ) {
        var parsed = "";
        try {
            parsed = to5.transform(input, opts).code;

        }
        catch ( err ) {
            console.error(err);
            console.error("didn't set output because it errored");
        }

        return parsed;
    }

    /**
     * get the input value of the current editor
     * @returns {*}
     */
    function getCurrentInputValue() {
        if ( currentInputEditor ) {
            //get the ES5 transformed value
            return native
                ? currentInputEditor.getValue()
                : transformText(currentInputEditor.getValue());
        }

    }

    /**
     * Given a string of code, evaluate as JSON and return
     * @param code
     * @returns {*}
     */
    function evalFunctionReturnJson( code ) {
        try {
            //eval the result
            eval(code);
        } catch ( e ) {
            console.error(e);
        }
    }

    /**
     * Set the output of the result window
     * @param text
     */
    function setResultsWindow( text ) {
        if (!text)
            return;
        
        if ( currentResultsWindow ) {
            var row = currentResultsWindow.session.doc.getLength();
            var len = text.length;
            currentResultsWindow.session.doc.insert({row: row, column: 0}, text);
            currentResultsWindow.session.doc.insert({row: row, column: len}, '\n');
        }
    }

    /**
     * Setup any editors on the current slide
     * @param slideElement
     */
    function setupEditors( slideElement ) {

        if ( !slideElement )
            return;

        //get the input editor
        var foundInput = slideElement.querySelectorAll(".editor-input")[0];

        //get the result editor
        var foundResult = slideElement.querySelectorAll(".editor-result-output")[0];

        var input, output, result, inputCode;

        //attach the ace editor
        if ( foundInput ) {
            isEditorSlide = true;
            showArrow();
            native = foundInput.className.indexOf("native") > -1;

            showArrow();
            input = ace.edit(foundInput);

            currentInputEditor = input;
            input.setTheme("ace/theme/monokai");
            input.getSession().setMode("ace/mode/javascript");
            input.getSession().setUseWrapMode(false);
            input.setShowPrintMargin(false);
            input.setDisplayIndentGuides(false);
            input.renderer.setShowGutter(false);
            input.setHighlightActiveLine(false);
            input.$blockScrolling = Infinity;

            input.container.style.height = "500px";
            input.resize();
            
        } else {
            hideArrow();
            isEditorSlide = false;
        }


        //attach the ace editor
        if ( foundResult ) {
            result = ace.edit(foundResult);
            currentResultsWindow = result;
            result.setTheme("ace/theme/monokai");
            result.getSession().setUseWrapMode(true);
            result.setShowPrintMargin(false);
            result.setReadOnly(true);
            result.setDisplayIndentGuides(false);
            result.renderer.setShowGutter(false);
            result.setHighlightActiveLine(false);
            result.$blockScrolling = Infinity;

            result.container.style.height = "200px";
            result.resize();
        }

        //listen for changes and parse
        if ( input ) {
            input.on("change", function() {

                //set the new value
                var newVal = getCurrentInputValue();

                if ( newVal ) {

                    //if there is an output window, set the value
                    if ( output ) {
                        output.setValue(newVal, 0);
                    }

                }
            });

        }

    }

    //setup ace on change
    Reveal.addEventListener('slidechanged', function( event ) {

        setupEditors(event.currentSlide);
    });

    Reveal.addEventListener('ready', function( event ) {

        //insert our play button
        var controls = $('.controls');
        controls.append('<span style="cursor:pointer;top: 45px;left: 48px;font-size: 18px; position:absolute;" class="play">&#9654;</span>');
        hideArrow();
        setupEditors(event.currentSlide)


        $(".play").on("click", function() {
            var newVal = getCurrentInputValue();

            if ( newVal ) {
                var results = evalFunctionReturnJson(newVal);
                setResultsWindow(results);
            }
        });
    });
});

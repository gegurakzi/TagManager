const ReactTagManager = {

    init(id) {
        console.log("loaded tagmanager/index.js successfully");

        //Preparing snippet script
        let head = document.getElementsByTagName('head')[0];
        let snippet = document.createElement('script');
        snippet.type= 'text/javascript';
        snippet.async = true;
        snippet.src = 'http://localhost:8080/'+id+'/snippet.js';
        snippet.onload = function (){
            if(typeof snippetInit == "function") {
                // eslint-disable-next-line no-undef
                snippetInit();
                // eslint-disable-next-line no-undef
                snippetStart();
            }
        };
        head.appendChild(snippet);
        return window.dataTray;
    },

    attach() {
        if(typeof snippetStart == "function") {
            // eslint-disable-next-line no-undef
            snippetStart();
        }
    },

    detach() {
        if(typeof snippetStop == "function") {
            // eslint-disable-next-line no-undef
            snippetStop();
        }
    }

}
export { ReactTagManager };

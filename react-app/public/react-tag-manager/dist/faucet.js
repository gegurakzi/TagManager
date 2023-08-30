export default class Faucet {

    constructor(config) {
        ///
        this.DRAINAGE_SERVER = config.drainage;
        this.STATUS_DRAINING = false;

        ///
        // const handles = config.handles;
        // for(let i=0; i<handles.length; i++) {
        //     window.addEventListener(handles[i], function(e) {
        //         window.tank.push(e);
        //     });
        // }
    }

    fill(event, type) {
        window.tagmamager.silo.push(event);
        console.log(event)
    }

    drain() {
        console.log("DRAIN")
        if(this.STATUS_DRAINING) return;
        this.STATUS_DRAINING = true;
        const end = window.tagmamager.silo.length;
        // fetch(this.DRAINAGE_SERVER,
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(window.tank.slice(0, end))
        //     });
        window.tagmamager.silo = window.tagmamager.silo.slice(end);
        this.STATUS_DRAINING = false;
    }

}
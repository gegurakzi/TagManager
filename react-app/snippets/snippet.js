const TagManager = {
    initialize() {
        window.tagmanager = {};
        ////////////////////////////////////////////
        window.tagmanager.config = {
            handles: {
                click_random: {
                    "name": "click_random",
                    "base": "click",
                    "datas": ["random", "userId"]
                },
                login: {
                    "name": "login",
                    "base": "click",
                    "params": [],
                    "paths": [
                        {"pathName": "userId", "pathIndex": 2}
                    ],
                    "datas": ["random"]
                }, // param: 쿼리스트링으로 전달되는 데이터, path: path로 전달되는 데이터의 인덱스
                purchase: {
                    "name": "purchase",
                    "base": "click",
                    "params": [
                        {"pathName": "productName", "pathIndex": "product"}
                    ],
                    "paths": [
                        {"pathName": "productId", "pathIndex": 3}
                    ],
                    "datas": ["random"]
                }
            },
            tags: [
                {
                    "name": "button1",
                    "id": "button",
                    "class": "",
                    "events": ["click", "login"]
                },
                {
                    "name": "button2",
                    "id": "button2",
                    "class": "primary",
                    "events": ["purchase"]
                },
                {
                    "name": "random_num",
                    "events": ["click_random"]
                },
                {
                    "name": "App-link",
                    "id": "",
                    "class": "App-link",
                    "events": ["mouseenter"]
                },
            ]
        };
        ////////////////////////////////////////////
        window.tagmanager.config.handles["load"] = { "name": "load" };
        window.tagmanager.config.handles["beforeunload"] = { "name": "beforeunload" };
        window.tagmanager.config.handles["click"] = { "name": "click" };
        window.tagmanager.config.handles["mouseenter"] = { "name": "mouseenter" };
        window.tagmanager.config.handles["mousemove"] = { "name": "mousemove" };
        window.tagmanager.config.handles["scroll"] = { "name": "scroll" };
        //...
        //register default TagManager events
        window.tagmanager.config.handles["pageenter"] = { "name": "pageenter"};
        //...
        //register default window tags
        window.tagmanager.config.tags.push({
            "name": "root",
            "events": ["pageenter"]
        });

        this.openedListeners = [];
    },

    start() {
        window.dataTray.document = window.dataTray.document || {};
        window.dataTray.document.title = document.title;
        window.dataTray.document.location = document.location.href;
        window.dataTray.document.referrer = window.dataTray.document.prevLocation || document.referrer;

        const tags = window.tagmanager.config.tags;
        const handles = window.tagmanager.config.handles;

        window.tagmanager.logs = [];
        console.log(window.dataTray.document);

        // /// 로그 전송용 핸들러 생성
        let eventDumpHandler = {};
        let handlesKeys = Object.keys(handles);
        for (let i=0; i<handlesKeys.length; i++) {
            eventDumpHandler[handlesKeys[i]] = function (e) {
                this.fill(e, e.type);
            }.bind(this)
        }
        eventDumpHandler['pageenter'] = function (e) {
            this.fill(e, 'pageenter');
            this.dump();
        }.bind(this);
        /////

        ///// 이벤트 붙이기
        let keys = Object.keys(tags);
        for (let i=0; i<keys.length; i++) { // 모든 태그 중
            let tagsFiltered = [];
            if (tags[keys[i]].id) { // ID로 태그 찾기
                tagsFiltered = [document.querySelector('#' + tags[keys[i]].id)];
            } else if (tags[keys[i]].class) { // ID가 없으면 class로 태그 찾기
                let classes = tags[keys[i]].class.split(" ");
                tagsFiltered = [...document.querySelectorAll('*')];
                for (let c = 0; c < classes.length; c++) {
                    tagsFiltered = tagsFiltered.filter(tag => tag.classList.contains(classes[c]))
                }
            } else {
                // id, class 없으면
                tagsFiltered = [ window.document ]; // document에 붙이기
            }
            if(!tagsFiltered[0]) continue; // Element 없으면 다음으로 진행
            tagsFiltered.forEach(function (tag) {
                for (let e = 0; e < tags[keys[i]]['events'].length; e++) {
                    let eventName = tags[keys[i]]['events'][e];
                    if (handles[eventName].base) { // 사용자 커스텀 이벤트라면
                        let dispatcher = function () { // base DOM 이벤트에 dispatcher 붙이기
                            tag.dispatchEvent(this.eventBuilder(eventName, tags[keys[i]].name));
                        }.bind(this)
                        tag.addEventListener(handles[eventName].base, dispatcher);
                        this.openedListeners.push({
                                target: tag,
                                type: handles[eventName].base,
                                listener: dispatcher
                            }
                        ) // detach를 위해 붙인 이벤트 모으기
                    }
                    tag.addEventListener(eventName, eventDumpHandler[eventName]); // 해당 eventHandler 붙이기
                    this.openedListeners.push({
                        target: tag,
                        type: eventName,
                        listener: eventDumpHandler[eventName]
                    }) // detach를 위해 붙인 이벤트 모으기
                }
            }.bind(this));
        }
        // pageenter 이벤트 발생시키기
        //this.faucetHandlers['pageenter']({target: window});
        window.document.dispatchEvent(this.eventBuilder("pageenter", "root"));
        window.document.addEventListener("beforeunload", () => {
            this.stop();
        })
        /////

    },

    stop() {
        window.dataTray.document.prevLocation = window.dataTray.document.location;
        for(let i=0; i<this.openedListeners.length; i++) {
            this.openedListeners[i].target.removeEventListener(this.openedListeners[i].type, this.openedListeners[i].listener);
        }
        this.openedListeners = [];
    },

    eventBuilder(eventName, targetName) {
        //////////
        const handles = window.tagmanager.config.handles;
        const url = new URL(document.location);
        const urlParams = url.searchParams;
        const pathArray = document.location.pathname.split('/');
        let detail = {};
        /////////
        detail['targetName'] = targetName;
        if(handles[eventName].params) {
            for (let p = 0; p < handles[eventName].params.length; p++) {
                let param = handles[eventName].params[p];
                detail[param.name] = urlParams.get(param.key);
            }
        }
        if(handles[eventName].paths) {
            for (let p = 0; p < handles[eventName].paths.length; p++) {
                let path = handles[eventName].paths[p]
                detail[path.name] = pathArray[path.index];
            }
        }
        if(handles[eventName].datas) {
            for (let d = 0; d < handles[eventName].datas.length; d++) {
                let data = handles[eventName].datas[d]
                detail[data] = window.dataTray[data] || null;
            }
        }
        return new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
    },

    fill(event, type) {
        window.tagmanager.logs.push(event);
        console.log(event)
    },

    dump() {
        const end = window.tagmanager.logs.length;
        fetch("http://localhost:8080/dump", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(window.tagmanager.logs.slice(0, end))
        });
        window.tagmanager.logs = window.tagmanager.logs.slice(end);
    }
}

function snippetInit() {
    console.log("snippet init");
    TagManager.initialize();
}

function snippetStart() {
    console.log("snippet start");
    TagManager.start();
}

function snippetStop() {
    console.log("snippet stop");
    TagManager.stop();
}
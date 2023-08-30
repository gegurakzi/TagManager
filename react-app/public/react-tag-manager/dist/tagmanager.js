import Faucet from "./faucet";
import React, {useEffect} from "react";

export default class TagManager {

    static initialiize(config) {
        let instance = new TagManager(config);
        instance.DUMMY_CONFIG(config.clientId).then((res) => {
            instance.config = res;

            instance.faucet = new Faucet(instance.config);

            //register default DOM events
            instance.config.handles["load"] = { "name": "load" };
            instance.config.handles["beforeunload"] = { "name": "beforeunload" };
            instance.config.handles["click"] = { "name": "click" };
            instance.config.handles["mouseenter"] = { "name": "mouseenter" };
            instance.config.handles["mousemove"] = { "name": "mousemove" };
            instance.config.handles["scroll"] = { "name": "scroll" };
            //...
            //register default TagManager events
            instance.config.handles["pageenter"] = { "name": "pageenter"};
            instance.config.handles["pageleave"] = { "name": "pageleave"};
            //...
            //register default window tags
            instance.config.tags.push({
                "name": "root",
                "events": ["pageenter", "pageleave"]
            });

            instance.INITIALIZED = true;
            console.log(instance);

            instance.start();
        });

        return instance;
    }

    constructor(config) {
        window.tagmamager = {};
        window.tagmamager.silo = window.tagmamager.silo || [];
        window.tagmamager.datas = window.tagmamager.datas || {};
        this.config = config;
        this.openedListeners = [];

        this.config.handles = {};
        this.config.tags = [];

        this.INITIALIZED = false;
        this.STARTED = false;
    }

    start() {
        if(!this.INITIALIZED){
            console.log("tagmanager has not yet initialized");
            return;
        }

        this.title = document.title;
        this.location = document.location.href;
        this.referrer = this.prevLocation ? this.prevLocation : document.referrer;

        const tags = this.config.tags;
        const handles = this.config.handles;

        // /// 로그 전송용 핸들러 생성
        this.faucetHandlers = {};
        let handlesKeys = Object.keys(handles);
        for (let i=0; i<handlesKeys.length; i++) {
            this.faucetHandlers[handlesKeys[i]] = function (e) {
                this.faucet.fill(e, e.type);
            }.bind(this)
        }
        this.faucetHandlers['pageenter'] = function (e) {
            this.faucet.fill(e, 'pageenter');
            this.faucet.drain();
        }.bind(this);
        this.faucetHandlers['pageleave'] = function (e) {
            this.faucet.fill(e, 'pageleave');
            this.faucet.drain();
        }.bind(this);
        /////

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
                    tag.addEventListener(eventName, this.faucetHandlers[eventName]); // 해당 eventHandler 붙이기
                    this.openedListeners.push({
                        target: tag,
                        type: eventName,
                        listener: this.faucetHandlers[eventName]
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
        this.STARTED = true;
        console.log("TM started");
    }

    stop() {
        if(!this.STARTED){
            console.log("tagmanager has not yet started");
            return;
        }
        console.log(this.openedListeners);
        this.prevLocation = this.location;
        for(let i=0; i<this.openedListeners.length; i++) {
            this.openedListeners[i].target.removeEventListener(this.openedListeners[i].type, this.openedListeners[i].listener);
        }
        this.openedListeners = [];
        window.dispatchEvent(this.eventBuilder("pageleave"), "root");
        this.STARTED = false;
    }


    async DUMMY_CONFIG(clientId) {
        let resolve = ()=>{};
        const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay))
        let resp = await wait(1000);
        console.log("CONFIG RETURNED")
        return {
            clientId: clientId,
            drainage: "https://my-server.com",
            handles: {
                click_random: {
                    "name": "click_random",
                    "base": "click",
                    "datas": ["random"]
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
    }

    eventBuilder(eventName, targetName) {
        //////////
        const handles = this.config.handles;
        console.log(this.openedListeners)
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
                detail[data] = window.tagmamager.datas[data] || null;
            }
        }
        return new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
    }

}
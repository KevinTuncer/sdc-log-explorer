import {createStore} from 'vuex'
import {Api} from 'eosjs'
import {key, type} from 'openpgp';
import * as jdenticon from "jdenticon";
import { DataLog as rawDataLog, JsonFormatLog } from '../interfaces/connectionInterfaces';

interface Display{
    selected: boolean,           // State of beeing selected  
    show: boolean                // State of beeing visible
}

export interface ObjectData extends JsonFormatLog{
    // Added properties for utilisation
    objectPayload?: object,        // Stores the Payload as object
    display?: Display
}
export interface UndefinedData{
    undefinedData?: string, 
    display?: Display
}

export interface DataLog extends rawDataLog {
    objectDatas?: Array<ObjectData> | Array<UndefinedData>,      // Stores the Data as decrypted object
}

export interface ConnectionData {
    contract: string,
    scope: string,
    user: string,
    endPoint: string,
    api: Api
};

// Store for identicons
class Identicon{
    private size: number = 50;
    private config: jdenticon.JdenticonConfig = {backColor: "#fff", padding: 0}; //"#dcdcdc"
    private idcon = {};

    constructor(size: number){
        this.size = size;
    }

    public get(text: string){
        if(typeof text === 'undefined'  || text == null || text.length == 0)
            return null;

        let idcon = this.idcon[text];
        if(typeof idcon == "undefined"){
            idcon = jdenticon.toSvg(text, this.size, this.config);
            this.idcon[text] = idcon;      
        }
        return idcon;
    }

    public remove(text: string){
        if(typeof this.idcon[text] != "undefined"){
            delete this.idcon[text];
        }
    }

    public getKeys(){
        return Object.keys(this.idcon)
    }

    public getConfig(){
        return this.config;
    }
}

export interface FilterList{
    WorkStation: FilterObject,
    UnknownXML: FilterObject,
    Action: FilterObject,
    TimeSpanFrom: FilterObject,
    TimeSpanTo: FilterObject,
    Ip: FilterObject,
    Identification: FilterObject
}

export interface FilterObject{
    name: string,                                           // Name of this object to show
    active: boolean,                                        // Show this item
    without?: boolean,                                      // Switch value to not show its items or show only its items
    item?: Array<FilterObjectItem> | FilterObjectItem,      // An item or a list of items which belong to this object
    changing: boolean                                       // Is true while chainging 
}

export interface FilterObjectItem{
    name: string, 
    value: any
}

class Filter{

    private list: FilterList = {
        TimeSpanFrom: {name: '🕑 From', active: false, item: {name: '', value:{}}, changing: false},
        TimeSpanTo: {name: '🕑 To', active: false, item: {name: '', value:{}}, changing: false},
        Action: {name: 'Actions', active: false, without: false, item:[], changing: false},
        Ip: {name: 'IPs', active: false, without: true, item:[], changing: false},
        Identification: {name: 'Identifications', active: false, without: true, item:[], changing: false},
        WorkStation: {name: 'Workstation', active: false, without: true, changing: false},
        UnknownXML: {name: 'UnknownXML', active: false, without: true, changing: false},
    };

    /**
     * Add an item to the corresponding filter object
     * @param name select the filter object
     * @param item defines the item which should be added
     */
    public async add(name: string, item?: FilterObjectItem) {
        let obj = this.list[name]; 
        if(typeof obj === 'undefined'){
            return;
        }
        // Show this filter
        obj.active = true;
        
        if(typeof item === 'undefined'){
            return;
        }

        // Add the item to this filter
        switch(name){
            // Item is an array
            case 'Action':
            case 'Identification':
            case 'Ip':
                // Check if the filter item is already setted
                for(let it of this.list[name].item as Array<FilterObjectItem>){
                    if(it.value == item.value){
                        return;
                    }
                }
                // Add the filter item if it is not already defined
                (this.list[name].item as Array<FilterObjectItem>).push(item);   
                return;
            // Item is one object
            case 'TimeSpanFrom':
            case 'TimeSpanTo':
                // Set the filter item 
                if(item.name){
                    (this.list[name].item as FilterObjectItem) = item;
                } else {
                    obj.active = false;
                    return;
                }
            // Contains no item
            case 'WorkStation': 
            case 'UnknownXML': 
            default: 
            return;
        }
    }

    /**
     * Removes an filter object or one of its items
     * @param objKey is the key of the filter object
     * @param itemIndex is the index to one element in filter objects item if it is an array
     */
    public async remove(objKey: any, itemIndex?:number){
        let obj = this.list[objKey];
        if(typeof itemIndex !== 'undefined'){
            obj.item.splice(itemIndex, 1);
            if(obj.item.length <= 0){
                obj.active = false;    
            }
        } else {
            // Remove the items if item is an array
            if(typeof obj.item !== 'undefined' && typeof obj.item.name == 'undefined'){
                obj.item.splice(0);
            }
            obj.active = false;
        }
    }
   
    /**
     * Get the list of all filter objects
     * @returns the list of all filter objects
     */
    public getList() : FilterList {
        return this.list;
    }

    private actionSuggestions = {};
    private ipSuggestions = {};
    private timeSpanRange: {from: number, to: number} = {from:undefined, to:undefined};

    // Add a sdc action suggestion if it is not already
    public addActionSuggestion(suggestion: string){
        if(typeof this.actionSuggestions[suggestion] == 'undefined'){
            this.actionSuggestions[suggestion] = true;
        }
    }

    // Get all sdc actions suggestion which where ever recognized 
    public getActionSuggestions(){
        return Object.keys(this.actionSuggestions);
    }

    // Add an ip suggestion if it is not already
    public addIpSuggestion(suggestion: string){
        if(typeof this.ipSuggestions[suggestion] == 'undefined'){
            this.ipSuggestions[suggestion] = true;
        }
    }

    // Get all ip suggestion which where ever recognized 
    public getIpSuggestions(){
        return Object.keys(this.ipSuggestions);
    }

    // Check the time range and expand it if there is a time outside 
    public setCheckTimeRange(time: number){
        if(typeof time === 'string'){
            time = parseInt(time);
        }
        if(this.timeSpanRange.from){
            if(this.timeSpanRange.from > time){
                this.timeSpanRange.from = time;
            }
        } else {
            this.timeSpanRange.from = time;
        }
        if(this.timeSpanRange.to){
            if(this.timeSpanRange.to < time){
                this.timeSpanRange.to = time;
            }
        } else {
            this.timeSpanRange.to = time;
        }
    }

    // Get the time range of the logs
    public getTimeRange(){
        return this.timeSpanRange;
    }
}

export interface State {
    dataConnection: ConnectionData,
    // hashConnection: ConnectionData,
    privateKey: key.Key,
    dataLogs: Array<DataLog>,
    indenticon: Identicon,
    filter: Filter,
    isPrintView: boolean,
    showSelected: boolean,
    getlogProcess: number,
}

const state: State = {
    dataConnection: {contract:null, scope:null, user: null, endPoint:null, api:null},
    // hashConnection: {contract:null, scope:null, user: null, endPoint:null, api:null},
    privateKey: null,
    dataLogs: [],
    indenticon: new Identicon(50),
    filter: new Filter(),
    isPrintView: false,
    showSelected: false,
    getlogProcess: 0.0,
};


const mutations = {
    // Set all data which are necessary for a connection with the data net
    setDataConnectionSettings(state: State, data: ConnectionData){
        console.log("Update connection with data network.");
        state.dataConnection = data;
    },

    // // Set all data which are necessary for a connection with the hash net
    // setHashConnectionSettings(state: State, data: ConnectionData){
    //     console.log("Update connection with hash network.");
    //     state.hashConnection = data;
    // },

    // Store the openPGP private key which can be used for decryption 
    setPrivateKeySettings(state: State, privateKey: key.Key){
        console.log("Update private Key.");
        state.privateKey = privateKey;
    },

    // Add an older log
    addLog(state: State, log: DataLog) {
        console.log(`Add log with ref block number: ${log.refBlock}`);
        state.dataLogs.push(log);
    },

    // Add an older log
    addLogs(state: State, logs: Array<DataLog>) {
        console.log(`Add logs with ref block number: ${logs[0].refBlock} to ${logs[logs.length-1].refBlock}`);
        state.dataLogs.push(...logs);
    },

    // Add an array of new logs at the beginning. Frist create an array of all new logs for a better performance
    addNewLogs(state: State, logs: Array<DataLog>) {
        console.log(`Add new logs with ref block number: ${logs[0].refBlock} to ${logs[logs.length-1].refBlock}`);
        state.dataLogs.unshift(...logs);
    },

    // Reset the state
    reset(state: State, resetKey = false) {
        state.dataConnection = {contract:null, scope:null, user: null, endPoint:null, api:null};
        if(resetKey){
            state.privateKey = null;
        }
        state.dataLogs = [];
        state.indenticon = new Identicon(50);
        state.filter = new Filter();
        state.isPrintView = false;
        state.showSelected = false;
        state.getlogProcess = 0.0;
    }
};

export const store = createStore({ state, mutations });

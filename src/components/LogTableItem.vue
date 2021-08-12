<template>
    <template v-if="dataLog.objectDatas && dataLog.objectDatas[0] && typeof dataLog.objectDatas[0].undefinedData == 'string'">
        <tr class="logTableItem">
            <td colspan="4"><div style="float:right; color:red; margin:5px"><i>Undefined data</i></div></td>
        </tr>
    </template>
    <template v-else-if="isShowSelected">
        <template v-if="obj.payload">
            <template v-if="obj.type == 'SDC'">
                <template v-if="wsa.Action && (!fl.UnknownXML.active || (fl.UnknownXML.active && fl.UnknownXML.without))">
                    <template v-if="(!fl.WorkStation.active || (fl.WorkStation.active && fl.WorkStation.without)) && isShowAction && isShowIdentification && isShowIP && isShowTime">
                        <tr class="logTableItem">
                            <td><input v-show="!state.isPrintView" type="checkbox" v-model="obj.display.selected"/></td>
                            <td class="date nowrap">{{timeToDate(obj.timestamp)}}</td>
                            <td>
                                <table>
                                    <tr><td>
                                        <button class="nowrap button" @click="showPayload(obj)">SDC {{wsa.Action}}</button>
                                    </td></tr>
                                    <tr v-if="obj.ip"><td v-if="obj.ip.length > 1">
                                        <span>{{obj.ip[0]}}</span>&#10140;<span>{{obj.ip[1]}}</span>
                                    </td></tr>
                                </table>
                            </td>
                            <td class="content">
                                <table>
                                    <tr>
                                        <td v-if="wsa.From"><Property v-model="wsa.From" title="From"></Property></td>
                                        <td v-if="wsa.To"><Property v-model="wsa.To" title="To"></Property></td>
                                        <td v-if="wsa.MessageID"><Property v-model="wsa.MessageID" title="MessageID"/></td>
                                        <td v-if="wsa.ReplyTo"><Property v-model="wsa.ReplyTo" title="ReplyTo"/></td>
                                        <td v-if="wsa.RelatesTo"><Property v-model="wsa.RelatesTo" title="RelatesTo"/></td>
                                        <td v-if="wsa.FaultTo"><Property v-model="wsa.FaultTo" title="FaultTo"/></td>
                                        
                                        <td v-if="wse.Identifier"><Property v-model="wse.Identifier" title="Identifier"/></td>
                                        <td v-if="wsa.Address"><Property v-model="wsa.Address" title="Address"/></td>
                                        <td class="textProps">
                                            <table class="nowrap">
                                                <tr v-if="wse.Expires"><td>Expires:</td><td class="expiresStyle">{{wse.Expires}}</td></tr>
                                                <tr v-if="p2.Expires"><td>Expires:</td><td class="expiresStyle">{{p2.Expires}}</td></tr>

                                                <tr v-if="wsd.Types"><td>Types:</td><td class="contentNameStyle">{{wsd.Types}}</td></tr>
                                                <tr v-if="p2.Types"><td>Types:</td><td class="contentNameStyle">{{p2.Types}}</td></tr>
                                                
                                                <tr v-if="mm.TransactionId"><td>Id:</td><td class="trxIdStyle">{{mm.TransactionId}}</td></tr>
                                                <tr v-if="mm.InvocationState"><td>State:</td><td class="valueColor">{{mm.InvocationState}}</td></tr>
                                                <tr v-if="ns4.TransactionId"><td>Id:</td><td class="trxIdStyle">{{ns4.TransactionId}}</td></tr>
                                                <tr v-if="ns4.InvocationState"><td>State:</td><td class="valueColor">{{ns4.InvocationState}}</td></tr>
                                                <tr v-if="ns4.HandleRef"><td>Ref:</td><td class="contentNameStyle">{{ns4.HandleRef}}</td></tr>
                                                <tr v-if="ns4.OperationHandleRef"><td>Ref:</td><td class="contentNameStyle">{{ns4.OperationHandleRef}}</td></tr>
                                                <tr v-if="ns4.RequestedStringValue"><td>Value (string):</td><td class="valueColor">{{ns4.RequestedStringValue}}</td></tr>
                                                <tr v-if="ns4.RequestedNumericValue"><td>Value (numeric):</td><td class="valueColor">{{ns4.RequestedNumericValue}}</td></tr>

                                                <tr v-if="mm.attrDescriptorHandle"><td>Descriptor (metric):</td><td class="contentNameStyle">{{mm.attrDescriptorHandle}}</td></tr>
                                                <tr v-if="p2.attrDescriptorHandle"><td>Descriptor (metric):</td><td class="contentNameStyle">{{p2.attrDescriptorHandle}}</td></tr>
                                                <tr v-if="p2.attrMetricValue"><td>Value (metric):</td><td class="valueColor">{{p2.attrMetricValue}}</td></tr>
                                                <tr v-if="ns3.attrMetricValue"><td>Value (metric):</td><td class="valueColor">{{ns3.attrMetricValue}}</td></tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                            <td class="refBlock">
                                <span>Ref: {{dataLog.refBlock}}</span><br/>
                                <button class="button" @click="showDataObject(dataLog)">Data</button>
                            </td>
                        </tr>
                    </template>
                </template>
                <template v-else-if="!(wsa.Action) && (!fl.UnknownXML.active || (fl.UnknownXML.active && !fl.UnknownXML.without))">
                    <tr class="logTableItem">
                            <td><input v-show="!state.isPrintView" type="checkbox" v-model="obj.display.selected"/></td>
                            <td class="date nowrap">{{timeToDate(obj.timestamp)}}</td>
                            <td>
                                <table>
                                    <tr><td>
                                        <button class="nowrap button" @click="showPayload(obj)">XML</button>
                                    </td></tr>
                                    <tr v-if="obj.ip"><td v-if="obj.ip.length > 1">
                                        <span>{{obj.ip[0]}}</span>&#10140;<span>{{obj.ip[1]}}</span>
                                    </td></tr>
                                </table>
                            </td>
                            <td class="content">
                            </td>
                            <td class="refBlock">
                                <span>Ref: {{dataLog.refBlock}}</span><br/>
                                <button class="button" @click="showDataObject(dataLog)">Data</button>
                            </td>
                        </tr>
                </template>
            </template>
            <template v-else-if="obj.type == 'WS'">
                <template v-if="!fl.WorkStation.active || (fl.WorkStation.active && !fl.WorkStation.without)">
                    <tr class="logTableItem">
                        <td><input v-show="!state.isPrintView" type="checkbox" v-model="obj.display.selected"/></td>
                        <td class="date nowrap">{{timeToDate(obj.timestamp)}}</td>
                        <td>
                            <button class="button" @click="showPayload(obj)">
                                <span v-if="obj.objectPayload.source">{{obj.objectPayload.source}}</span>
                                <span v-else class="nowrap">Workstation</span>
                                <div class="wsIpStyle"><span :style="getIpColor(obj)">{{ipToString(obj)}}</span>:{{obj.port}}</div>
                            </button>
                        </td>
                        <td>
                            <table>
                                <tr v-if="obj.objectPayload.opened_panel">
                                    <td>Click on:</td>
                                    <td class="openPanelStyle">{{obj.objectPayload.opened_panel}}</td>
                                </tr>
                                <tr>
                                    <td v-if="obj.objectPayload.timestamp">Timestamp:</td>
                                    <td class="panalTimeStyle">{{timeToDate(obj.objectPayload.timestamp)}}</td>
                                </tr>
                                <tr v-if="obj.objectPayload.metric">
                                    <td>Metric:</td>
                                    <td class="metricNameStyle">{{obj.objectPayload.metric}}</td>
                                </tr>
                                <tr v-if="obj.objectPayload.x | obj.objectPayload.y">                        
                                    <td>Position: </td>
                                    <td>
                                        <span v-if="obj.objectPayload.x" class="nowrap"> x = <span class="valueColor">{{obj.objectPayload.x}}</span> </span>
                                        <span v-if="obj.objectPayload.y" class="nowrap"> y = <span class="valueColor">{{obj.objectPayload.y}}</span></span>
                                    </td>
                                </tr>
                                <tr v-if="obj.objectPayload.value">
                                    <td>Value: </td>
                                    <td class="valueColor">{{obj.objectPayload.value}}</td>
                                </tr>
                            </table>
                        </td>
                        <td class="refBlock">
                            <span>Ref: {{dataLog.refBlock}}</span><br/>
                            <button class="button" @click="showDataObject(dataLog)">Data</button>
                        </td>
                    </tr>
                </template>
            </template>
            <template v-else>
                <tr class="logTableItem">
                    <td><input v-show="!state.isPrintView" type="checkbox" v-model="obj.display.selected"/></td>
                    <td class="date nowrap">{{timeToDate(obj.timestamp)}}</td>
                    <td colspan="2"><button @click="showPayload(obj)">Show payload</button></td>
                    <td class="refBlock">
                        <span>Ref: {{dataLog.refBlock}}</span><br/>
                        <button class="button" @click="showDataObject(dataLog)">Data</button>
                    </td>
                </tr>
            </template>
        </template>
        <tr v-else class="logTableItem">
            <td><input v-show="!state.isPrintView" type="checkbox" v-model="obj.display.selected"/></td>
            <td class="date nowrap">{{timeToDate(obj.timestamp)}}</td>
            <td colspan="2"><button class="button" @click="showPayload(obj)">Show payload</button></td>
            <td class="refBlock">
                <span>Ref: {{dataLog.refBlock}}</span><br/>
                <button class="button" @click="showDataObject(dataLog)">Data</button>
            </td>
        </tr>
    </template>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from "vuex";

import { DataLog, ObjectData, FilterObjectItem, State } from '@/store';

import {SDC_wsa, SDC_wse, SDC_wsd} from '../interfaces/connectionInterfaces';

import Property from '../components/Property.vue';

export default defineComponent({
    name: "LogTableItem",
    props: {
        dataLog: {
            type: Object,
            require: true
        },
        dataItem: {
            type: Object,
            require: true
        },
    },
    components: {
        Property
    },
    setup(props, context) {
        const store = useStore();
        const state = store.state as State;
        const obj = props.dataItem as ObjectData;
        const objectPayload = obj.objectPayload as any;

        const fl = state.filter.getList();

        /**
         * Should show this entry in regards of its ip
         */
        const isShowIP = computed(()=>{
            if(fl.Ip.active === true){
                return !fl.Ip.without !== (fl.Ip.item as Array<FilterObjectItem>).every((e)=>{
                    switch(e.value){
                        case obj.ip:
                        case obj.ip[0]:
                        case obj.ip[1]:
                            return false;
                        default:
                            return true;
                    }
                });
            }
            return true;
        });

        /**
         * Should show this entry in regards of its action
         */
        const isShowAction = computed(()=>{
            if(fl.Action.active === true){
                return (fl.Action.item as Array<FilterObjectItem>).every(e=>e.value != wsa.Action) !== !fl.Action.without; // XOR
            }
            return true;
        });

        /**
         * Should show this entry in regards of its identification values
         */
        const isShowIdentification = computed(()=>{
            if(fl.Identification.active === true){
                return !fl.Identification.without !== (fl.Identification.item as Array<FilterObjectItem>).every(
                    (e)=>{
                        switch(e.value){
                            case wsa.From: 
                            case wsa.To: 
                            case wsa.MessageID: 
                            case wsa.RelatesTo:
                            case wsa.Address:
                            case wsa.FaultTo:
                            case wsa.ReplyTo:
                            case wse.Identifier:
                                return false;
                            default: 
                                return true;
                        }
                    });
            }
            return true;
        });

        /**
         * Should show this entry in regards of its timestamp
         */
        const isShowTime = computed(()=>{
            let from = true, to = true;
            if(fl.TimeSpanFrom.active === true){                
                from = obj.timestamp >= (fl.TimeSpanFrom.item as FilterObjectItem).value;
            }
            if(fl.TimeSpanTo.active === true){
                to = obj.timestamp <= (fl.TimeSpanTo.item as FilterObjectItem).value;
            }            
            return from && to;
        });

        const isShowSelected = computed(()=>{
            return !state.showSelected || (state.showSelected && obj.display.selected);
        })

        let wsa: SDC_wsa = {};
        let wse: SDC_wse = {};
        let wsd: SDC_wsd = {};

        let mm :{TransactionId?: string, InvocationState?: string, attrDescriptorHandle?: string} = {};
        let ns3 :{attrMetricValue?: string} = {};
        let ns4 :{HandleRef?: string, OperationHandleRef?: string, RequestedStringValue?: string, RequestedNumericValue?: string, TransactionId?: string, InvocationState?: string } = {};
        let p2 :{Identifier?: string, Expires?: string, Types?: string, attrMetricValue?: string, attrDescriptorHandle?: string} = {};

        // Expand the time range
        if(obj.timestamp){
            state.filter.setCheckTimeRange(obj.timestamp);
        }

        // Add ip suggestion for filter pannel
        switch(typeof obj.ip){
            case 'string':
                state.filter.addIpSuggestion(obj.ip);
            break;
            case 'object':
                if(typeof obj.ip[0] === 'string') {
                    state.filter.addIpSuggestion(obj.ip[0]);
                }
                if(typeof obj.ip[1] === 'string') {
                    state.filter.addIpSuggestion(obj.ip[1]);
                }
                break;
        }

        switch(obj.type){
            case 'SDC':
                if(objectPayload) {
                    // If there is an wsa:Action
                    let wsa_action_value = getElementValue(objectPayload, 'wsa:Action');
                    
                    if(wsa_action_value != null && wsa_action_value.length > 0){
            
                        // Get wsa:Action
                        let s = wsa_action_value.lastIndexOf('/') + 1;
                        if(s < wsa_action_value.length) {
                            wsa.Action = (wsa_action_value as String).substring(s);
                            state.filter.addActionSuggestion(wsa.Action);                     // Add action suggestion for filter pannel
                        }
                        
                        wsa.MessageID = getElementValue(objectPayload, 'wsa:MessageID');
                        wsa.To = getElementValue(objectPayload, 'wsa:To');
                        wsa.From = getElementValue(objectPayload, 'wsa:From');
                        wsa.ReplyTo = getElementValue(objectPayload, 'wsa:ReplyTo');
                        wsa.RelatesTo = getElementValue(objectPayload, 'wsa:RelatesTo');
                        wsa.FaultTo = getElementValue(objectPayload, 'wsa:FaultTo');

                        wse.Identifier = getElementValue(objectPayload, 'wse:Identifier');
                        wse.Expires = getElementValue(objectPayload, 'wse:Expires');
                        p2.Expires = getElementValue(objectPayload, 'p2:Expires');
                        wsd.Types = getElementValue(objectPayload, 'wsd:Types');
                        p2.Types = getElementValue(objectPayload, 'p2:Types');

                        wsa.Address = getElementValue(objectPayload, 'wsa:Address');

                        mm.TransactionId = getElementValue(objectPayload, 'mm:TransactionId');
                        mm.InvocationState = getElementValue(objectPayload, 'mm:InvocationState');
                        ns4.TransactionId = getElementValue(objectPayload, 'ns4:TransactionId');
                        ns4.InvocationState = getElementValue(objectPayload, 'ns4:InvocationState');
                        ns4.HandleRef = getElementValue(objectPayload, 'ns4:HandleRef');
                        ns4.OperationHandleRef = getElementValue(objectPayload, 'ns4:OperationHandleRef');
                        ns4.RequestedStringValue = getElementValue(objectPayload, 'ns4:RequestedStringValue');
                        ns4.RequestedNumericValue = getElementValue(objectPayload, 'ns4:RequestedNumericValue');

                        mm.attrDescriptorHandle = getElementAttribute(objectPayload, 'mm:MetricState', 'DescriptorHandle');
                        p2.attrMetricValue = getElementAttribute(objectPayload, 'p2:MetricValue', 'Value');
                        ns3.attrMetricValue = getElementAttribute(objectPayload, 'ns3:MetricValue', 'Value');
                        
                        p2.attrDescriptorHandle = getElementAttribute(objectPayload, 'p2:State', 'DescriptorHandle');
                        
                    } else {
                        console.log(`XML contains no wsa:Action`);
                    }
                }
                break;
                case 'WS':
                    break;
        }

        function getIpColor(obj: ObjectData) {
            if(typeof obj.ip == "string"){
                let s = (obj.ip as string).lastIndexOf('.');
                if(s > 0){
                    let value = parseInt((obj.ip as string).substring(s + 1));
                    return `color: rgb(${value}, 255, ${255-value})`;
                }
                return '';
            }
        }
        
        function ipToString(obj: ObjectData){
            if(obj.ip.length > 15){
                return `[${obj.ip}]`;
            } else {
                return obj.ip;
            }
        }

        function getElementValue(objectPayload: any, tagName: string){
            let element = objectPayload.getElementsByTagName(tagName)[0];
            if(typeof element == "undefined")
                return null;
            let elNode = element.childNodes[0];
            if(typeof elNode == "undefined")
                return null;
            return elNode.nodeValue;
        }

        function getElementAttribute(objectPayload: any, tagName: string, attri: string){
            let element = objectPayload.getElementsByTagName(tagName)[0];
            if(typeof element == "undefined")
                return null;
            if(element.hasAttribute(attri)){
                return element.getAttribute(attri);
            }
            return null;
        }

        // Show the payload in an alert box and in the log
        function showPayload(obj){
            if(obj.payload){
                console.log(typeof objectPayload, obj.objectPayload);
                alert(obj.payload);
            }
        }

        // Convert a unix time stamp to a readable date string
        function timeToDate(time:number){
            if(time){
                if(typeof time === 'string'){
                    time = parseInt(time);
                }
                return (new Date(time)).toISOString().replace('Z', '').replace('T', ' ').replaceAll('-', '.');
            }
        }

        // Show the decrypted data as an object in an alert box and in the log
        function showDataObject(dataLog: DataLog){
            if(dataLog.objectDatas){
                console.log(dataLog.objectDatas);
                alert(JSON.stringify(dataLog.objectDatas));
            } else {
                console.log(dataLog);
                alert(dataLog);
            }
        }

        return {
            timeToDate, showPayload, fl,
            obj, state, wsa, wse, wsd, mm, ns3, ns4, p2,
            getIpColor, ipToString, showDataObject,
            isShowAction, isShowIdentification, isShowIP, isShowTime, isShowSelected
        }
    }
});
</script>
<style scoped>

.logTableItem{
    /* display:flex; flex-direction: row; */
    font-size: 0.8em;
    text-align: left;
    background-color: #242329;
    
}

.date{
    padding: 5px;
}

.wsIpStyle{
    font-size: 0.7em;
}
.valueColor{
    color: rgb(139, 139, 255);
}

.openPanelStyle{
    color:rgb(168, 87, 87);
}

.panalTimeStyle{
    color: gray;
}

.metricNameStyle{
    color: rgb(168, 87, 87);
}

.contentNameStyle{
    color: rgb(165, 81, 42);
}

.content{
    width: 100%;
}

.content>table{
    width: 100%;
}

.textProps{
    width: 99%;
    /* text-align: right; */
}

.expiresStyle{
    color: darkcyan;
}

#trxIdStyle{
    color: blueviolet;
}

.cell{
    display: table-cell;
}

.table {
 display: table;
}
</style>

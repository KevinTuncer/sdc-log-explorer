
<template>
    <div class="filter card"> <!-- <div class="filter" :class="{active: isActive}"> -->
    <div class="head">
        <button @click="toggleOpen" class="showButton" >{{isOpen? 'Close Filter Settings &#128316;': 'Open Filter Settings &#128317;'}}</button>
        <table>
            <tr>
                <td v-for="(obj, objKey) in filterList" :key="objKey" v-show="obj.active" class="activeFilterTypes" :class="{activeNegativeFilterTypes: (typeof obj.without !== 'undefined' && obj.without)}">
                    <span>{{obj.name}}</span>
                </td>
            </tr>
        </table>
    </div>
    <div v-show="isOpen">
        <div class="cardoncard">
            <div class="title">Selection of Filters</div>
            <table>
                <tr>
                    <td>Workstation</td>
                    <td align=Right>
                        Only or without
                    </td>
                    <td>
                        <button class="button" @click="addWorkStationFilter()">Add</button>
                    </td>
                </tr>
                <tr>
                    <td>Unknown XML (SDC)</td>
                    <td align=Right>            
                        Only or without
                    </td>
                    <td>
                        <button class="button" @click="addUnknownXMLFilter()">Add</button>
                    </td>
                </tr>
                <tr>
                    <td>Action</td>
                    <td align=Right>            
                        <FilterInput v-model="actionFilterInput" :suggestions="actionList" size="20"/>
                    </td>
                    <td>
                        <button class="button" @click="addActionFilter()">Add</button>
                    </td>
                </tr>
                <tr>
                    <td>Identification <span v-show="identificationInput" v-html="getIdenticonFrom" /></td>
                    <td align=Right>
                        <FilterInput v-model="identificationInput" :suggestions="identiconList" size="35" />
                    </td>
                    <td>
                        <button class="button" @click="addIdentificationFilter()">Add</button>
                    </td>
                </tr>
                <tr>
                    <td>IP</td>
                    <td align=Right>
                        <FilterInput v-model="ipInput" :suggestions="ipList" size="20" />
                    </td>
                    <td>
                        <button class="button" @click="addIpFilter()">Add</button>
                    </td>
                </tr>
                <tr>
                    <td>&#128337; From</td>
                    <td align=Right>
                        <DateTimePicker v-model="fromTimeDate" />
                    </td>
                    <td><button class="button" @click="setTimeFromFilter()">Set</button></td>
                </tr>
                <tr>
                    <td>&#128337; To</td>
                    <td align=Right>
                        <DateTimePicker v-model="toTimeDate" />
                    </td>
                    <td><button class="button" @click="setTimeToFilter()">Set</button></td>
                </tr>
            </table>
        </div>
        <div class="box cardoncard" style="float:right;">
            <div class="title">Active Filters</div>
            <table>
                <template v-for="(obj, objKey) in filterList" :key="objKey" class="filterTableObject">
                    <tr v-show="obj.active"> 
                        <td :style="obj.changing? 'background-color:gray':''">
                            <label class="toggleSwitch" v-if="(typeof obj.without !== 'undefined')">
                                <input type="checkbox" :checked="obj.without" @change="toggleFilter(obj)">
                                <span>
                                    <span>&nbsp;&nbsp;+</span>
                                    <span>-</span>
                                </span>
                                <a></a>
                            </label>
                            
                        </td>
                        <td>
                            <span v-if="(typeof obj.without !== 'undefined')">
                                <span v-if="obj.without">Without</span><span v-else>Only</span>
                            </span>
                        </td>
                        <td align="Right">
                            <b>{{obj.name}}</b><span v-if="(typeof obj.item !== 'undefined' && typeof obj.item.name !== 'undefined')"> {{obj.item.name}} </span>
                        </td>
                        <td align="Right"><button class="button" @click="removeFilter(objKey)">X</button></td>
                    </tr>
                
                    <template v-if="obj.item && obj.item.length > 0">
                        <tr class="filterItems" v-for="(item, itemIndex) in obj.item" :key="itemIndex">
                            <td colspan="3" align="Right" v-if="(typeof item.name !== 'undefined')">
                                {{item.name}} <button class="button" @click="removeFilter(objKey, itemIndex)">X</button>
                            </td>
                            <td></td>
                        </tr>
                    </template>

                    <tr v-show="obj.active"><td colspan="4" class="trline"></td></tr>
                </template>
            </table>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from "vuex";
import * as jdenticon from "jdenticon";
import FilterInput from './FilterInput.vue';
import DateTimePicker from './DateTimePicker.vue';
import { TimeDateToString } from './DateTimePicker.vue';

import { State } from '@/store';
import { FilterList, FilterObject } from '../store/index';


export default defineComponent({
    name: "Filter",
    components:{
      FilterInput, DateTimePicker,
    },
    setup() {
        const store = useStore();
        const isOpen = ref(false);
        // const isActive = ref(false);

        const actionFilterInput = ref('');
        const identificationInput = ref('');
        const ipInput = ref('');
        const fromTimeDate = ref();
        const toTimeDate = ref();
        const fromTimeDateStr = computed(() => TimeDateToString(fromTimeDate.value));
        const toTimeDateStr   = computed(() => TimeDateToString(toTimeDate.value));

        const identicon = (store.state as State).indenticon;
        const identiconList = computed(() =>{
             return identicon.getKeys();
        });

        const filter = (store.state as State).filter;
        const filterList: FilterList = filter.getList();

        // Suggestion lists
        const actionList = computed(() =>{
             return filter.getActionSuggestions();
        });
        const ipList = computed(() =>{
             return filter.getIpSuggestions();
        });

        // The add and set filter funktions:
        function addActionFilter(){
            if(actionFilterInput.value){
                filter.add('Action', {name: actionFilterInput.value, value: actionFilterInput.value});
                actionFilterInput.value = '';
            }
        }
        function addIdentificationFilter(){
            if(identificationInput.value){
                filter.add('Identification', {name: identificationInput.value, value: identificationInput.value});
                identificationInput.value = '';
            }
        }
        function addIpFilter(){
            if(ipInput.value){
                filter.add('Ip', {name: ipInput.value, value: ipInput.value});
                ipInput.value = '';
            }
        }
        function setTimeFromFilter(){
            if(fromTimeDate.value){
                filter.add('TimeSpanFrom', {name: fromTimeDateStr.value, value: (fromTimeDate.value as Date).getTime()});
            }
        }
        function setTimeToFilter(){
            if(toTimeDate.value){
                filter.add('TimeSpanTo', {name: toTimeDateStr.value, value: (toTimeDate.value as Date).getTime()});
            }
        }
        function addWorkStationFilter(){
            filter.add('WorkStation');
        }
        function addUnknownXMLFilter(){
            filter.add('UnknownXML');
        }

        function removeFilter(objKey: any, itemIndex?: number){
            filter.remove(objKey, itemIndex);
        }

        function toggleOpen() {
            isOpen.value = !isOpen.value;
        }

        function toggleFilter(obj: FilterObject){
            if(obj.changing) {
                return;
            }
            obj.changing = true;
            setTimeout(()=>{
                if(typeof obj.without !== "undefined") {
                    obj.without = !obj.without;
                }
                obj.changing = false;
            }, 200);
        }

        // Will be calculated because they have an other size than identicons in the store
        const identiconSize = 30;
        const getIdenticonFrom = computed(
            ()=>{
            if(identificationInput.value){
                    return jdenticon.toSvg(identificationInput.value, identiconSize, identicon.getConfig());
                }
            }
        );

        return {
            isOpen,
            toggleOpen, toggleFilter,
            actionFilterInput, identificationInput, ipInput,
            fromTimeDate, toTimeDate,
            fromTimeDateStr, toTimeDateStr,
            identiconList, actionList, ipList,
            getIdenticonFrom,
            filterList, removeFilter,
            addActionFilter, addIdentificationFilter, addIpFilter, setTimeFromFilter, setTimeToFilter, addWorkStationFilter, addUnknownXMLFilter,
        }
    }
})
</script>

<style scoped>

.filter{
    width: 90%;
    margin: 0 auto;
    text-align: left;
}

.isFilterActive{
    background-color: white;
}

span{
    margin-left: 5px;
}

.head{
    height: 20px;
    margin-bottom: 2px;
}

.toggleSwitch > span:before {
background-color: rgb(17, 104, 0);
border: 1px solid rgb(17, 104, 0);
}

.toggleSwitch input:checked ~ span:before {
border-color: #a81818;
box-shadow: inset 0 0 0 30px #a81818;
}

.filterTableObject{
    /* background-color: #353535; */
    /* background-color: #545454; */
    margin: 2px; 
    border-radius: 5px;
    margin-left: auto; 
    margin-right: 0;
}

.activeFilterTypes{
    /* background-color: #56b57c;  */
    /* background-color: #95eaf2; */
    background-color: rgb(17, 104, 0);
    font-size: 13px;
    padding: 2px 5px 2px 2px;
    margin: 2px; 
    border-radius: 5px;
    margin-left: auto; 
    margin-right: 0;
}

.activeNegativeFilterTypes{
    background-color: #a81818;
}


.filterItems{
    width: 30px;
    margin-left: auto;
    margin-right: 0;
}

.box{
    margin: 2px; 
    display: table;
    margin-top:5px;
}

.trline{
    background-color: #474747;
}

.button{
    width: 60px;
    text-align: center;
}

.cardoncard{
    float: left;
    /* overflow-x: auto; */
}

</style>

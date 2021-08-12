<template>
    <div class="logtable">
        <div id="head">
            <div>{{title}}</div>
            <div v-if="timeRange.from || timeRange.to">
                <span>Timespan: {{timeToDate(timeRange.from)}} &#10230; {{timeToDate(timeRange.to)}}</span> | 
                <span>Received transactions: {{dataLogs.length}}</span>
            </div>
            <progress style="width:100%" :value="state.getlogProcess" max="1"></progress>
        </div>
        <div class="card" id="content" :style="state.isPrintView? 'overflow-y:initial; overflow-x:initial': ''">
            
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Timestamp 0 UTC<br/><span style="">YYYY.MM.DD hh:mm:ss.fff</span></th>
                        <th>Message Type / IP</th>
                        <th>Values</th>
                        <th>Block</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="dataLog in dataLogs" :key="dataLog.refBlock">
                        <template v-for="(obj, objIndex) in dataLog.objectDatas" :key="objIndex">
                            <LogTableItem :dataLog="dataLog" :dataItem="obj"></LogTableItem>
                        </template>
                        <tr v-if="!dataLog.objectDatas" class="cardoncard">    
                            <td colspan="4"></td>
                            <td class="refBlock">
                                <span>Ref: {{dataLog.refBlock}}</span><br/>
                                <button @click="showDataObject(dataLog)" class="button wrongButton">Data</button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { DataLog, State } from '@/store';
import LogTableItem from '../components/LogTableItem.vue';

export default {
    name: "LogTable",
    props:{
        title: {
                type: String,
                requier: true
        }
    },
    components: {
        LogTableItem
    },
    setup() {
        const store = useStore();
        const state = store.state as State; 
        const dataLogs = state.dataLogs;
        const timeRange = state.filter.getTimeRange();

        // Show the decrypted data as an object in an alert box and in the log
        function showDataObject(dataLog: DataLog){
            if(dataLog.objectDatas){
                console.log(dataLog.objectDatas);
                alert(JSON.stringify(dataLog.objectDatas));
            } else {
                console.log(dataLog.data);
                alert(dataLog.data);
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

        return {
            dataLogs,
            showDataObject, 
            LogTableItem, timeRange, state, timeToDate
        };
    }
}
</script>

<style scoped>

.logtable {
    /* display: flex; */
    /* justify-content: space-between; */
    align-items: center;
    display: contents;
}

table button{
    padding: 2px 8px 2px 8px;
}

#head{
    width: 90%;
    background-color: #181818;
    margin: 0 auto;
}

#content{
    overflow-y:scroll;
    width: 90%;
    margin: 0 auto;
}

.card{
    background-color: #3a3b46;
}

thead{
    font-size: 11px;
}

</style>
<style>

.refBlock{
    font-size:9px;
    text-align: center;
}
</style>
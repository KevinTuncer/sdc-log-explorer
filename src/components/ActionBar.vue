<template>
  <div class="actionbar card">
    <div style="display:table; width:100%">
      <div style="float:left">
        <div>{{title}}</div>
        <button v-show="!state.isPrintView" class="button" @click="addCurrentLogs()" :disabled="isAutoUpdate"><span>&#9664;</span> Get current log</button><!-- |&lArr; -->
        <button v-show="!state.isPrintView" class="button" @click="getFurtherLogs()" :disabled="isAutoUpdate"><span>&#9654;</span> Get further logs</button>
        <button v-show="!state.isPrintView" class="button" @click="decryptAll()" :disabled="isDecrypting"><span>&#128275;&#128273;</span> Decrypt all</button>
        <button class="button" @click="createProtocolOfSelected()"><span>&#128190;</span>Export as PDF</button>
      </div>
      
      <div style="float:right;">
        <button @click="toggleOpen" class="showButton">{{isOpen? 'Close Advanced Settings &#128316;': 'Open Advanced Settings &#128317;'}}</button>      
        <label style="margin-right:10px"><input type="checkbox" v-model="state.isPrintView">Print View</label>
        <label style="margin-right:10px"><input type="checkbox" v-model="state.showSelected">Show only selected</label>
      </div>
    </div>
    <div>
      <div v-if="isOpen" class="cardoncard" style="display:relative">
        <div class="title">Advanced Settings</div>
        <div>          
          <input type="checkbox" v-model="isAutoDecryption">
          Auto decryption
        </div>
        <div>
          <input v-model.number="getFurtherAmount" @input="changeFurtherAmount">
          ({{furtherAmount}}) Amount of further blocks per click
        </div>
        <div>
          <input type="checkbox" :value="isAutoUpdateValue" v-model="isAutoUpdate">
          Auto update
          <input :disabled="!isAutoUpdate" v-model.number="autoUpdateTime">ms
          <span class="warninghinttext">&#9888; This mode is not for real time data. Don't use it for diagnosis or as alert system! &#9888;</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

import * as openpgp from 'openpgp';
import { useStore } from "vuex";
import { DataLog, State, ObjectData } from '@/store';

import { GetBlockResult } from '../interfaces/connectionInterfaces';

export default defineComponent({
  name: "ActionBar",
  props:{
      title: {
          type: String,
          requier: true
      }
  },
  setup(){
      const xmlParser = new DOMParser();

      const store = useStore();
      const state = store.state as State; 
      const dataCon = state.dataConnection;

      const isDecrypting = ref(false);

      const isAutoDecryption = ref(true);
      const isAutoUpdate = ref(false);
      const isOpen = ref(false);
      const autoUpdateTime = ref(1000);
      const getFurtherAmount = ref(10);
      const furtherAmount = ref(10);

      function toggleOpen(){
         isOpen.value = !isOpen.value;
      }

      const isAutoUpdateValue = computed(()=>{
          if(isAutoUpdate.value){
            addCurrentLogs();
          }
      });

      /**
       * Get the next older dataLogs of a dataLog
       * @param startDataLog The dataLog which should be used to find the next one
       * @returns The next older dataLog or null if the startDataLog is already the last one.
       */
      async function getNextDataLog(startDataLog: DataLog): Promise<Array<DataLog> | null> {
          // Return if this dataLog is already the first recorded one
          if(startDataLog.refTrx == null || startDataLog.refTrx.length == 0){
             return null;
          } 

          // Get the blocknumber to an older dataLog 
          let n = startDataLog.refBlock;

          // Get this older block
          const blockResult = await dataCon.api.rpc.get_block(n) as GetBlockResult;
          
          // Filter the first transaction, if it is already added throuth the table stored in blockchain RAM
          let lastTrans = blockResult.transactions.length - 1;
          if(lastTrans >= 0){
              for(const action of blockResult.transactions[lastTrans].trx.transaction.actions) {
                  if(action.account == dataCon.contract && action.name == "update"){
                      let refDataLog: DataLog = action.data as DataLog;
                      // The same transaction refers to the same earlier transaction
                      if(refDataLog.user == dataCon.user && store.state.dataLogs[0].refTrx == refDataLog.refTrx) {
                          lastTrans--;
                      }
                  }
              }
          }

          // Check if there are any left transactions to add
          if(lastTrans < 0){
              return null;
          }
          
          // Search for all update transactions to the contract in this block. Older Transactions comes first, so the iteraction go backwards
          let dataLogs: Array<DataLog> = [];
          for(let i: number = lastTrans; i >= 0; i--) {
              for(const action of blockResult.transactions[i].trx.transaction.actions) {
                  if(action.account == dataCon.contract && action.name == "update"){
                      let refDataLog: DataLog = action.data as DataLog;
                      // Consider only the dataLogs of this user
                      if(refDataLog.scope == dataCon.scope && refDataLog.user == dataCon.user) {
                          dataLogs.push(refDataLog);
                      }
                  }
              }
          }
          
          if(dataLogs.length <= 0) {
              throw(`Error: Can't find an entry in the block number: ${blockResult.block_num}`);
          }

          return dataLogs;
      }

      /**
       * Add further older dataLogs 
       * @param amount Amount of next older dataLogs which will be added
       */
      async function addOlderDataLogs(amount: number = 1) {
        try{
              for(let i = 0; i < amount; i++) {
                  state.getlogProcess = i / amount;

                  // Get the oldest recognized data Log
                  const lastDatalog = store.state.dataLogs[state.dataLogs.length - 1] as DataLog;

                  // Get the next older dataLogs
                  const refDataLogs = await getNextDataLog(lastDatalog);
                  
                  // Return if the first recorded dataLog was found
                  if(refDataLogs === null || refDataLogs.length <= 0) {
                      return;
                  }
                  
                  // Decrypt this refDataLogs if auto decryption is activated
                  if(isAutoDecryption.value){
                      isDecrypting.value = true;
                      for(let dataLog of refDataLogs){    
                          if(typeof dataLog.objectDatas == "undefined") {
                              await decrypt(dataLog);
                          }
                      }
                      isDecrypting.value = false;
                  }

                  // Add this dataLogs to the store
                  store.commit('addLogs', refDataLogs);
              }
          } catch(e) {
              console.log(e);
          } finally {
              state.getlogProcess = 1.0;
          }
      }

      /**
       * Add current dataLogs. If there are already dataLogs all new ones will be loaded.
       */
      function addCurrentLogs() {
          if(!store.state.dataConnection || !store.state.dataConnection.api) {
              return;
          }
          try{
              ( async () => {
                  const tableResult = await dataCon.api.rpc.get_table_rows({
                      json: true,                               // Get the response as json
                      code: dataCon.contract,      // Contract that we target
                      scope: dataCon.scope,       // Account that owns the data
                      table: 'datalogs',                        // Table name
                      //reverse: false,                         // Optional: Get reversed data
                      show_payer: false,                        // Optional: Show ram payer
                      key_type: 'name',                         // primary_key type. For the default first primary_key is i64 required and default
                      //index_position: 0                       // 0 for primary_key. Default is 0 for the first primary_key
                      lower_bound: dataCon.user,   // get rows starting by the selected primaery_key
                      upper_bound: dataCon.user,   // get rows ending by the selected primaery_key
                      //limit: 1,                               // Maximum number of rows that we want to get, beginning from lower_bound
                  });
                  if(tableResult.rows.length > 0) {
                      let dataLog = (tableResult.rows[0] as DataLog);
                      if(state.dataLogs.length > 0) {
                          let firstDataLog = state.dataLogs[0];
                          if(firstDataLog.refTrx == dataLog.refTrx && firstDataLog.refBlock == dataLog.refBlock){
                              console.log("Logs are up to date.");
                              return;
                          } else {
                              console.log("Add new dataLogs.");
                              
                              // Get all newdataLogs until last one and commit them as array for a better performance (use of unshift)
                              let newLogs: Array<DataLog> = [dataLog];
                              let found: Boolean = false;
                              while(!found){
                                  // Get the next older dataLog
                                  let refDataLogs = await getNextDataLog(newLogs[newLogs.length - 1]);

                                  if(refDataLogs === null) {
                                      console.log("No new logs were found.");
                                      break;
                                  }

                                  // End while loop if the first recorded dataLog was found or this refDataLog is already listed
                                  for(let log of refDataLogs){
                                      if(log === null || log.refBlock == state.dataLogs[0].refBlock) {
                                          if(log.refTrx == state.dataLogs[0].refTrx){
                                              found = true;
                                              break;
                                          }
                                      }
                                  }

                                  // Add this dataLog
                                  newLogs.push(...refDataLogs);
                              }

                              // Decrypt this newLogs if auto decryption is activated
                              if(isAutoDecryption.value){
                                  isDecrypting.value = true;
                                  for(let dataLog of newLogs){    
                                      if(typeof dataLog.objectDatas == "undefined") {
                                          await decrypt(dataLog);
                                      }
                                  }
                                  isDecrypting.value = false;
                              }

                              // Add this dataLogs to the store
                              store.commit('addNewLogs', newLogs);
                              return;
                          }
                      }
                      console.log("Add dataLogs recursive.");
                      
                      // Decrypt this dataLog if auto decryption is activated
                      if(isAutoDecryption.value){
                          isDecrypting.value = true;
                          await decrypt(dataLog);
                          isDecrypting.value = false;
                      }

                      // Add this dataLog to the store
                      store.commit('addLog', dataLog);
                      
                      // Add the older dataLogs
                      addOlderDataLogs(2);
                      return;
                  }
                  console.log("No table entry for this user.");
                  console.log(tableResult);
              })();
          } catch(e) {
            console.log(e);
          }

          if(isAutoUpdate.value){        
            addCurrentLogsWithTimeOut();
          }
      }

      /**
       * Add current logs when the milliseconds of autoUpdateTime are reached
       */
      function addCurrentLogsWithTimeOut(){
          // Get the time value to wait for the next start
          setOnlyNumber(autoUpdateTime, 1000, 100, 3600000);
          let time = autoUpdateTime.value;

          // Change the value of an id to check if this loop is running more than once. It will set all other running functions as invalid.
          autoUpdateID++;
          if(autoUpdateID == Number.MAX_VALUE) {
              autoUpdateID = 0;
          }
          function startLater(id: number){
              // Onyl start this function if it is still valid
              if(id == autoUpdateID){
                addCurrentLogs();
              }
          }
          setTimeout(startLater, time, autoUpdateID);
      }
      let autoUpdateID = 0;   // ID to set functions as invalid, see addCurrentLogsWithTimeOut()

      /**
       * Get next older dataLogs. If there are no dataLogs already, then get curent dataLogs
       */
      function getFurtherLogs() {
          if(store.state.dataConnection && store.state.dataConnection.api) {
              if(state.dataLogs && state.dataLogs.length > 0){
                  setOnlyNumber(furtherAmount, 10, 1);
                  addOlderDataLogs(furtherAmount.value);
              } else {
                  addCurrentLogs();
              }
          }
      }
      
      /**
       * Check and adopt the value of the amount of further blocks per click 
       */
      function changeFurtherAmount(){
          furtherAmount.value = getFurtherAmount.value;
          setOnlyNumber(furtherAmount, 10, 1); 
      }

      /**
       * Check if the value is a number in the range else it will override it with the defined values
       * @param test contains the value of the number
       * @param defaultNr is the default number if value was not a number
       * @param min set the value to this parameter if value is lower
       * @param max set the value to this parameter if is bigger
       */
      function setOnlyNumber(test: {value: number}, defaultNr?: number, min?: number, max?: number){
          if(typeof test.value !== 'number'){
              if(typeof defaultNr === 'number'){
                  test.value = defaultNr;
              } else {
                  test.value = 0;
              }
              return;
          }
          if(typeof min === 'number' && test.value < min){
              test.value = min;
              return;
          }
          if(typeof max === 'number' && test.value > max){
              test.value = max;
              return;
          }
      }

      /**
       * Try to decrypt every dataLog which is not already decrypted
       */
      async function decryptAll() {
          // Return if no private key is defined or decrypting is already in progress
          if(isDecrypting.value || state.privateKey == null){
              return;
          }

          // Go through each dataLog and consider only not already decrypted ones 
          isDecrypting.value = true;
          for(let dataLog of state.dataLogs){    
              if(typeof dataLog.objectDatas == "undefined") {
                await decrypt(dataLog);
              }
          }
          isDecrypting.value = false;
      }

      /**
       * Try to decrypt a dataLog
       */
      async function decrypt(dataLog: DataLog) {
          try{
              // Try to read as pgp message
              let dataMessage = null; 
              try {
                  dataMessage = await openpgp.message.readArmored(dataLog.data)           // parse armored message   
              } catch(e) {
                  console.log(`Data is not decrypted: ${e}`);
              }

              // Decrypt if it is a pgp message
              let decryptedData: {data: string};
              if(dataMessage !== null) {
                  decryptedData = await openpgp.decrypt({
                      message: dataMessage,
                      // publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys,    // for verification (optional)
                      privateKeys: [state.privateKey]                                           // for decryption
                  });
              } else {
                  // Use the data direct if it is not an pgp message
                  decryptedData = dataLog;
              }

              // Parse the decrypted message to objects
              try {
                  // Parse the data from JSON to object          
                  dataLog.objectDatas = JSON.parse(decryptedData.data) as Array<ObjectData>;
                  
                  dataLog.objectDatas.forEach((entry: ObjectData) => {
                      // Add standard parameter for displaying
                      entry.display = {selected: false, show: true};

                      // Parse payload to payloadObject
                      let result = parseLog(entry);
                      if(result !== null) {
                          console.log(`${result} refBlock = ${dataLog.refBlock}.`);
                      }
                  })
              } catch (error) {
                  console.log(`Can't parse data to object. It will be used as raw.`, error);
                  dataLog.objectDatas = [{
                      undefinedData: decryptedData.data, 
                      display: {selected: false, show: true}
                  }];
              }
          } catch(e) {
              console.log(e);
          }
      }

      /**
       * Parse the property payload to the property objectPayload
       * @param log Entry of a log with the property type and payload
       * @returns an error message as string or null if conversion works
       */
      function parseLog(log: ObjectData): string | null{
          if(log.type) {
              switch(log.type){
                  // If the type is an sdc message then parse the payload as xml
                  case 'SDC': 
                      if(log.payload) {
                          let findXmlStart = (log.payload as string).indexOf("<?xml");
                          if(findXmlStart >= 0){
                              let xmlString = (log.payload as string).substr(findXmlStart);
                              let xmlDoc = xmlParser.parseFromString(xmlString,"text/xml");
                              if(xmlDoc.documentElement.nodeName != "parsererror"){
                                  log.objectPayload = xmlDoc;  
                                  return null;
                              } else {
                                  return 'XML parsing error on block with ref number';
                              }
                          }
                          else {
                              return "Can't find the beginning of an xml";
                          }
                      } else {
                          return 'Entry of SDC message has no payload';
                      }
                  case 'WS':
                      // If the type is from a workstation then the payload is a json object
                      if(typeof log.payload == 'string'){
                          log.objectPayload = JSON.parse(log.payload);
                      } else {
                        log.objectPayload = log.payload as object;
                      }
                      return null;
                  break;
                  default: return 'Entry has an unknown type';                      
              }
          } else {
              return 'Entry has no type';
          }
      }

      /**
      * Greate a log file of the visible selected logs
      */
      function createProtocolOfSelected(){
          if(state.dataLogs.length < 1 || !state.dataLogs[0].objectDatas){
              return;
          }     
          window.print();
      }

      return { 
          addCurrentLogs, getFurtherLogs, decryptAll, createProtocolOfSelected, 
          getFurtherAmount, furtherAmount, changeFurtherAmount, autoUpdateTime,
          isDecrypting, isAutoUpdate, isOpen, toggleOpen, isAutoDecryption, isAutoUpdateValue, state
      };
    }
})
</script>

<style scoped>
.actionbar {
    width: 90%;
    margin: 6px auto;
    /* display: flex; */
    /* justify-content: space-between; */
    /* align-items: center; */
    text-align: left;
}

span{
    font-size: 0.83em;
    margin-right: 0.5em;
}

.inactive{
    background-color: gray;
}

.warninghinttext{
    color: red;
    padding-left: 10px;
    padding-right: 10px;
}
</style>
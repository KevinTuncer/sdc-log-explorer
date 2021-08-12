<template>
  <div class="connection">
    <div>
      <button @click="connect" :disabled="isConnecting" class="button wrongButton" :class="[{rightButton: ready && !connected}, {completeButton: connected}]">Connect</button>
      <span class="title">{{title}}</span>
    </div>
    <div id="inputs">
      <div>
        <div>Endpoint:<input list="endpoints" name="endpoint" v-model="endpoint.domain" :class="{wrongInput: apiError}" size="30"></div>
          <datalist id="endpoints">
            <option v-for="(ed, index) in endpointList" :key="index" :name="ed.name" :value="ed.domain">{{ed.domain}}</option>
          </datalist>
      </div>
      <div>
        <AccountInput v-model="contract" description="Contract" placeholder="logger conract" v-model:valueError="contractError"></AccountInput>
        <AccountInput v-model="scope" description="Scope" placeholder="logger scope"></AccountInput>
      </div>
      <AccountInput v-model="user" description="Sniffer" placeholder="sniffer account"></AccountInput>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { ecc } from 'eosjs/dist/eosjs-ecc-migration';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';           // TODO: should be replaced by a wallet like scatter or anchor

import AccountInput from './AccountInput.vue';
import { ConnectionData } from '@/store';

export interface EndPoint{
  name: string,
  domain: string,
  type: string
  chainID?: string
}

export default defineComponent({
    name: "Connection",
    components:{
        AccountInput
    },
    //emits: ['update'],
    props:{
        title: {
            type: String,
            requier: true
        },
        endpointList: {
            type: Object,
            default: [
              {
                  name: "Localhost",
                  domain: "http://localhost:8888/",
                  type: "eos"
              },
              {
                  name: "Kylin Testnet",
                  domain: "https://api-kylin.eosasia.one",
                  type: "eos"
              }
            ]
        },
        selectedEndpoint:{
            type: Number,
            requirer: false
        }
    },
    setup(props, context) {
        const public_Key = ref('');
        const contract = ref('datasafe');
        const scope = ref('ac.hospital1');
        const user = ref('op.room1');
        const private_key = ref('');
        const endpoint = ref({ name: '', domain: '', type: '', chainID: '' });
        const apiError = ref(false);
        const contractError = ref(false);
        const connected = ref(false);
        const isConnecting = ref(false);

        // Predefine the endpoint if declared
        if(typeof props.selectedEndpoint !== undefined && props.endpointList.length > props.selectedEndpoint && props.selectedEndpoint >= 0){
            endpoint.value = props.endpointList[props.selectedEndpoint];        
        }

        // Compute if all parameters are valid
        const ready = computed(
            () => {
                // Reset API error on any change
                apiError.value = false;

                // Check if the private Key is valid
                if(!ecc.isValidPrivate(private_key.value))
                {
                    public_Key.value = '-- invalid private key --';
                    return false;
                }
                
                // Show the public key of the private key
                public_Key.value = ecc.privateToPublic(private_key.value);

                // Check all other parameters
                return user.value.length <= 12 && user.value.length > 0 && private_key.value.length <= 51 && endpoint.value.domain.length > 0;
            }
        );
    
        // Emit all data on clicking the connect button
        async function connect() {
            try {
                isConnecting.value = true;
                if(!endpoint.value.domain) {
                    throw("No endpoint is defined.");
                }

                const rpc = new JsonRpc(endpoint.value.domain);
                const signatureProvider = private_key.value? new JsSignatureProvider([private_key.value]) : new JsSignatureProvider([]);
                const api = new Api({ rpc, signatureProvider });
                
                let apiResult = await api.rpc.get_info();

                // Check chain id if predefined
                if(endpoint.value.chainID && endpoint.value.chainID != apiResult.chain_id) {
                    throw("Predefined chainID is not equal to connected network.");
                }
                else {
                    endpoint.value.chainID = apiResult.chain_id;
                }

                try{
                    // Check contact account for contract
                    let abiResult = await api.rpc.get_abi(contract.value);
                    if(!abiResult.abi) {
                        throw("This account contract doesn't exist.");
                    }
                  
                        let connectionData : ConnectionData = {
                        contract: contract.value,
                        scope: scope.value,
                        user: user.value,
                        endPoint: endpoint.value.domain,
                        api: api
                    };

                    apiError.value = false;
                    connected.value = true;
                    
                    context.emit('update', connectionData);              
                    return;
                } catch(e) {
                    contractError.value = true;
                    console.log(e);
                }
            }
            catch(e){
                console.log(e);
                apiError.value = true;
            } finally {
                isConnecting.value = false;
            }
            connected.value = false;
        }

        return {
            contract, scope, user, private_key, endpoint,
            public_Key,
            connect, 
            ready,
            connected, apiError, contractError, isConnecting
        }
    }
})
</script>

<style scoped>
.connection {
  max-width: 700px;
  margin: 6px auto;
  /* display: flex; */
  /* justify-content: space-between; */
  /* align-items: center; */
  background-color: gainsboro;
  padding: 5px;
  text-align: left;
}

.connection > div{
  width: 100%;
  display: table;
}

button{
  float:right;
}

#inputs{
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}
#inputs > div {
  text-align: right; 
}
#inputs span {
  font-size: 0.8em;
  margin-right: 5px;
}
</style>
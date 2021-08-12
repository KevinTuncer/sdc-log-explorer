<template>
    <div class="settings">
        <!-- <div style="color:white; margin-top:5px">&#8505; This software is not for real time data. Don't use it for diagnosis or as alert system &#8505;</div> -->
        <div class="card settingsCard">
            <div class="title">Blockchain</div>
            
            <div class="content">
                <!-- <Connection @update="connectLocal" title="Local blockchain" :selectedEndpoint="0"></Connection> -->
                <div class="table">
                    <div>
                        <span>Endpoint:</span>
                        <span>
                            <input list="endpoints" name="endpoint" v-model="endpoint.domain" :class="{wrongInput: apiError}" placeholder="URL of blockchain network">
                            <datalist id="endpoints">
                                <option v-for="(ed, index) in endpointList" :key="index" :name="ed.name" :value="ed.domain">{{ed.domain}}</option>
                            </datalist>
                        </span>
                    </div>
                    <AccountInput v-model="contract" description="Contract" placeholder="contract account name" v-model:valueError="contractError"></AccountInput>
                    <AccountInput v-model="scope" description="Scope" placeholder="scope account name" v-model:valueError="scopeError"></AccountInput>
                    <AccountInput v-model="user" description="Sniffer" placeholder="sniffer account name" v-model:valueError="userError"></AccountInput>

                    <span class="textareadescripton">
                        <span>Decryption Key:</span>
                        <div class="hint">&#8505; Your private key and passphrase are secret you have to hide them from third parties &#8505;</div>
                    </span>
                    <span>
                        <textarea @input="calcPublicKey" v-model="rPrivateKey" rows="9" :class="[{wrongTextarea: false}, {wrongInput: rPrivateKey.length > 0 && !readyPGP}]" placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----&#10;...&#10;...&#10;...&#10;-----END PGP PRIVATE KEY BLOCK-----"></textarea>
                    </span>
                    <div>
                        <span>Passphrase:</span>
                        <span>
                            <input v-model="passphrase" :class="{wrongInput: wrongPassphrase}" placeholder="Your secret passphrase">
                        </span>
                    </div>
                </div>
                <div>
                    <div>
                        <span class="pgphint">{{pgphint}}</span>
                        <button @click="toggleOpen" class="showButton" :class="{activeBackground: isOpen}">{{isOpen? 'Hide PGP values &#128316;': 'Show PGP values &#128317;'}}</button>            
                            <div v-show="isOpen" class="cardoncard">
                                <div class="table">
                                    <span class="textareadescripton">Public Key:</span>
                                    <span>
                                        <textarea v-model="rPublicKey" disabled rows="9"></textarea>
                                    </span>
                                    <div><span>Algorithm:</span><span><div class="itemvalue" v-show="readyPGP">{{ algorithmInfo.algorithm }}</div></span></div>
                                    <div><span>Curve:</span><span><div class="itemvalue" v-show="readyPGP">{{ algorithmInfo.curve }}</div></span></div>
                                    <div><span>Fingerprint:</span><span><div class="itemvalue" v-show="readyPGP">{{ fingerprint }}</div></span></div>
                                </div>
                            </div>
                    </div>
                    <div>                        
                    </div>
                    <div class="table safetyBox" :class="{wrongBorder: noSafetyConfirmationError}">
                        <div>
                            <span><input type="checkbox" class="label" v-model="safetyConfirmation" @change="noSafetyConfirmationError = false"></span>
                            <span>I know that this software is not for real time data and I will not use it for diagnosis or as alert system.</span>
                        </div>
                    </div>
                    <button @click="connect" :disabled="isConnecting" class="button">Connect</button>
                </div>
            </div>
            <div class="errorhint">{{errorhint}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import AccountInput from '../components/AccountInput.vue';

import * as openpgp from 'openpgp';
import { router } from '../router';
import { useStore } from "vuex";
import { ConnectionData } from '@/store';
import { ecc } from 'eosjs/dist/eosjs-ecc-migration';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';                     // TODO: should be replaced by a wallet like scatter or anchor

export interface EndPoint{
    name: string,
    domain: string,
    type: string
    chainID?: string
}

export default defineComponent({
    name: 'Settings',
    components: {
        AccountInput
    },
    props:{
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
        },

        // default users for testings
        userList: {
        type: Object,
        default: [
            {
                // Blockchain params
                endpoint: 'http://localhost:8888/',
                contract: 'datasafe',
                scope: 'ac.hospital1',
                user: "op.room1",
                // PGP params
                userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
                curve: "secp256k1",
                passphrase: "Schweres Passwort XYZ",
                privateKey: `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: OpenPGP.js v4.10.9
Comment: https://openpgpjs.org

xaIEX+DyuBMFK4EEAAoCAwRza94sN+/NZoe59jNyW25L+7SGgRvRzzXxpKNs
fx2gB3AaEDp+NpPlMygCq3GVLVbL1xUBzlNhwLVX9N7OqLJu/gkDCKyYFJQz
oF4+4KHr2yspcEWBhPjYLCM1hA3wUSVGFAoZGLh0RDPzl8LErx/dBUxbMn35
q8mwFFmOyzZ0jFHqQycwvHoWRZngRSqF9e7m3qzNG0pvbiBTbWl0aCA8am9u
QGV4YW1wbGUuY29tPsKPBBATCAAgBQJf4PK4BgsJBwgDAgQVCAoCBBYCAQAC
GQECGwMCHgEAIQkQ9akJtId07MEWIQRYvIM6aJARO8H5iZ31qQm0h3TswcrF
AQCV5VXcb0wqBs1ildQILj8YUCoX8HmUmfgWrIXLWabsQwEAmlh4HyoEKEOj
EeIjxYt3+TJQt+wv2QciZ1K1uq95O4DHpgRf4PK4EgUrgQQACgIDBL3VqJ5S
oXLUaNv4mTTpdEmaiqfbvW3oMUdmXZM1/N7lRbF3/pZ9xwYvOVXCHdr29pAL
hljVtJbpxIZ0vSb7Yw0DAQgH/gkDCEIs60HaYTQa4CQf3XDxZ4Kh3boEE+yE
9k21ny/rovFnyR9KDk7b1XUE3tiRh7ZoRsHf0Ijf0u2YI6xejY6QvQLSYBz4
5GbvDgIbVlfegePCeAQYEwgACQUCX+DyuAIbDAAhCRD1qQm0h3TswRYhBFi8
gzpokBE7wfmJnfWpCbSHdOzBpy8BAJ4DJS65dkfudYmHCzx08msIIsWaQzXl
SCKz9TSjzeLkAP9fSEMJjHQKQii7cZHe9nH4T7q7OK8Kvh+TjCWvR2mceQ==
=ACSH
-----END PGP PRIVATE KEY BLOCK-----`},
                ]
            }, 
    },        
    setup(props, context)
    {
        const store = useStore();
        const defaultDataConnection : ConnectionData = store.state.dataConnection;
        const public_Key = ref('');
        const contract = ref(defaultDataConnection.contract? defaultDataConnection.contract : '');
        const scope = ref(defaultDataConnection.scope? defaultDataConnection.scope : '');
        const user = ref(defaultDataConnection.user? defaultDataConnection.user : '');
        const private_key = ref('');
        const endpoint = ref({ name: '', domain: defaultDataConnection.endPoint? defaultDataConnection.endPoint: '', type: '', chainID: '' });
        const apiError = ref(false);
        const contractError = ref(false);
        const scopeError = ref(false);
        const userError = ref(false);
        const connected = ref(false);
        const isConnecting = ref(false);

        const rPrivateKey = ref('');
        const rPublicKey = ref('');
        const passphrase = ref('');
        const fingerprint = ref('');
        const algorithmInfo = ref({algorithm: '', curve: ''});
        const readyPGP = ref(false);
        const wrongPassphrase = ref(false);
        const rightPGP = ref(false);
        const isWorking = ref(false);
        const isOpen = ref(false);
        const safetyConfirmation = ref(false);
        const noSafetyConfirmationError = ref(false);

        const errorhint = ref('');
        const pgphint = ref("No keys for decryption.");

        let privateKey: openpgp.key.Key = null;

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

        function toggleOpen(){
            isOpen.value = !isOpen.value;
        }

        async function calcPublicKey()
        {
            // Check if BEGIN and END line of the key block are present
            let start = rPrivateKey.value.indexOf('-----BEGIN PGP PRIVATE KEY BLOCK-----');
            if(start >= 0 && rPrivateKey.value.includes('-----BEGIN PGP PRIVATE KEY BLOCK-----', start) && rPrivateKey.value.includes('-----END PGP PRIVATE KEY BLOCK-----')){
                try{
                    // Get the public key without armor                        
                    let keys = (await openpgp.key.readArmored(rPrivateKey.value)).keys;

                    // Check if it is a private key
                    if(keys.length > 0 && keys[0].isPrivate()) {         
                        // Show key specific parameters
                        privateKey = keys[0];
                        algorithmInfo.value = privateKey.getAlgorithmInfo() as {algorithm: string, curve: string};
                        fingerprint.value = privateKey.getFingerprint();
                    
                        // Get public key
                        let publicKey = privateKey.toPublic();
                        rPublicKey.value = publicKey.armor();
                        readyPGP.value = true;

                        pgphint.value = "Private key is valid.";
                    }
                    else{
                        pgphint.value = "Failure for the private decryption key.";
                        console.log("Failure for the private decryption key.");
                        rPublicKey.value = "";
                        readyPGP.value = false;
                        privateKey = null;
                    }
                }
                catch(e)
                {
                    console.log(e);
                    pgphint.value = e;
                    rPublicKey.value = "";
                    readyPGP.value = false;
                    privateKey = null;
                }
            } else {
                readyPGP.value = false;
                if(rPrivateKey.value.length > 0){
                    pgphint.value = "See the format for the private key. The header and foot line have to be included.";
                } else {
                    pgphint.value = "No private key for decryption.";
                }
                rPublicKey.value = "";
                privateKey = null;
            }
            return false;
        }

        /**
         * Show an error text in the window and the log
         * @param text is the error in string format.
         * */ 
        function setPGPHint(text: string){
            console.log(text);
            pgphint.value = text;
        }

        /**
         * Show an error text in the window and the log
         * @param text is the error in string format. If this value is an empty string it will not trigger a log entry.
         * */ 
        function setErrorHint(text: string){
            if(text !== ""){
                console.log(text);
                errorhint.value = text;
            } else {
                errorhint.value = text;
            }
        }

        /**
         * Check the parameters for decryption and set them to the store
         * */ 
        async function applyPGP() {
            await calcPublicKey();
            if(readyPGP.value) {
                // Decrypt the private key
                try{
                    if(privateKey.isDecrypted() || await privateKey.decrypt(passphrase.value)){
                        wrongPassphrase.value = false;
                        applyPrivateKey(privateKey);
                    } else {
                        wrongPassphrase.value = true;
                    }
                } catch(e) {
                    console.log(e);
                    pgphint.value = e;
                    wrongPassphrase.value = true;
                }
                finally{
                    isWorking.value = false;
                }
            }
            
            // Failure management to show an appropriate hint
            if(rPrivateKey.value){
                if(readyPGP.value && !wrongPassphrase.value){
                    setPGPHint("Private key and passphrase for decryption are valid.");
                    return true;
                } else if(readyPGP.value){
                    setPGPHint("Wrong passphrase.");
                } else {
                    setPGPHint("Wrong private key or passphrase.");
                }
            } else {
                if(passphrase.value){
                    setPGPHint("Missing private key.");
                } else {
                    setPGPHint("No keys for encryption are defined.");
                    applyPrivateKey(null);
                    return true;
                }
            }
            applyPrivateKey(null);
            return false;
        }

        /** 
         * set the connection data to default ones for testing
         * @param selectedUser is a number to select the predefined values
         */
        function setDefaultForTesting(selectedUser: number){
            if(isNaN(selectedUser)){
                selectedUser = 0;
            }
            if(typeof selectedUser === 'number' && props.userList.length > selectedUser && selectedUser >= 0){
                let selected = props.userList[selectedUser];
                rPrivateKey.value = selected.privateKey;
                passphrase.value = selected.passphrase;
                endpoint.value.domain = selected.endpoint;
                contract.value = selected.contract;
                scope.value = selected.scope;
                user.value = selected.user;
                safetyConfirmation.value = true;

                calcPublicKey();
            }
        }

        /**
         * Emit all data for a blockchain connection and pgp encryption by clicking the connect button
         */
        async function connect() {

            // Set PGP. Not defined is valid but return this function if there is an error with it
            let noPGPError = await applyPGP();
            if(!noPGPError){
                errorhint.value = 'Encryption key or passphrase are not valid.'; 
                return;
            }

            // Try to connect to the blockchain
            try {
                isConnecting.value = true;
                if(!endpoint.value.domain) {
                    throw("No endpoint is defined.");
                }

                // Check for a cheat to set all inputs to predefined values for testing
                if(endpoint.value.domain.length >= 12 && endpoint.value.domain.substr(0, 12) == 'default test'){
                    setDefaultForTesting(parseInt(endpoint.value.domain.substr(12)));
                    return;
                }

                // Check safety confirmation
                if(!safetyConfirmation.value){
                    noSafetyConfirmationError.value = true;
                    errorhint.value = 'You have to confirm the statement next to the checkbox.'; 
                    return;
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
                    // Check if contract account exists
                    try{
                        await api.rpc.get_account(contract.value);
                    } catch(e){
                        contractError.value = true;
                        throw("This contract account doesn't exist.");
                    }

                    // Check contact account for contract
                    let abiResult = await api.rpc.get_abi(contract.value);
                    if(!abiResult.abi) {
                        contractError.value = true;
                        throw("There is no contract running on the mentioned contract account.");
                    }


                    // Check if scope account exists
                    try{
                        await api.rpc.get_account(scope.value);
                    } catch(e){
                        scopeError.value = true;
                        throw("This scope account doesn't exist.");
                    }
                    
                    // Check if sniffer account exists
                    try{
                        await api.rpc.get_account(user.value);
                    } catch(e){
                        userError.value = true;
                        throw("This sniffer account doesn't exist.");
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
                    
                    storeData(connectionData);         
                    setErrorHint('');
                    router.push('/explorer');
                    return;
                } catch(e) {
                    setErrorHint(e);
                }
            }
            catch(e){
                setErrorHint(e);
                apiError.value = true;
            } finally {
                isConnecting.value = false;
            }
            connected.value = false;
        }

        function storeData(connectionData: ConnectionData){
            // Reset the state without private key
            store.commit('reset');

            // Store the connection data of the blockchan
            store.commit('setDataConnectionSettings', connectionData);
        }

        function applyPrivateKey(key: openpgp.key.Key){
            store.commit('setPrivateKeySettings', key);
        }

        return {
            applyPrivateKey,
            contract, scope, user, private_key, endpoint,
            public_Key,
            connect, 
            ready,
            connected, apiError, contractError, scopeError, userError,
            isConnecting, safetyConfirmation, noSafetyConfirmationError,

            rPublicKey,
            rPrivateKey, calcPublicKey,
            passphrase,
            fingerprint, algorithmInfo, 
            readyPGP, wrongPassphrase, rightPGP, isWorking,
            isOpen, toggleOpen,
            pgphint, errorhint
        }
    }
})
</script>

<style scoped>

.settingsCard {
    width: 700px;
    margin: 6px auto;
}

@media(max-width: 700px) {
    .settingsCard {
        width: 100%;
    }
}

.content{
    overflow-y: auto;
    padding: 5px 10px 5px 10px;
    text-align: left;
}

.title{
    display: block;
}
.content > div{
    width: 100%;
}

/* button{
    width: 100%;
} */

.button {
    width: 100%;
    margin-left: auto;
}

.table{
    display: table;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}
.table > div {
    /* text-align: right;    */
    display: table-row;
}
.table span {
    /* font-size: 0.8em; */
    /* margin-right: 5px; */
    display: table-cell;
}

.itemvalue {
    padding-top: 10px;
    padding-left: 5px;
    /* font-weight: bold; */
}

input{
    width: 95%;
    padding: 4px;
}

.hint{
    margin-top: 10px;
    margin-bottom: 5px;
    /* color: red; */
    width: 150px;
    background-color: #34353f;
    padding: 5px;
}

.tablecell{
    display: table-cell;
}

.textareadescripton{
    vertical-align: top;
    width: 50px;
}

.textareadescripton > span{
    white-space: nowrap;
}

textarea{
    margin-left: 5px;
    width:95%;
    max-width: 100%;
    padding: 4px;
}

/* .wrongTextarea{
    border: #e30613 solid 2px;
}

.wrongTextareaText{
    color: red;
} */

.pgphint{
    float:left; 
    margin:5px
}

.errorhint{
    padding:5px;
    width:100%;
}

.label {
    white-space: nowrap;
    text-align: left;
    width:30px;
}

.wrongBorder{
    border-bottom: #E30613 solid 1px;
}

.safetyBox{
    padding-top:30px;
    padding-bottom: 10px;
    margin-bottom: 10px;
}
</style>

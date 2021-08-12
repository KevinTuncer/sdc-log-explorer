
<template>
    <div class="pgpinput">
        <div>
            <button @click="apply" :disabled="isWorking" class="button wrongButton" :class="[{rightButton: ready && !complete}, {completeButton: complete}]">
                &#128273; Apply
            </button>
            <span class="title">{{title}}</span>
            <span class="hint">--- Your private key is secret you have to hide it from third parties! ---</span>
        </div>
        <div id="inputs">
            <textarea v-model="rPrivateKey" rows="25" cols="70" 
            placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----&#10;...&#10;...&#10;...&#10;-----END PGP PRIVATE KEY BLOCK-----"></textarea>
            <div>Passphrase: <input v-model="passphrase" :class="{wrongInput: wrongPassphrase}" size="50"></div>
            <div v-show="hasPrivateKey" style="font-family:'Courier New', monospace;">
                <textarea v-model="rPublicKey" disabled rows=10 cols="70"></textarea>
                <div>Fingerprint: <b v-show="ready">{{ fingerprint }}</b></div>
                <div>Algorithm: <b v-show="ready">{{ algorithmInfo.algorithm }}</b> Curve: <b v-show="ready">{{ algorithmInfo.curve }}</b></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import * as openpgp from 'openpgp';
import { Api, JsonRpc, RpcError } from 'eosjs';
import { GetAbiResult, GetBlockResult, GetCodeResult, GetInfoResult, GetRawCodeAndAbiResult, PushTransactionArgs, GetBlockHeaderStateResult } from 'eosjs/dist/eosjs-rpc-interfaces';

export default defineComponent({
    name: "PGPInput",
    emits: ['update'],
    props:{
        title: {
            type: String,
            requier: true
        },
        userList: {
            type: Object,
            default: [
                {
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
            {
                userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }],
                curve: "secp256k1",
                passphrase: "super long and hard to guess secret",
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
        selectedUser:{
            type: Number,
            requirer: false
        }
    },
    setup(props, context) {
        const rPrivateKey = ref('');
        const rPublicKey = ref('');
        const passphrase = ref('');
        const fingerprint = ref('');
        const algorithmInfo = ref({algorithm: '', curve: ''});
        const ready = ref(false);
        const wrongPassphrase = ref(false);
        const complete = ref(false);
        const isWorking = ref(false);

        let privateKey: openpgp.key.Key = null;
        
        // Predefine the rPrivateKey if declared
        if(typeof props.selectedUser !== undefined && props.userList.length > props.selectedUser && props.selectedUser >= 0){
            rPrivateKey.value = props.userList[props.selectedUser].privateKey;
            passphrase.value = props.userList[props.selectedUser].passphrase;
        }

        const hasPrivateKey = computed(()=>{
            wrongPassphrase.value = false;
            // Check if BEGIN and END line of the key block are present
            let start = rPrivateKey.value.indexOf('-----BEGIN PGP PRIVATE KEY BLOCK-----');
            if(start >= 0 && rPrivateKey.value.includes('-----BEGIN PGP PRIVATE KEY BLOCK-----', start) && rPrivateKey.value.includes('-----END PGP PRIVATE KEY BLOCK-----')){
                CalcPublicKey();    // Only calc the public key if these lines are present
                return true;
            } else {
                ready.value = false;
                privateKey = null;
                return false;
            }
        });

        async function CalcPublicKey()
        {
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

                    ready.value = true;
                }
                else{
                    console.log("Entered no private key.");
                    ready.value = false;
                    privateKey = null;
                }
            }
            catch(e)
            {
                console.log(e);
                rPublicKey.value = "";
                ready.value = false;
                privateKey = null;
            }
        }

        // Emit all data on clicking the check button
        function apply() {
            if(privateKey && passphrase.value) {
                isWorking.value = true;
                (async()=>{
                    // Decrypt the private key
                    try{
                        if(privateKey.isDecrypted() || await privateKey.decrypt(passphrase.value)){
                            complete.value = true;
                            wrongPassphrase.value = false;
                            context.emit('update', privateKey);
                        } else {
                            console.log("Wrong passphrase");
                            complete.value = false;
                            wrongPassphrase.value = true;
                        }
                    } catch(e) {
                        console.log(e);
                        complete.value = false;
                        wrongPassphrase.value = true;
                    }
                    finally{
                        isWorking.value = false;
                    }
                })();
            } else {
                        complete.value = false;
            }
        }

        return {
                rPublicKey,
                rPrivateKey, hasPrivateKey,
                passphrase,
                fingerprint, algorithmInfo,
                apply, 
                ready, wrongPassphrase, complete, isWorking
        }
    }
})
</script>

<style scoped>
.pgpinput {
    max-width: 700px;
    margin: 6px auto;
    /* display: flex; */
    /* justify-content: space-between; */
    /* align-items: center; */
    background-color: gainsboro;
    padding: 5px;
    text-align: left;
}

.pgpinput > div{
    width: 100%;
    display: table;
}

#inputs{
    text-align: center;
}

.button {
    float: right;
}

.hint{
    margin: 5px;
    padding: 5px;
    background-color: black;
    color: white;
    font-size: 14px;
}
</style>
<template>
    <div id="nav">
        <div class="statusContainer">
            <button class="button nowrap" style="float:left" v-show="showMenu && !state.isPrintView">
                <router-link to="/"><span>&#11013;</span> Back</router-link>
            </button>
            <div class="statusCell">
                <!-- <div class="backbutton">
                    <span class="pageTab">
                        <router-link to="/"><span>&#11013;</span> Back</router-link>
                    </span>
                </div> -->
                <div>
                    <label>
                        <span>Blockchain:</span> <b>{{state.dataConnection.endPoint}}</b>
                    </label>
                    <label>Contract: <b>{{state.dataConnection.contract}}</b></label>&nbsp;&nbsp;<label>Scope: <b>{{state.dataConnection.scope}}</b></label>&nbsp;&nbsp;<label>Sniffer: <b>{{state.dataConnection.user}}</b></label>
                </div>
            </div>
            <div class="statusCell"><span>Decryption Fingerprint: </span><label><b>{{state.privateKey? state.privateKey.getFingerprint() : "No key available"}}</b></label>
            </div>
        </div>
    </div>
    <router-view />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { router } from './router';

export default defineComponent({
    name: "App",
    setup(){
        const state = useStore().state;
        const showMenu = computed(()=>{
            if(router.currentRoute.value.name == 'explorer'){
                return true;
            } else {
                return false;
            }
        });
        return {state, showMenu};
    }
});
</script>

<style>
html, body{
    margin: 0;
    background-color: black;
    color: white;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    /* font-family:'Courier New', monospace; */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

#nav {
    padding: 0;
}

#nav a {
    padding: 0 8px;
    color: white;
    /* font-size: 16px; */
    text-decoration: none;
}

/* #nav a.router-link-exact-active {
    color: #95eaf2;
} */

.nowrap{
    white-space: nowrap;
}

.card{
    background-color: #181818;
}

.cardoncard{
    background-color: #242329;
    /* padding: 5px; */
    margin:5px;
}

.statusContainer{
    color:white; 
    display:flex; 
    flex-direction:row;
    background-color: #111111;
    padding: 2px;
}

.statusContainer > span{
    flex: 1 1 auto;
    text-align: left;
}

@media(max-width: 700px) {
    .statusContainer {
            flex-direction:column;
    }
}

.statusCell {
    background-color: #181818;
    padding: 5px 5px 5px 0;
    /* border-radius: 5px; */
    margin:2px;
    text-align: left;
    display: table-cell;
    min-height: 34px;
}

.statusCell > span {
    font-size: 1.0em;
    /* background-color: #545454; */
    /* display: block; */
    padding: 5px;
}

label {
    float:right;    
    margin:2px;
}

.wrongInput{
    color: #E30613;
}

.button {
    margin: 5px;
    border-color: #86a2ee;
    /* color: #95eaf2; */
    color: white;
    /* background-color: #2c2e30; */
    background-color: #282b2c;
    border-width: 1px;
    border-radius: 3px;
    /* font-size: 13px; */
}

input{
    margin: 5px 5px 5px 5px;
}

.wrongButton{
    background-color: #E30613;
}

.rightButton{
    background-color: blue;
}

.completeButton{
    background-color: #6f857b;
    /* color: #95eaf2; */
}

.showButton{
    float: right;
    height: 22px;
    font-size: 0.7em;
    padding: 2px 4px 2px 4px;
    /* width:160px; */
    color:white;
    background-color: #2f3042;
    border-color: #86a2ee;
    border-width: 1px;
    margin:4px;
    text-align: end;
    border-radius: 3px;
}

button{
    cursor: pointer;
    padding: 5px 15px 5px 15px;
    border-radius: 5px;
    font-weight: 600;
}

input[type=checkbox]{
    cursor: pointer;
}

input[type=date]{
    cursor: pointer;
}

input[type=time]{
    cursor: pointer;
}

svg{
    background-color: white;
}

.idcon > svg{
    cursor: pointer;
    border: solid 2px #86a2ee;
    border-radius: 3px;
    padding: 2px;
    margin: 2px;
}

button:focus{
        outline: none;
}

button:disabled {
    background: #5f5f5f; 
    color: #252525;
}

.title{
    font-size: 1.2em;
    /* background-color: #2d2e36; */
    background-color: #3a3b46;
    padding:5px;
    text-align: center;
}

.backbutton{
    float: left;
    margin-top: 5px;
}

.backbutton + div{
    float: right;
}
.pageTab{
    border: #86a2ee solid 2px;
    background-color: #181818;
    padding: 10px 0px 10px 0px;
    margin: 2px;
    /* font-size: 1.8em; */
    white-space: nowrap;
}

.pageTab a{
    padding: 10px;
    /* margin: 10px; */
}

.rightTab{
    border-color: darkgreen;
}

.rightNumber{
    color:darkgreen;
}

.nextNumber{
    color:aqua;
}
#nav a.router-link-exact-active>.nextNumber{
    color:aqua;
}

.activeBackground{
    background-color: #575b69;
}

/*    Toggle Switch    */

.toggleSwitch span span {
    display: none;
}

@media only screen {
    .toggleSwitch {
        display: inline-block;
        height: 18px;
        position: relative;
        overflow: visible;
        padding: 0;
        /* margin-left: 50px; */
        cursor: pointer;
        width: 40px;
        user-select: none;

        margin-right: 15px;
    }
    .toggleSwitch * {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }
    .toggleSwitch label,
    .toggleSwitch > span {
        line-height: 20px;
        height: 20px;
        vertical-align: middle;
    }
    .toggleSwitch input:focus ~ a,
    .toggleSwitch input:focus + label {
        outline: none;
    }
    .toggleSwitch label {
        position: relative;
        z-index: 3;
        display: block;
        width: 100%;
    }
    .toggleSwitch input {
        position: absolute;
        opacity: 0;
        z-index: 5;
    }
    .toggleSwitch > span {
        position: absolute;
        /* left: -50px; */
        width: 100%;
        margin: 0;
        padding-right: 50px;
        text-align: left;
        white-space: nowrap;
    }
    .toggleSwitch > span span {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 5;
        display: block;
        width: 50%;
        /* margin-left: 50px; */
        text-align: left;
        font-size: 0.9em;
        width: 100%;
        left: 15%;
        top: -1px;
        opacity: 0;
    }
    .toggleSwitch a {
        position: absolute;
        right: 50%;
        z-index: 4;
        display: block;
        height: 100%;
        padding: 0;
        left: 2px;
        width: 18px;
        background-color: #fff;
        border: 1px solid #CCC;
        border-radius: 100%;
        -webkit-transition: all 0.2s ease-out;
        -moz-transition: all 0.2s ease-out;
        transition: all 0.2s ease-out;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .toggleSwitch > span span:first-of-type {
        color: #ccc;
        opacity: 1;
        left: 45%;
    }
    .toggleSwitch > span:before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        /* left: 50px; */
        top: -2px;
        background-color: #fafafa;
        border: 1px solid #ccc;
        border-radius: 30px;
        -webkit-transition: all 0.2s ease-out;
        -moz-transition: all 0.2s ease-out;
        transition: all 0.2s ease-out;
    }
    .toggleSwitch input:checked ~ a {
        border-color: #fff;
        left: 100%;
        margin-left: -8px;
    }
    .toggleSwitch input:checked ~ span:before {
        border-color: #0097D1;
        box-shadow: inset 0 0 0 30px #0097D1;
    }
    .toggleSwitch input:checked ~ span span:first-of-type {
        opacity: 0;
    }
    .toggleSwitch input:checked ~ span span:last-of-type {
        opacity: 1;
        color: #fff;
    }
    /* Switch Sizes */
    .toggleSwitch.large {
        width: 60px;
        height: 27px;
    }
    .toggleSwitch.large a {
        width: 27px;
    }
    .toggleSwitch.large > span {
        height: 29px;
        line-height: 28px;
    }
    .toggleSwitch.large input:checked ~ a {
        left: 41px;
    }
    .toggleSwitch.large > span span {
        font-size: 1.1em;
    }
    .toggleSwitch.large > span span:first-of-type {
        left: 50%;
    }
    .toggleSwitch.xlarge {
        width: 80px;
        height: 36px;
    }
    .toggleSwitch.xlarge a {
        width: 36px;
    }
    .toggleSwitch.xlarge > span {
        height: 38px;
        line-height: 37px;
    }
    .toggleSwitch.xlarge input:checked ~ a {
        left: 52px;
    }
    .toggleSwitch.xlarge > span span {
        font-size: 1.4em;
    }
    .toggleSwitch.xlarge > span span:first-of-type {
        left: 50%;
    }
}
/*    End Toggle Switch    */

/* Scroll Bar */

/* Track */

/* width */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1; 
}
 
/* Handle */
::-webkit-scrollbar-thumb {
    background: #888; 
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: #555; 
}
/* End Scroll Bar */
</style>

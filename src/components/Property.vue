
<template>
    <div class="property">
        <div v-if="title">{{title}}</div>
        <div class="idcon" v-html="state.indenticon.get(modelValue)" :title="modelValue" @click="showValue(modelValue)"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from "vuex";
import { State } from '@/store';

export default defineComponent({
    name: "Property",
    emits: ['update:modelValue'],
    props:{
        modelValue: String,
        title: {
            type: String,
            requier: false
        },
    },
    setup(props) {

        const state = useStore().state as State;
        
        function showValue(value: string){
            let showVal: string;
            if(props.title) {
                showVal = `${props.title}: ${value}`;
            } else {
                showVal = value;
            }
            console.log(showVal);
            alert(showVal);
        }

        return {
            state, showValue
        };

    }
})
</script>

<style scoped>
.property{
    width: 65px;
    text-align: center;
}
</style>
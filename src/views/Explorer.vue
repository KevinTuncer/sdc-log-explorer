<template>
    <ActionBar />
    <Filter />
    <LogTable />
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import ActionBar from '../components/ActionBar.vue';
import LogTable from '../components/LogTable.vue';
import Filter from '../components/Filter.vue';
import { router } from '../router';
import { useStore } from 'vuex';

export default defineComponent({
    components: { ActionBar, LogTable, Filter },
    name: "Explorer",
    setup() {
        // Go to settings page if no endpoint is connected. For example on a page refresh
        const dataCon = useStore().state.dataConnection;
        if(!dataCon.endPoint){
            router.push('/');
        }
 
        return { };
    }
});
</script>

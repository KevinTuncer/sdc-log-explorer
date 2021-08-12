
<template>
    <div class="filter-input">
      <table>
        <tr>
          <td>{{description}}</td>
          <td>
            <input :list="uniqueId" 
            :value="modelValue" 
            @input="update($event.target.value.trim());" 
            :size="size"
            :placeholder="placeholder">
            <datalist :id="uniqueId">
              <option v-for="(key, index) in suggestions" :key="index" :name="key" :value="key"></option>
            </datalist>
          </td>
        </tr>
      </table>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
    name: "FilterInput",
    emits: ['update:modelValue'],
    props:{
        modelValue: {
            type: String,
            requier: true
        },
        description: {
            type: String,
            requier: true
        },
        placeholder: {
            type: String,
            default: ""
        },
        suggestions:{
            type: Array,
            requier: true
        }, 
        size:{
            type: String,
            default: ''
        }, 
        id:{
            type: String,
            default: ''
        }
    },
    setup(props, context) { 
        const uniqueId = ref(props.id);
        if(props.id == '')
        {
            uniqueId.value = `FilterInput${Math.random().toString().substring(2)}`;
        }

        function update(value) {
            context.emit('update:modelValue', value);        
        }

        return {
            update, uniqueId
        };
    }
})
</script>

<style scoped>
/* .filter-input {

} */
</style>

<template>
    <div class="accountinput">
      <span>{{description}}:</span>
      <span>
        <input 
        :value="modelValue" 
        @input="update($event.target.value.trim());" 
        :class="{ wrongInput: modelValue.length > 12 | valueError }" 
        :placeholder="placeholder">
      </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "AccountInput",
    emits: ['update:modelValue', 'update:valueError'],
    props:{
      modelValue: String,
      valueError: {
            type: Boolean,
            default: false
      },
      description: {
            type: String,
            requier: true
      },
      placeholder: {
            type: String,
            default: ""
      },
    },
    setup(props, context) { 
      
      function update(value)
      {
            //@input="$emit('update:modelValue', $event.target.value.trim());"
            context.emit('update:valueError', false);
            context.emit('update:modelValue', value);
      }

      return {update};

    }
})
</script>

<style scoped>
.accountinput {
    max-width: 700px;
    width: 100%;
    margin: 6px auto;
    /* display: flex; */
    justify-content: space-between;
    align-items: center;
    display: table-row;
    /* background-color: gainsboro; */
}

.accountinput > span{
    display: table-cell;
}

input{
    width: 95%;
    padding: 4px;
}
</style>

<template>
      <table class="datetimepicker">
        <tr>
          <td>
            <input type="time" :value="time" @input="updateTime($event.target.value);" step="0.001" />
          </td>
          <td>
            <input type="date" :value="date" @input="updateDate($event.target.value);" />
          </td>
        </tr>
      </table>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export function TimeDateToString(timeDate: Date): string{
    if(typeof timeDate == 'undefined' || timeDate.toString() == 'Invalid Date'){
        return;
    }
    return timeDate.toISOString().replace('Z', '').replaceAll('-', '.').replace('T', ' '); // Format: 2021-01-03T21:32:08.348Z
}

export default defineComponent({
    name: "DateTimePicker",
    emits: ['update:modelValue'],
    props:{
        default: {
            type: Object,
            requier: false
        },
    },
    setup(props, context) {
        let dateStr;
        let timeStr;
        if(props.default){
            let timeDate = props.default.toISOString(); // Format: 2021-01-03T21:32:08.348Z
            let sep = timeDate.indexOf('T');
            dateStr = timeDate.substring(0, sep);
            timeStr = timeDate.substring(sep + 1, timeDate.indexOf('Z'));
        }
        else {
            dateStr = "";
            timeStr = "";
        }

        const time = ref(dateStr);
        const date = ref(timeStr);

        function getTimeDate(): Date{
            return new Date(date.value + 'T' + time.value + 'Z');
        }

        function updateTime(value) {
            time.value = value;
            context.emit('update:modelValue', getTimeDate());
        }

        function updateDate(value) {
            date.value = value;
            context.emit('update:modelValue', getTimeDate());
        }

        return {
            updateTime, updateDate, time, date,
        };

    }
})
</script>

<style scoped>
/* .datetimepicker {

} */
</style>
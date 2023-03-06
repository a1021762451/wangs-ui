<template>
  <div>
    <ws-buttons :buttonConfigList="buttonConfigList" @happenEvent="happenEvent">
      <template #download>
        <el-button
          type="primary"
          size="default"
          @click="happenEvent({ slotName: 'download' })"
          >下载</el-button
        >
      </template>
    </ws-buttons>
  </div>
</template>

<script>
import { buttonConfigList, happenEvent } from '../contant'
import wsButtons from '@/componentes/ws-buttons'
export default {
  name: 'ws-buttons-test',
  components: { wsButtons },
  data() {
    return {
      buttonConfigList
    }
  },
  methods: {
    happenEvent
  }
}
</script>

<style lang="less" scoped></style>

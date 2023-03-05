<template>
  <div>
    <renderButtons :buttonConfigList="buttonConfigList" @happenEvent="happenEvent">
      <template #download>
        <el-button type="primary" size="default" @click="happenEvent({slotName: 'download'})">下载</el-button>
      </template>
    </renderButtons>
  </div>
</template>

<script>
import { buttonConfigList, happenEvent } from '../contant'
import renderButtons from '@/componentes/renderButtons'
export default {
  name: 'renderButtons-test',
  components: { renderButtons },
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

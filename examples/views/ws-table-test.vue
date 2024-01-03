<template>
  <ws-table
    ref="wsTable"
    showSearch
    style="height: 100%"
    placeholder="-"
    :loading="loading"
    utilsList="download,showSingle"
    :data="tableData"
    :tableColumns="tableColumns"
    :allOptions="allOptions"
    :pageInfo.sync="pageInfo"
    :formData.sync="formData"
    :operationConfig="{
      buttonConfigList: formButtons,
    }"
    :seachConfig="{
      formConfigList,
      buttonConfigList: formButtons,
      allOptions,
    }"
    :switchConfig="{
      switchMode: 'rowControl, dblclick',
    }"
    @happenEvent="happenEvent"
    @selection-change="selectionChange"
  >
    <!-- 指向table组件的插槽 -->
    <template v-slot:expand="{ row }">
      <div>
        {{ JSON.stringify(row) }}
      </div>
    </template>
    <template v-slot:testTableSlot_header="{ column }">
      {{ column.label + '--表头插槽' }}
    </template>
    <template v-slot:testTableSlot="{ row, column }">
      {{ row[column.property] + '--内容插槽' }}
    </template>
    <!-- 指向ws-form组件的插槽 -->
    <template #testSlot="{ fieldItem, formData }">
      <el-input
        clearable
        v-model="formData[fieldItem.prop]"
        :placeholder="fieldItem.disabled ? '' : '请输入内容'"
        :disabled="fieldItem.disabled"
      ></el-input>
    </template>
    <!-- 指向ws-buttons组件的插槽 -->
    <template #download="scope">
      <el-button type="primary" size="small" @click="happenEvent(scope)"
        >下载</el-button
      >
    </template>
    <!-- <template v-slot:append> append </template> -->
  </ws-table>
</template>

<script>
import {
  formButtons,
  formConfigList,
  allOptions,
  tableColumns,
} from '../contant'
export default {
  name: 'ws-table-test',
  data() {
    return {
      formButtons,
      formConfigList,
      allOptions,
      tableColumns,
      selection: [],
      tableData: [
        {
          id: '1',
          testTableSlot: '一号机组',
          testInput: '1',
          testAdjust: '宽度宽度宽度',
          testCheckbox: '0',
          testSelect: '2',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容',
          testHeader1: '爷',
          testNormal: 18,
          testRich: '<div style="color: red;">富文本<br>换行</div>',
          children: [
            {
              id: '1-2',
              testTableSlot: '一号机组 - 2',
              testInput: '2 -2',
              testAdjust: '宽度宽度宽度 -2',
              testSelect: '',
              testMinDatetime: '',
              testMaxDatetime: '',
              testTime: '',
              testFormatter: '内容 -2',
              testHeader21: '北京 -2',
              testHeader22: '程序员 -2',
              testHeader1: '父',
              children: [
                {
                  id: '1-2-1',
                  testHeader1: '孙',
                  testTableSlot: '一号机组 - 1',
                  testInput: '1-1',
                  testAdjust: '宽度宽度宽度 -1',
                  testSelect: '',
                  testMinDatetime: '',
                  testMaxDatetime: '',
                  testTime: '',
                  testFormatter: '内容-1',
                  testHeader21: '北京-1',
                  testHeader22: '程序员-1',
                },
                {
                  id: '1-2-2',
                  testHeader1: '孙',
                  testTableSlot: '一号机组 - 2',
                  testInput: '2 -2',
                  testAdjust: '宽度宽度宽度 -2',
                  testSelect: '',
                  testMinDatetime: '',
                  testMaxDatetime: '',
                  testTime: '',
                  testFormatter: '内容 -2',
                  testHeader21: '北京 -2',
                  testHeader22: '程序员 -2',
                },
              ],
            },
          ],
        },
        {
          id: '2',
          testTableSlot: '二号机组',
          testInput: '2',
          testAdjust: '宽度宽度宽度',
          testSelect: '1',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容',
          testHeader21: '北京',
          testHeader22: '程序员',
          testNormal: 28,
        },
        {
          id: '3',
          testTableSlot: '二号机组',
          testInput: '2',
          testAdjust: '宽度宽度宽度',
          testSelect: '2',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容',
          testNormal: 38,
        },
      ],
      loading: false,
      formData: { testSelect: '1', testInput: '4' },
      pageInfo: {
        size: 10,
        current: 1,
        total: 0,
      },
    }
  },
  mounted() {
    // this.getInitParams()
    setTimeout(() => {
      this.tableData.push({
        id: '4',
        testTableSlot: '四号机组',
        testInput: '3',
        testAdjust: '宽度宽度宽度宽度宽度宽度',
        testSelect: '',
        testMinDatetime: '',
        testMaxDatetime: '',
        testTime: '',
        testFormatter: '内容',
        testNormal: 48,
      })
    }, '1000')
  },
  methods: {
    // 更新表单数据
    // updateFormData({ formData }) {
    //   console.log('updateFormData')
    //   this.formData = formData
    // },
    // 获取初始化的参数
    getInitParams() {
      const wsForm = this.$refs.wsForm
      const wsTable = this.$refs.wsTable
      const formData = wsForm.formData
      const pageInfo = wsTable.pageInfo
      this.formData = formData
      this.pageInfo = pageInfo
    },
    // 触发事件
    happenEvent(eventData) {
      const {
        buttonItem: { method },
      } = eventData
      console.log('method', method)
      this[method] && this[method](eventData)
    },
    // 单行校验
    validateRow(eventData) {
      console.log(eventData, 'validateRow')
      const { row } = eventData
      this.$refs.wsTable.validateRow(row)
    },
    //全部校验
    validateAll(eventData) {
      console.log(eventData, 'validateAll')
      this.$refs.wsTable.validateAll()
    },
    export(eventData) {
      // console.log('export');
      const { buttonItem } = eventData
      buttonItem.loading = true

      // findItem.loading = true
      // this.$set(buttonItem, 'loading', true)
    },
    // 勾选操作
    selectionChange(selection) {
      console.log('selectionChange', selection)
      this.selection = selection
    },
    edit({ row }) {
      this.$refs.wsTable.switchStatus(row, true)
    },
    notEdit({ row }) {
      this.$refs.wsTable.switchStatus(row, false)
    },
  },
}
</script>

<style lang="less" scoped></style>

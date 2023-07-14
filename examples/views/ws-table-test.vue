<template>
  <div>
    <ws-table
      style="height: 700px"
      :loading="loading"
      :data="tableData"
      :tableColumns="tableColumns"
      :allOptions="allOptions"
      :utilsList="['setColumms', 'download']"
      :header-cell-style="{ background: '#f3f3f3' }"
      :pageInfo.sync="pageInfo"
      placeholder="-"
      stripe
      @happenEvent="happenEvent"
      @selection-change="selectionChange"
      ref="wsTable"
      row-key="id"
      :searchData.sync="formData"
      :seachConfig="{
        formConfigList,
        formButtons,
        allOptions,
      }"
    >
      <!-- 指向table组件的插槽 -->
      <template v-slot:expand="{ row }">
        <div>
          {{ JSON.stringify(row) }}
        </div>
      </template>
      <template v-slot:plantName_header="{ column }">
        {{ column.label + '--插槽' }}
      </template>
      <template v-slot:plantName="{ row, fieldItem }">
        {{ row.plantName + '--插槽' + fieldItem.prop }}
      </template>
      <!-- 指向ws-form组件的插槽 -->
      <template #lightOut="{ fieldItem, formData }">
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
    </ws-table>
  </div>
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
          plantName: '一号机组',
          testInput: '1',
          widthAdjust: '宽度宽度宽度',
          testCheckBox: '0',
          testSelect: '苹果',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容',
          name: '爷',
          age: 18,
          id: '1',
          children: [
            {
              plantName: '一号机组 - 2',
              testInput: '2 -2',
              widthAdjust: '宽度宽度宽度 -2',
              testSelect: '',
              testMinDatetime: '',
              testMaxDatetime: '',
              testTime: '',
              testFormatter: '内容 -2',
              adress: '北京 -2',
              work: '程序员 -2',
              id: '1-2',
              name: '父',
              children: [
                {
                  name: '孙',
                  plantName: '一号机组 - 1',
                  testInput: '1-1',
                  widthAdjust: '宽度宽度宽度 -1',
                  testSelect: '',
                  testMinDatetime: '',
                  testMaxDatetime: '',
                  testTime: '',
                  testFormatter: '内容-1',
                  adress: '北京-1',
                  work: '程序员-1',
                  id: '1-2-1',
                },
                {
                  name: '孙',
                  plantName: '一号机组 - 2',
                  testInput: '2 -2',
                  widthAdjust: '宽度宽度宽度 -2',
                  testSelect: '',
                  testMinDatetime: '',
                  testMaxDatetime: '',
                  testTime: '',
                  testFormatter: '内容 -2',
                  adress: '北京 -2',
                  work: '程序员 -2',
                  id: '1-2-2',
                },
              ],
            },
          ],
        },
        {
          plantName: '二号机组',
          testInput: '2',
          widthAdjust: '宽度宽度宽度',
          testSelect: '香蕉',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容',
          adress: '北京',
          work: '程序员',
          id: '2',
          age: 28,
        },
        {
          plantName: '二号机组',
          testInput: '2',
          widthAdjust: '宽度宽度宽度',
          testSelect: '香蕉',
          testMinDatetime: '',
          testMaxDatetime: '',
          testTime: '',
          testFormatter: '内容',
          id: '3',
          age: 38,
        },
      ],
      loading: false,
      formData: { applyComId: '南昌', equipName: '4号' },
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
        plantName: '四号机组',
        testInput: '3',
        widthAdjust: '宽度宽度宽度宽度宽度宽度',
        testSelect: '',
        testMinDatetime: '',
        testMaxDatetime: '',
        testTime: '',
        testFormatter: '内容',
        id: '4',
        age: 48,
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
  },
}
</script>

<style lang="less" scoped></style>

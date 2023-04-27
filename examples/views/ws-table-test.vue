<template>
  <div>
    <ws-form
      :formConfigList="formConfigList"
      :formButtons="formButtons"
      :allOptions="allOptions"
      :defaultForm="defaultForm"
      :formData.sync="formData"
      buttonSize="small"
      isSearchList
      @happenEvent="happenEvent"
      style="margin-bottom: 10px"
      ref="wsForm"
    >
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
    </ws-form>
    <ws-table
      style="height: 450px"
      :loading="loading"
      :tableData="tableData"
      :tableColumns="tableColumns"
      :allOptions="allOptions"
      :utilsList="['setColumms', 'download']"
      :header-cell-style="{ background: '#f3f3f3' }"
      :pageInfo.sync="pageInfo"
      @happenEvent="happenEvent"
      @selection-change="selectionChange"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      ref="wsTable"
      row-key="id"
    >
      <template v-slot:expand="{ row }">
        <div>
          {{ JSON.stringify(row) }}
        </div>
      </template>
      <template v-slot:plantName_header="{ column }">
        <div>
          {{ column.label + '--插槽' }}
        </div>
      </template>
      <template v-slot:plantName="{ row, fieldItem }">
        <div>
          {{ row.plantName + '--插槽' + fieldItem.prop }}
        </div>
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
      defaultForm: { applyComId: '南昌', equipName: '4号' },
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
          name: '王',
          age: 18,
          id: '1',
          // children: [
          //   {
          //     plantName: '二号机组',
          //     testInput: '2',
          //     widthAdjust: '宽度宽度宽度',
          //     testSelect: '香蕉',
          //     testMinDatetime: '',
          //     testMaxDatetime: '',
          //     testTime: '',
          //     testFormatter: '内容',
          //     adress: '北京',
          //     work: '程序员',
          //     id: '1-1',
          //   },
          //   {
          //     plantName: '二号机组',
          //     testInput: '2',
          //     widthAdjust: '宽度宽度宽度',
          //     testSelect: '香蕉',
          //     testMinDatetime: '',
          //     testMaxDatetime: '',
          //     testTime: '',
          //     testFormatter: '内容',
          //     adress: '北京',
          //     work: '程序员',
          //     id: '1-2',
          //   },
          // ],
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
          id: '2',
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
        id: '3',
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
      console.log('method', method);
      this[method] && this[method](eventData)
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
      this.selection = selection
    },
  },
}
</script>

<style lang="less" scoped></style>

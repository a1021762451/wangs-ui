<template>
  <el-form
    :model="form"
    ref="form"
    :inline="false"
    :rules="rules"
    size="normal"
  >
    <el-form-item label="测试ws-select" prop="testvalue">
      <!-- :defaultOptions="defaultOptions" -->
      <ws-select
        :request="request"
        v-model="form.testvalue"
        :requestHandler="requestHandler"
      >
      </ws-select>
    </el-form-item>
  </el-form>
</template>

<script>
import request from '../request.js'
export default {
  name: 'ws-select-test',
  data() {
    return {
      request,
      // testvalue: 'Arkansas_value',
      form: { testvalue: '' },
      rules: {
        testvalue: [
          {
            required: true,
            message: `请输入测试ws-select`,
            trigger: 'change',
          },
        ],
      },
      defaultOptions: [
        {label: '默认1',value: '1'},
        {label: '默认2',value: '2'},
        {label: '默认3',value: '3'}
      ]
    }
  },
  methods: {
    async requestHandler(url, query, labelField, valueField) {
      console.log('requestHandler')
      let arr = []
      const res = await this.request(query)
      const data = res.data
      arr = data.map((item) => {
        return {
          label: item[labelField],
          value: item[valueField],
        }
      })
      return arr
    },
  },
}
</script>

<style lang="scss" scoped></style>

<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-17 08:59:05
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-03-22 16:43:54
-->
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
        prop="testvalue"
        :request="request"
        v-model="form.testvalue"
        @queryChange="queryChange"
        :requestConfig="requestConfig"
        isActualTime
      >
      </ws-select>
    </el-form-item>
    <el-form-item label="地点" prop="city">
      <el-input v-model="form.city" clearable></el-input>
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
      form: { testvalue: '', city: '南昌' },
      rules: {
        testvalue: [
          {
            required: true,
            message: `请输入测试ws-select`,
            trigger: 'change',
          },
        ],
        city: [
          {
            required: true,
            message: `请输入地点`,
            trigger: 'blur',
          },
        ],
      },
      defaultOptions: [
        { label: '默认1', value: '1' },
        { label: '默认2', value: '2' },
        { label: '默认3', value: '3' },
      ],
      requestConfig: {
        method: 'get',
        params: {
          test: '1',
        },
      },
    }
  },
  methods: {
    queryChange(query) {
      this.$set(this.requestConfig.params, 'query', query)
    },
    async requestHandler(requestConfig, query, labelField, valueField) {
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

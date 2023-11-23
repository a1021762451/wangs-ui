<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-17 08:59:05
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-11-23 09:40:38
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
      <ws-select
        prop="testvalue"
        selectMode="treeSelect"
        v-model="form.testvalue"
        :options="defaultOptions"
        multiple
        :treeConfig="{
          data: treeData,
          dataIsFlat: false,
        }"
        clearable
      >
      </ws-select>
    </el-form-item>
  </el-form>
</template>

<script>
import request from '../request.js'
import { getSelectData } from '../mock/api.js'
export default {
  name: 'ws-select-test',
  data() {
    return {
      request,
      // testvalue: 'Arkansas_value',
      form: { testvalue: [9], city: '南昌' },
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
      treeData: [
        {
          label: '根节点',
          id: '根节点',
          children: [
            {
              id: 1,
              label: '我恨你 1',
              children: [
                {
                  id: 4,
                  label: '二级 1-1',
                  children: [
                    {
                      id: 9,
                      label: '三级 1-1-1',
                    },
                    {
                      id: 10,
                      label: '三级 1-1-2',
                    },
                  ],
                },
              ],
            },
            {
              id: 2,
              label: '像快 2',
              children: [
                {
                  id: 5,
                  label: '二级 2-1',
                },
                {
                  id: 6,
                  label: '二级 2-2',
                  nameFirstSpell: 'e', //  测试首拼过滤
                  disabled: true, // 测试禁止点击
                },
              ],
            },
            {
              id: 3,
              label: '木头 3',
              children: [
                {
                  id: 7,
                  label: '二级 3-1',
                },
                {
                  id: 8,
                  label: '二级 3-2',
                  children: [
                    {
                      id: 11,
                      label: '三级 3-2-1',
                    },
                    {
                      id: 12,
                      label: '三级 3-2-2三级 3-2-2',
                    },
                    {
                      id: 13,
                      label: '三级 3-2-3',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
  },
  created() {
    this.getSelectData()
  },
  methods: {
    async getSelectData() {
      const res = await getSelectData()
      console.log(res, 'getSelectData')
      this.defaultOptions = res.list
    },
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

<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-17 08:59:05
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-11-23 21:28:58
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
        <!-- <template v-slot="{ label }">{{ label }} default </template> -->
        <template v-slot:prefix>
          <i class="el-icon-s-data"></i>
        </template>
        <template v-slot:empty> 空的 </template>
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
      defaultOptions: [],
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
  },
}
</script>

<style lang="scss" scoped></style>

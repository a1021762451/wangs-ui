<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-03-17 08:59:05
 * @LastEditors: wang shuai
 * @LastEditTime: 2025-04-18 17:38:38
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
        isTreeSelect
        v-model="form.testvalue"
        :options="defaultOptions"
        multiple
        :treeConfig="{
          data: flatTreeData,
          dataIsFlat: true,
          nodeKey: 'nodekey',
          props: {
            id: 'id',
          },
        }"
        clearable
      >
        <!-- <template v-slot="{ data }">{{ data.label }} default </template> -->
        <template v-slot:prefix>
          <i class="el-icon-s-data"></i>
        </template>
        <template v-slot:empty> 空的 </template>
      </ws-select>
    </el-form-item>
  </el-form>
</template>

<script>
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
          nodekey: '0',
          children: [
            {
              nodekey: '1',
              id: 1,
              label: '我恨你 1',
              children: [
                {
                  nodekey: '2',
                  id: 4,
                  label: '二级 1-1',
                  children: [
                    {
                      nodekey: '3',
                      id: 9,
                      label: '三级 1-1-1',
                    },
                    {
                      nodekey: '4',
                      id: 10,
                      label: '三级 1-1-2',
                    },
                  ],
                },
              ],
            },
            {
              nodekey: '5',
              id: 2,
              label: '像快 2',
              children: [
                {
                  nodekey: '6',
                  id: 5,
                  label: '二级 2-1',
                },
                {
                  nodekey: '7',
                  id: 6,
                  label: '二级 2-2',
                  nameFirstSpell: 'e', //  测试首拼过滤
                  disabled: true, // 测试禁止点击
                },
                {
                  nodekey: '8',
                  id: 10,
                  label: '三级 1-1-2',
                },
              ],
            },
            {
              nodekey: '9',
              id: 3,
              label: '木头 3',
              children: [
                {
                  nodekey: '10',
                  id: 7,
                  label: '二级 3-1',
                },
                {
                  nodekey: '11',
                  id: 8,
                  label: '二级 3-2',
                  children: [
                    {
                      nodekey: '12',
                      id: 11,
                      label: '三级 3-2-1',
                    },
                    {
                      nodekey: '13',
                      id: 12,
                      label: '三级 3-2-2三级 3-2-2',
                    },
                    {
                      nodekey: '14',
                      id: 13,
                      label: '三级 3-2-3',
                    },
                    {
                      nodekey: '15',
                      id: 5,
                      label: '二级 2-1',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      flatTreeData: [
        {
          label: '根节点',
          id: '根节点',
          nodekey: '0',
          pid: null,
        },
        {
          nodekey: '1',
          id: 1,
          label: '我恨你 1',
          pid: '根节点',
        },
        {
          nodekey: '2',
          id: 4,
          label: '二级 1-1',
          pid: 1,
        },
        { nodekey: '3', id: 9, label: '三级 1-1-1', pid: 4 },
        { nodekey: '4', id: 10, label: '三级 1-1-2', pid: 4 },
        {
          nodekey: '5',
          id: 2,
          label: '像快 2',
          pid: '根节点',
        },
        { nodekey: '6', id: 5, label: '二级 2-1', pid: 2 },
        {
          nodekey: '7',
          id: 6,
          label: '二级 2-2',
          nameFirstSpell: 'e',
          disabled: true,
          pid: 2,
        },
        { nodekey: '8', id: 10, label: '三级 1-1-2', pid: 2 },
        {
          nodekey: '9',
          id: 3,
          label: '木头 3',
          pid: '根节点',
        },
        { nodekey: '10', id: 7, label: '二级 3-1', pid: 3 },
        {
          nodekey: '11',
          id: 8,
          label: '二级 3-2',
          pid: 3,
        },
        { nodekey: '12', id: 11, label: '三级 3-2-1', pid: 8 },
        { nodekey: '13', id: 12, label: '三级 3-2-2三级 3-2-2', pid: 8 },
        { nodekey: '14', id: 13, label: '三级 3-2-3', pid: 8 },
        { nodekey: '15', id: 5, label: '二级 2-1', pid: 8 },
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

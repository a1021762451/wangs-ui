<!--
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-06-01 13:35:59
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-10-10 16:37:40
-->
<template>
  <!-- :filterButtonsFn="filterButtonsFn"
  :disabledFn="disabledFn" -->
  <ws-tree
    showCheckbox
    draggable
    excludeFirstSearch
    changeMode="contextMenu"
    style="height: 300px; width: 240px"
    textEllipsis
    default-expand-all
    showHeader
    :dataIsFlat="false"
    :data="treeData"
    current-node-key="9"
    :default-checked-keys="['9', '10']"
    :disabledContextmenuFn="disabledContextmenuFn"
    @check-change="handleCheckChange"
    @node-click="handleNodeClick"
    @check="handleCheck"
    @happenEvent="happenEvent"
  >
    <template v-slot="{ data }">
      <i class="el-icon-s-tools" style="font-size: 10px"></i>
      <span>{{ data.label + '插槽' }}</span>
    </template>
  </ws-tree>
</template>

<script>
export default {
  name: 'ws-tree-test',
  data() {
    return {
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
  methods: {
    filterButtonsFn(buttons, data, node) {
      if (node.isLeaf) return buttons
      return []
    },
    disabledFn(data, node) {
      if (!node.isLeaf) return true
      return false
    },
    // 判断右键禁用
    disabledContextmenuFn(data, node) {
      if (!node.isLeaf) return true
      return false
    },
    // 触发事件
    happenEvent(eventData) {
      const {
        buttonItem: { method },
      } = eventData
      console.log('method', method)
      this[method] && this[method](eventData)
    },
    freeAdd() {
      console.log('freeAdd')
    },
    nodeAdd(params) {
      console.log('nodeAdd', params)
    },
    nodeEdit(params) {
      console.log('nodeEdit', params)
    },
    nodeDelete(params) {
      console.log('nodeDelete', params)
    },
    handleCheckChange(data, isChecked, isSubCheckeds) {
      console.log('handleCheckChange', data, isChecked, isSubCheckeds)
    },
    handleNodeClick(data, node, el) {
      console.log('handleNodeClick', data, node, el)
    },
    handleCheck(
      data,
      { checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKey }
    ) {
      console.log('handleCheck', data, checkedNodes, checkedKeys)
    },
  },
}
</script>

<style lang="less" scoped>
/* 点击树结构项的选中颜色 */
.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: #b0c4de;
}
</style>

<template>
  <ws-tree
    showCheckBox
    draggable
    excludeFirstSearch
    changeMode="contextMenu"
    style="height: 300px; width: 200px"
    @nodeAdd="nodeAdd"
    @nodeDelete="nodeDelete"
    @nodeEdit="nodeEdit"
    @freeAdd="freeAdd"
    @check-change="handleCheckChange"
    @node-click="handleNodeClick"
    :treeData="treeData"
  ></ws-tree>
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
                      label: '三级 1-1-1'
                    },
                    {
                      id: 10,
                      label: '三级 1-1-2'
                    }
                  ]
                }
              ]
            },
            {
              id: 2,
              label: '像快 2',
              children: [
                {
                  id: 5,
                  label: '二级 2-1'
                },
                {
                  id: 6,
                  label: '二级 2-2',
                  nameFirstSpell: 'e', //  测试首拼过滤
                  disabled: true // 测试禁止点击
                }
              ]
            },
            {
              id: 3,
              label: '木头 3',
              children: [
                {
                  id: 7,
                  label: '二级 3-1'
                },
                {
                  id: 8,
                  label: '二级 3-2',
                  children: [
                    {
                      id: 11,
                      label: '三级 3-2-1'
                    },
                    {
                      id: 12,
                      label: '三级 3-2-2'
                    },
                    {
                      id: 13,
                      label: '三级 3-2-3'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  methods: {
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
    }
  }
}
</script>

<style lang="less" scoped></style>

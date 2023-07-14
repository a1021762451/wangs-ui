export default {
  methods: {
    clearSelection() {
      this.selection = []
      return this.$refs.table.clearSelection(...arguments)
    },
    toggleRowSelection() {
      return this.$refs.table.toggleRowSelection(...arguments)
    },
    toggleAllSelection() {
      return this.$refs.table.toggleAllSelection(...arguments)
    },
    toggleRowExpansion() {
      return this.$refs.table.toggleRowExpansion(...arguments)
    },
    setCurrentRow() {
      return this.$refs.table.setCurrentRow(...arguments)
    },
    clearSort() {
      return this.$refs.table.clearSort(...arguments)
    },
    clearFilter() {
      return this.$refs.table.clearFilter(...arguments)
    },
    doLayout() {
      return this.$refs.table.doLayout(...arguments)
    },
    sort() {
      return this.$refs.table.sort(...arguments)
    },
    // 获取选中行
    getSelection() {
      return this.selection
    },
    // 设置部分选择行  全选和清空可以使用toggleAllSelection和clearSelection
    setSelection(selection, flag = true) {
      if (!Array.isArray(selection) || !selection.length) return
      const isIds = typeof selection[0] === 'string'
      selection = isIds ? this.getRowsByRowKeys(selection) : selection
      let handleSelection = []
      if (flag) {
        handleSelection = Array.from(new Set(this.selection.concat(selection)))
      } else {
        handleSelection = this.selection.filter(
          (row) => !selection.includes(row)
        )
      }
      selection.forEach((row) => {
        this.select(handleSelection, row)
      })
    },
    // 根据多个rowKey获取多行数据
    getRowsByRowKeys(rowKeys) {
      const rows = []
      rowKeys.forEach((rowKeyValue) => {
        const row = this.getRowByRowKey(rowKeyValue)
        row && rows.push(row)
      })
      return rows
    },
    // 根据rowKey获取行数据
    getRowByRowKey(rowKeyValue) {
      const rowKey = this.rowKey
      function iterateFn(dataList, rowKeyValue) {
        for (let i = 0; i < dataList.length; i++) {
          if (dataList[i][rowKey] === rowKeyValue) {
            return dataList[i]
          }
          if (dataList[i].children) {
            const row = iterateFn(dataList[i].children, rowKeyValue)
            if (row) return row
          }
        }
      }
      return iterateFn(this.tableData, rowKeyValue)
    },
  },
}

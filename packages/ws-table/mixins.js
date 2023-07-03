export default {
  methods: {
    clearSelection() {
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
  },
}

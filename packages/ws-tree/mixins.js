export default {
  methods: {
    filter() {
      return this.$refs.tree.filter(...arguments)
    },
    updateKeyChildren() {
      return this.$refs.tree.updateKeyChildren(...arguments)
    },
    getCheckedNodes() {
      return this.$refs.tree.getCheckedNodes(...arguments)
    },
    setCheckedNodes() {
      return this.$refs.tree.setCheckedNodes(...arguments)
    },
    getCheckedKeys() {
      return this.$refs.tree.getCheckedKeys(...arguments)
    },
    setCheckedKeys() {
      return this.$refs.tree.setCheckedKeys(...arguments)
    },
    setChecked() {
      return this.$refs.tree.setChecked(...arguments)
    },
    getHalfCheckedNodes() {
      return this.$refs.tree.getHalfCheckedNodes(...arguments)
    },
    getHalfCheckedKeys() {
      return this.$refs.tree.getHalfCheckedKeys(...arguments)
    },
    getCurrentKey() {
      return this.$refs.tree.getCurrentKey(...arguments)
    },
    getCurrentNode() {
      return this.$refs.tree.getCurrentNode(...arguments)
    },
    setCurrentKey() {
      return this.$refs.tree.setCurrentKey(...arguments)
    },
    setCurrentNode() {
      return this.$refs.tree.setCurrentNode(...arguments)
    },
    getNode() {
      return this.$refs.tree.getNode(...arguments)
    },
    remove() {
      return this.$refs.tree.remove(...arguments)
    },
    append() {
      return this.$refs.tree.append(...arguments)
    },
    insertBefore() {
      return this.$refs.tree.insertBefore(...arguments)
    },
    insertAfter() {
      return this.$refs.tree.insertAfter(...arguments)
    },
  },
}

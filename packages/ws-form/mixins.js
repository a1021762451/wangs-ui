/*
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-09-20 16:30:48
 * @LastEditors: wang shuai
 * @LastEditTime: 2023-09-20 16:35:26
 */
export default {
  methods: {
    validate() {
      this.selection = []
      return this.$refs.form.validate(...arguments)
    },
    validateField() {
      return this.$refs.form.validateField(...arguments)
    },
    resetFields() {
      return this.$refs.form.resetFields(...arguments)
    },
    clearValidate() {
      return this.$refs.form.clearValidate(...arguments)
    },
  },
}

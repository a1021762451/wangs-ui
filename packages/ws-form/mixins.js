/*
 * @Description: 
 * @Author: wang shuai
 * @Date: 2023-09-20 16:30:48
 * @LastEditors: wang shuai
 * @LastEditTime: 2024-03-15 17:14:53
 */
export default {
  methods: {
    validate() {
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

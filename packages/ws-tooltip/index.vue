<script>
import { Tooltip } from 'element-ui'

export default {
  name: 'ws-tooltip',
  extends: Tooltip, // 组件继承
  props: {
    ...Tooltip.props,
    content: {
      type: String | Number,
      default: ''
    },
    overflow: {
      type: Boolean,
      default: true
    } // 新增props属性
  },
  methods: {
    // 重写show方法
    show() {
      // 执行文字溢出判断逻辑
      if (this.overflow) {
        if (this.$el.scrollWidth <= this.$el.clientWidth) return
      }
      // 自动获取content
      if (!this.content) {
        this.content = this.$el.innerText
      }
      Tooltip.methods.show.call(this) //执行原版的逻辑，绑定当前实例的this
    }
  }
}
</script>

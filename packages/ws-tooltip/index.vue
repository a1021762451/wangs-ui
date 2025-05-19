<script>
import { Tooltip } from 'element-ui'

export default {
  name: 'ws-tooltip',
  extends: Tooltip, // 组件继承
  props: {
    ...Tooltip.props,
    // 重写content，支持传入字符串或数字
    content: {
      type: String | Number,
      default: '',
    },
    // 文字溢出才显示
    overflow: {
      type: Boolean,
      default: true,
    },
    // 不用填content ，自动获取innerText
    showInnerText: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    // 重写show方法
    show() {
      // 执行文字溢出判断逻辑
      if (this.overflow) {
        if (this.$el.scrollWidth <= this.$el.clientWidth) return
      }
      // 自动获取content(非必要不用)
      if (!this.content) {
        if (this.showInnerText) this.content = this.$el.innerText
        else return
      }
      Tooltip.methods.show.call(this) //执行原版的逻辑，绑定当前实例的this
    },
  },
}
</script>

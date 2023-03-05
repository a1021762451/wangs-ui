<template>
  <div>
    <el-table
      :header-cell-style="{ background: '#f3f3f3' }"
      :data="tableData"
      border
      tooltip-effect="dark"
      style="width: 100%"
      height="calc(100% - 35px)"
      @selection-change="(selection) => $emit('selection-change', selection)"
      v-loading="loading"
      v-bind="$attrs"
    >
      <template v-for="(item, index) in tableColumns">
        <el-table-column
          v-if="item.type"
          :type="item.type"
          width="55"
          :key="item.type"
        >
        </el-table-column>
        <el-table-column
          align="center"
          :prop="item.field"
          :label="item.label"
          show-overflow-tooltip
          :key="item.label"
          v-else
        >
          <template v-slot="scope">
            <template v-if="item.slotName">
              <slot :name="item.slotName">
                {{ scope.row[item.field] }}
              </slot>
            </template>
            <template v-else>{{ scope.row[item.field] }}</template>
          </template>
        </el-table-column>
      </template>
      <el-table-column
        align="center"
        label="操作"
        key="operation"
        :width="tableButtons.length * 70"
        v-if="tableButtons.length"
      >
        <template slot-scope="scope">
          <!-- <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
            <el-button type="text" size="small">编辑</el-button> -->
          <el-link
            type="primary"
            class="button-item"
            size="small"
            v-for="buttonItem in filterButtons(scope.row, tableButtons)"
            :key="buttonItem.name"
            :underline="false"
            @click="$emit('happenEvent', buttonItem)"
            >{{ buttonItem.name }}</el-link
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="showPagination"
      class="common-table-pagination"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pageInfo.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size.sync="pageInfo.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageInfo.total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  name: 'renderTable',
  props: {
    // 必传
    // 表格列和按钮
    tableConfig: {
      default() {
        return {
          tableColumns: [],
          tableButtons: []
        }
      },
      type: Object
    },
    // 表格数据
    tableData: {
      default() {
        return []
      },
      type: Array
    },
    // 非必传
    // 过滤表格操作按钮
    filterButtons: {
      default(row, tableButtons) {
        return tableButtons
      },
      type: Function
    },
    // 默认分页配置
    defaultPageInfo: {
      default() {
        return {
          size: 10,
          current: 1,
          total: 0
        }
      },
      type: Object
    },
    // 展示分页组件
    showPagination: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      pageInfo: this.defaultPageInfo
    }
  },
  computed: {
    tableButtons() {
      return this.tableConfig.tableButtons
    },
    tableColumns() {
      return this.tableConfig.tableColumns
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pageInfo.current = 1
      this.handleSearch()
    },
    handleSearch() {
      this.$emit('handleSearch')
    }
  }
}
</script>

<style lang="less" scoped>
.common-table-pagination {
  text-align: right;
  margin: 10px 0;
}
</style>

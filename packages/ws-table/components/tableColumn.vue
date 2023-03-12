<template>
  <el-table-column :label="fieldItem.label" v-if="fieldItem.childrens">
    <tableColumn
      v-for="(column, index) in fieldItem.childrens"
      :key="index"
      :fieldItem="column"
      :rules="rules"
      :globalMinDate="globalMinDate"
      :globalMaxDate="globalMaxDate"
      @happenEvent="(params) => $emit('happenEvent', params)"
    >
    </tableColumn>
  </el-table-column>
  <el-table-column
    v-else
    align="center"
    :prop="fieldItem.field"
    :label="fieldItem.label"
    :width="fieldItem.width"
    :fixed="fieldItem.fixed"
    :show-overflow-tooltip="fieldItem.showTooltip"
  >
    <template v-slot:header="scope">
      <slot
        :name="fieldItem.headerSlotName"
        v-bind="{ ...scope, fieldItem }"
        v-if="fieldItem.headerSlotName"
      >
        {{ fieldItem.label }}
      </slot>
      <template v-else>
        {{ fieldItem.label }}
        <i style="color: #f56c6c" v-if="fieldItem.required">*</i>
      </template>
    </template>
    <template v-slot="{ row, column, $index }">
      <component
        :is="fieldItem.required ? 'el-form-item' : 'div'"
        :prop="`tableData.${$index}.${fieldItem.field}`"
        :rules="getRules(fieldItem, row)"
      >
        <template v-if="fieldItem.slotName">
          <slot
            :name="fieldItem.slotName"
            v-bind="{ row, column, $index, fieldItem }"
          >
            {{ row[fieldItem.field] }}
          </slot>
        </template>
        <!-- 输入框模式 allowToggle控制是否能够双击切换-->
        <template v-else-if="fieldItem.eleType === 'input'">
          <div
            style="min-height: 23px"
            v-if="
              fieldItem.allowToggle &&
              !(property === fieldItem.field && index === $index)
            "
            @dblclick="toggleInput(row, column, $index)"
          >
            {{ row[fieldItem.field] }}
          </div>
          <template v-else>
            <el-input
              v-if="fieldItem.allowToggle"
              size="mini"
              v-focus
              :value="row[fieldItem.field]"
              @blur="handleBlur(row, fieldItem)"
              @input="handleInput($event, row, fieldItem)"
            ></el-input>
            <el-input
              v-else
              size="mini"
              v-model="row[fieldItem.field]"
              @blur="handleBlur(row, fieldItem)"
              @input="handleInput($event, row, fieldItem)"
              clearable
            ></el-input>
          </template>
        </template>
        <!-- 复选框模式 -->
        <input
          v-else-if="fieldItem.eleType === 'checkBox'"
          style="cursor: pointer"
          type="checkbox"
          true-value="1"
          false-value="0"
          :disabled="
            row[fieldItem.field] !== '1' && row[fieldItem.field] !== '0'
          "
          v-model="row[fieldItem.field]"
          @change="fieldItemChange(fieldItem, row)"
        />
        <!-- 下拉框模式 -->
        <el-select
          v-else-if="fieldItem.eleType === 'select'"
          size="mini"
          v-model="row[fieldItem.field]"
          placeholder="请选择"
          filterable
          clearable
          @change="fieldItemChange(fieldItem, row)"
        >
          <el-option
            v-for="fieldItem in fieldItem.options"
            :key="fieldItem.value"
            :label="fieldItem.label"
            :value="fieldItem.value"
          >
          </el-option>
        </el-select>
        <!-- 时间框模式 -->
        <el-date-picker
          v-else-if="
            fieldItem.eleType === 'datetime' &&
            judgeTimeType(fieldItem.valueFormat) !== 'time'
          "
          size="mini"
          clearable
          v-model="row[fieldItem.field]"
          :type="judgeTimeType(fieldItem.valueFormat)"
          :value-format="fieldItem.valueFormat"
          :format="fieldItem.valueFormat"
          :placeholder="row[fieldItem.disabledKey] ? '' : '选择时间'"
          :disabled="row[fieldItem.disabledKey]"
          :picker-options="
            getPicker(fieldItem, row, globalMinDate, globalMaxDate)
          "
          @change="fieldItemChange(fieldItem, row)"
        ></el-date-picker>
        <el-time-select
          size="mini"
          v-else-if="
            fieldItem.eleType === 'datetime' &&
            judgeTimeType(fieldItem.valueFormat) === 'time'
          "
          clearable
          v-model="row[fieldItem.field]"
          :placeholder="row[fieldItem.disabledKey] ? '' : '选择时间'"
          :disabled="row[fieldItem.disabledKey]"
          :picker-options="
            getPicker(fieldItem, row, globalMinDate, globalMaxDate)
          "
          @change="fieldItemChange(fieldItem, row)"
        ></el-time-select>
        <template v-else-if="fieldItem.formatter">{{
          fieldItem.formatter(row[fieldItem.field], row, column, $index)
        }}</template>
        <template v-else>{{ row[fieldItem.field] }}</template>
      </component>
    </template>
  </el-table-column>
</template>

<script>
import { deepClone, judgeTimeType, getPicker } from "../../utils/util";
export default {
  name: "tableColumn",
  props: {
    fieldItem: {
      default() {
        return {};
      },
      type: Object,
    },
    rules: {
      default() {
        return {};
      },
      type: Object,
    },
    // 全局最小时间
    globalMinDate: {
      default: 0,
      type: String | Number,
    },
    // 全局最大时间
    globalMaxDate: {
      default: 0,
      type: String | Number,
    },
  },
  data(){
    return {
      temRow: {},
    }
  },
  methods: {
    judgeTimeType,
    getPicker,
    // 动态获取校验
    getRules(fieldItem, row) {
      if (!fieldItem.required) return;
      let rules = deepClone(this.rules[fieldItem.field]);
      if (fieldItem.eleType === "datetime") {
        const params = fieldItem.params;
        if (params && params.minTime && !fieldItem.disabled) {
          const minField = params.minTime;
          rules.push({
            validator: (rule, value, callback) => {
              if (+new Date(value) < +new Date(row[minField])) {
                callback(new Error("请注意时间先后"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          });
        }
        if (params && params.maxTime && !fieldItem.disabled) {
          const maxField = params.maxTime;
          rules.push({
            validator: (rule, value, callback) => {
              if (+new Date(value) > +new Date(row[maxField])) {
                callback(new Error("请注意时间先后"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          });
        }
      }
      return rules;
    },
    // 点击切换input 框
    toggleInput(row, column, $index) {
      this.index = $index;
      this.property = column.property;
      this.temRow = deepClone(row);
    },
    // input框失焦处理
    handleBlur(row, fieldItem) {
      const { field, blurHandler: handler } = fieldItem;
      this.index = "";
      this.property = "";
      // 如果前后值相同则不处理
      if (row[field] == this.temRow[field]) {
        return;
      }
      // 自定义数据过滤
      if (typeof handler === "function") {
        const newValue = handler(row[field]);
        row[field] = newValue;
      }
      this.fieldItemChange(fieldItem, row);
    },
    // input框输入处理
    handleInput(value, row, fieldItem) {
      const { field, inputHandler: handler } = fieldItem;
      if (typeof handler === "function") {
        const newValue = handler(value);
        row[field] = newValue;
      } else {
        row[field] = value;
      }
    },
    // 表格内复选框变更
    fieldItemChange(fieldItem, row) {
      this.$emit("happenEvent", {
        buttonItem: { method: "fieldItemChange", fieldItem },
        row,
      });
    },
  },
};
</script>

<style lang="less" scoped></style>

<template>
  <a-pagination
    v-if="total!=0"
    :locale="paginationLocale"
    class="pagination"
    :current="searchForm.current"
    :page-size="searchForm.pageSize"
    :page-size-options="pageSizeOptions"
    :total="total"
    show-size-changer
    :show-total="(total: any) => `共${total}条`"
    @change="handlePageChange"
  >
  </a-pagination>
</template>
<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const emits = defineEmits()
const props = defineProps({
  total: {
    type: Number
  },
  pageSizeOptions: {
    type: Array
  },
  searchForm: {
    type: Object
  },
  handlePageChange: {
    type: Function,
  },
})
const paginationLocale = zhCN.Pagination // 分页中文

// 组件状态改变
function handlePageChange(page:number, pageSize:number) {
  emits('handlePageChange', page, pageSize)
}
</script>
<style scoped lang="less">
.pagination {
  position: absolute;
  margin-top: 10px;
  right: 30px;

}
</style>

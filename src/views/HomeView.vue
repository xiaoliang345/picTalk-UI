<template>
  <div id="homeView">
    <a-form class="search" layout="inline" :model="searchForm">
      <a-form-item label="关键词">
        <a-input style="width: 183px" v-model:value="searchForm.searchText" placeholder="输入图片名称或简介" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button @click="handleSearch" type="primary">搜索</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <div class="categorys">
      <a-tabs v-model:activeKey="searchForm.category">
        <a-tab-pane key="" tab="全部"></a-tab-pane>
        <a-tab-pane v-for="(category, index) in categoryOptions" :key="category.value"
          :tab="category.label"></a-tab-pane>
      </a-tabs>
    </div>
    <div class="tags">
      <a-space :size="[0, 8]" wrap>
        <span style="margin-right: 8px">标签：</span>

        <a-checkable-tag v-for="(tag, index) in tagOptions" :key="tag" v-model:checked="selectTags[index]"
          @change="handleSelect(index)">
          {{ tag.label }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片列表 -->
    <a-list :grid="{ gutter: 16, xs: 2, md: 3, lg: 4, xl: 5, xxl: 8 }" :data-source="data" :loading="loading">
      <template #renderItem="{ item }">
        <a-list-item @click="getImgDetail(item)">
          <a-card hoverable>
            <template #cover>
              <a-image :src="item.thumbnailUrl" :preview="false" />
            </template>
            <a-card-meta :title="item.name">
              <template #description>
                <a-space>
                  <a-tag v-for="(tag, index) in item.tags" :key="index">
                    {{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>

    <pagination :page-size-options="pageSizeOptions" :total="total" @handlePageChange="handlePageChange"
      :searchForm="searchForm" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from 'vue'
import {
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import Pagination from '@/components/Pagination.vue'
import { useRouter } from 'vue-router'
import { usePublicStore } from '@/stores/publicStore.ts'
const router = useRouter()

const publicStore = usePublicStore();
const data = ref<API.UserVO[]>([]) //数据
const pageSizeOptions = ref<string[]>(['10', '20']) //分页显示数量
const total = ref(0) //总数
let loading = ref(false) //加载中
let tagOptions = ref() //标签选项
let categoryOptions = ref() //分类选项
let selectTags = ref();//tag选中

//搜索表单
const searchForm = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  searchText: '',
  category: '',
  tags: [],
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取图片详情
function getImgDetail(item: API.UserVO) {
  router.push({
    path: '/picture/detail',
    query: {
      id: item.id,
    },
  })
}
// 搜索
async function handleSearch() {
  searchForm.current = 1
  const res = await listPictureVoByPageUsingPost(searchForm)
  if (res.data.code == 200) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  }
}

watch([() => searchForm.category, () => searchForm.tags], () => {
  handleSearch()
})

// 重置搜索
function handleReset() {
  searchForm.current = 1
  searchForm.pageSize = 10
  searchForm.searchText = ''
  searchForm.category = ''
  searchForm.tags = []
  selectTags.value = new Array(tagOptions.value.length).fill(false);
  getData()
}

// 标签选中
const handleSelect = (index: number) => {
  let set = new Set([...searchForm.tags]);
  if (selectTags.value[index]) {
    set.add(tagOptions.value[index].value);

  }
  else {
    set.delete(tagOptions.value[index].value);
  }
  searchForm.tags = [...set];
};

//页码发生变化的回调
const handlePageChange = (page: number, pageSize: number) => {
  searchForm.current = page
  searchForm.pageSize = pageSize
  getData()
}

// 获取用户列表
async function getData() {
  const res = await listPictureVoByPageUsingPost({ ...searchForm })
  if (res.data.code == 200) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  }
}

onMounted(async () => {
  await getData()
  tagOptions.value = publicStore.tagOptions;
  categoryOptions.value = publicStore.categoryOptions;
  selectTags.value = new Array(tagOptions.value.length).fill(false);
})
</script>
<style scoped lang="less">
#homeView {
  padding-bottom: 30px;

  :deep(.ant-space) {
    flex-wrap: wrap;
  }

  .categorys {
    display: flex;
    margin: 15px 5px;
    align-items: flex-start;
    flex-direction: column;
    flex-wrap: wrap;



    :deep(.ant-tabs-nav) {
      margin: 0;
    }

    :deep(.ant-tabs-nav-list) {
      flex-wrap: wrap;
    }
  }

  .tags {
    margin: 15px 5px;
    padding: 5px 0;

    :deep(.ant-tag) {
      font-size: 14px;
    }
  }

  .search {
    margin: 15px 0;
    flex-direction: row;
  }

  :deep(.ant-list-item) {
    padding: 0 5px;
  }

  :deep(.ant-image) {
    margin: auto;
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    overflow: hidden;
  }

  :deep(.ant-image-img) {
    height: 100%;
    width: auto;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media screen and (max-width: 500px) {
  #homeView {
    .search {
      flex-direction: column;

      :deep(.ant-space) {
        margin-top: 10px;


      }
    }
  }
}
</style>

<template xmlns="">
  <div id="PictureCards">
    <!-- 图片列表 -->
    <a-list :grid="{ gutter: 16, xs: 2, md: 3, lg: 4, xl: 5, xxl: 8 }" :data-source="pictures" :loading="loading">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-card @click="getImgDetail(item)" hoverable>
            <template #cover>
              <a-image :src="item.thumbnailUrl" :preview="false" />
            </template>
            <a-card-meta :title="item.name">
              <template #description>
                <a-space>
                  <template v-if="item.tags.length != 0">
                    <a-tag v-for="(tag, index) in item.tags" :key="index">
                      {{ tag }}
                    </a-tag>
                  </template>
                  <template v-else>
                    <a-tag> 默认 </a-tag>
                  </template>
                </a-space>
              </template>
            </a-card-meta>
          </a-card>
          <ul class="btns">
            <li>
              <ShareAltOutlined :style="{ fontSize: '16px', color: 'gray' }" @click="doShare(item.id)" />
            </li>
            <template v-if="role != 'viewer'">
              <li>
                <EditOutlined @click="handleUpdate(item)" :style="{ fontSize: '16px', color: 'gray' }" />
              </li>
              <li>
                <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="handleDelete(item.id)">
                  <DeleteOutlined :style="{ fontSize: '16px', color: 'gray' }" />
                </a-popconfirm>
              </li>
            </template>
          </ul>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
import {
  StepBackwardOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  pictures: {
    type: [] as API.PictureVO[],
    default: [],
  },
  role: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['handleDelete', 'handleShare'])

const router = useRouter()
let loading = ref(false) //加载中

// 分享
function doShare(id: number) {
  emits("handleShare", id)
}
// 编辑图片
function handleUpdate(item: API.PictureVO) {
  router.push({
    path: `/add_picture`,
    query: {
      id: item.id,
      spaceId: item.spaceId,
    },
  })
}

// 获取图片详情
function getImgDetail(item: API.PictureVO) {
  router.push({
    path: '/picture/detail',
    query: {
      id: item.id,
    },
  })
}

// 删除图片
async function handleDelete(id: number) {
  const res = await deletePictureUsingPost({ id })
  if (res.data.code == 200) {
    message.success('删除成功')
    emits('handleDelete', 'delete')
  }
}
</script>
<style scoped lang="less">
#PictureCards {
  padding-bottom: 30px;

  :deep(.ant-card) {
    border-radius: 8px 8px 0 0;
    overflow: hidden;
  }

  .btns {
    display: flex;
    padding-left: 0;
    width: 100%;
    list-style-type: none;
    justify-content: space-around;
    border: 1px solid #f0f0f0;
    border-top: none;
    border-radius: 0 0 8px 8px;

    >li {
      display: flex;
      width: 33%;
      aspect-ratio: 1/1;
      justify-content: center;
      align-items: center;
      //border-right: 1px solid #f0f0f0;
      cursor: pointer;
    }
  }

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
  }

  :deep(.ant-list-item) {
    padding: 0 5px;
    margin-bottom: 0;
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
</style>

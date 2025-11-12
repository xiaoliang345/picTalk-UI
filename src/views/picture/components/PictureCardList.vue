<template>
  <!-- 图片列表 -->
  <div id="PictureCardList">
    <a-list :grid="{ gutter: 16, xs: 2, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }" :data-source="pictures">
      <template #renderItem="{ item }">
        <a-list-item @click="getImgDetail(item)">
          <a-card hoverable class="img-card" style="position: relative;" @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
            <template #cover>
              <img :src="item?.thumbnailUrl" style="object-fit: cover; height: 210px; width: 100%;" />
            </template>
            <div class="image-overlay">
              <div class="overlay-content">
                <div class="overlay-title">{{ item.name }}</div>
                <div class="overlay-desc">{{ item.introduction != null ? item.introduction : '暂无简介' }}
                </div>
                <div class="overlay-tags">
                  <a-tag v-for="tag in item.tags" :bordered="false" :color="TAG_COLOR_MAP[tag]">{{
                    tag }}</a-tag>
                </div>
              </div>
            </div>

            <a-card-meta :title="item.name">
              <template #avatar>
                <a-avatar :src="item?.user?.userAvatar" />
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, type PropType } from 'vue';
import { TAG_COLOR_MAP } from '@/constant/index.ts'


// 接收父组件传递的图片数据
const props = defineProps(["pictures"])
const emit = defineEmits(['getPictureInfo'])


let pictures = ref<API.PictureVO[]>(props.pictures)


// 获取图片详情
function getImgDetail(item: API.PictureVO) {
  emit('getPictureInfo', item)
}

// 控制遮罩显示状态的变量
const isHovered = ref(false);
// 鼠标进入和离开事件处理函数
function handleMouseEnter() {
  isHovered.value = true;
}

function handleMouseLeave() {
  isHovered.value = false;
}
watch(() => props.pictures, (newValue) => {
  pictures.value = newValue;
}, { immediate: true })

</script>
<style scoped lang="less">
#PictureCardList {
  margin-top: 15px;
}

.img-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

/* 遮罩容器 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 210px;
  /* 和图片高度一致 */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;
  pointer-events: none;
  /* 不影响点击穿透 */
  padding: 16px;
  box-sizing: border-box;

  .overlay-tags {
    position: absolute;
    bottom: 16px;
    left: 16px;
  }
}

/* 鼠标悬停时显示遮罩 */
.img-card:hover .image-overlay {
  opacity: 1;
  visibility: visible;
}

/* 遮罩内文字样式 */
.overlay-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 6px;
}

.overlay-desc {
  font-size: 13px;
  line-height: 1.4;
  word-wrap: break-word;
  /* 长单词也换行 */
  white-space: normal;
  //最多显示五行
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
}

:deep(.ant-list-item) {
  padding: 0px !important;
}

:deep(.ant-card-body) {
  padding: 20px !important;
}

:deep(.ant-card-meta-detail) {
  display: flex;
  align-items: center;
}

:deep(.ant-row) {
  row-gap: 10px !important;
}
</style>

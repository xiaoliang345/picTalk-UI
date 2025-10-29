<template>
    <a-layout class="ai-image-preview-page">
        <a-row type="flex" justify="center" align="middle">
            <!-- 左侧：图片区域 -->
            <a-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14" class="image-wrapper">
                <div class="image-container">
                    <a-image :src="picture?.previewUrl" class="preview-img">
                        <template #placeholder>
                            <a-image :src="picture?.previewUrl" :preview="false" />
                        </template>
                    </a-image>
                </div>
                <div class="btns">
                    <a-space>
                        <a-button @click="doDownload">
                            <template #icon>
                                <DownloadOutlined color="red" />
                            </template>
                        </a-button>
                        <a-button @click="handleShare(picture?.id)">
                            <template #icon>
                                <ShareAltOutlined />
                            </template>
                        </a-button>
                        <a-button @click="handleUpdate">
                            <template #icon>
                                <EditFilled />
                            </template>

                        </a-button>
                        <a-button @click="handleDelete">
                            <template #icon>
                                <DeleteFilled />
                            </template>
                        </a-button>
                    </a-space>
                </div>
            </a-col>

            <!-- 右侧：信息面板 -->
            <a-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10" class="info-panel">
                <div>
                    <div class="panel-header">
                        <div class="avatar">
                            <a-avatar shape="circle" :src="picture?.user?.userAvatar" />
                        </div>
                        <div class="info">
                            <div class="title">{{ picture.name }}</div>
                            <div class="time">{{ new Date(picture.createTime).toLocaleString() }}</div>
                        </div>
                    </div>
                    <a-divider width="90%" />
                    <div class="prompt-section">
                        <h4>图片介绍</h4>
                        <div class="introduction">{{ picture.introduction != null ? picture.introduction : "暂无图片介绍"
                            }}</div>
                        <!-- <pre class="prompt-text">{{ picture.introduction != null ? picture.introduction : "暂无图片介绍" }}</pre> -->
                    </div>
                </div>

                <div class="meta-info">
                    <div class="category">
                        <a-tag>{{ picture?.category }}</a-tag>
                        <a-tag>{{ (picture?.picSize / 1024 / 1024).toFixed(1) }}MB</a-tag>
                        <a-tag>{{ picture?.picFormat }}</a-tag>

                    </div>
                    <div class="tags">
                        标签：
                        <a-tag v-for="tag in picture.tags" :bordered="false" :color="TAG_COLOR_MAP[tag]">{{
                            tag }}</a-tag>
                    </div>
                </div>
            </a-col>
        </a-row>
        <share v-model:shareIsShow="shareIsShow" :shareLink="shareLink" />
    </a-layout>
</template>

<script setup lang="ts">
import { TAG_COLOR_MAP } from '@/constant/index.ts'
import { DownloadOutlined, DeleteFilled, EditFilled, ShareAltOutlined } from '@ant-design/icons-vue'
// 获取图片信息
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import router from '@/router'
import { message } from 'ant-design-vue'
import { downloadImage } from '@/utils'
import { useUserStore } from '@/stores/userStore.ts'
import Share from '@/components/Share.vue'
import { ref, watch } from 'vue'

const props = defineProps({
    picture: {
        type: [] as API.PictureVO,
        default: () => ({})
    }
})

const emit = defineEmits(['handleDeleteSuccess'])

const picture = ref<API.PictureVO>(props.picture)
const userStore = useUserStore()
const shareLink = ref('') //二维码链接
let shareIsShow = ref(false) //是否显示二维码


// 分享
function handleShare(id: number) {
    shareIsShow.value = true
    shareLink.value = `http://localhost:5173/picture/detail?id=${id}`
}

// 删除图片
async function handleDelete() {
    const res = await deletePictureUsingPost({ id: picture.value?.id })
    if (res.data.code == 200) {
        message.success('删除成功')
        emit('handleDeleteSuccess')
    } else {
        message.error('删除失败')
    }
}

// 编辑
function handleUpdate() {
    router.push({
        path: '/add_picture',
        query: {
            id: picture.value?.id,
        },
    })
}

// 处理下载
const doDownload = () => {
    downloadImage(picture.value?.url)
}

watch(() => props.picture, (newValue) => {
    picture.value = newValue
}, { immediate: true })

</script>

<style scoped lang="less">
.ai-image-preview-page {
    height: 100%;
    // min-width: 350px;
    border-radius: 8px;
    overflow: hidden;
    /* 新增 */
    background-color: #f0f2f5;
}

.image-wrapper {
    height: 100%;
    background-color: black;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;

    .btns {
        position: absolute;
        right: 20px;
        top: 20px;

        :deep(.ant-space) {
            flex-wrap: wrap;
        }

        :deep(.ant-btn-default) {
            background-color: rgba(255, 255, 255, 0.8);
            border: none;
        }
    }
}

.image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    // max-width: 600px;
    height: 400px;

    padding: 10px;
    box-sizing: border-box;
    text-align: center;

    .preview-img {
        // height: 100%;

        object-fit: contain;
        border-radius: 8px;
        max-width: 100%;

    }

    :deep(.ant-image-img) {
        max-height: 380px;
        object-fit: contain !important;
    }
}



.image-footer {
    position: absolute;
    bottom: 16px;
    left: 16px;
    color: white;
    font-size: 14px;
    opacity: 0.8;
}

.image-toolbar {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
}

.toolbar-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: 4px;
    transition: all 0.2s;
}

.toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.info-panel {
    display: flex;
    height: 400px;
    background: white;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    justify-content: space-between;

}

.panel-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .info {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
    }


}

:where(.css-dev-only-do-not-override-1p3hq3p).ant-divider-horizontal {
    margin-bottom: 10px !important;
}

.avatar {
    margin-right: 12px;
}

.title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.time {
    font-size: 12px;
    color: #999;
}

.prompt-section {
    margin-bottom: 24px;

    .introduction {
        font-size: 14px;
        color: #58595a;
    }
}

.prompt-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #333;
}

.prompt-text {
    max-height: 150px;
    background: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    color: #333;
}

.meta-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;


}

.edit-btn {
    width: 100%;
    font-size: 16px;
    border-radius: 8px;
}

@media screen and (max-width: 500px) {

    .info-panel,
    .image-container {
        height: 300px;
    }

}
</style>
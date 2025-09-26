<template>
    <a-modal v-model:open="visible" title="批量编辑图片" @ok="handleSubmit" @cancel="handleCancel" width="400px">
        <div style="color: #888; font-size: 12px; margin-bottom: 10px;">* 只对当前页面的图片生效</div>
        <a-form :model="searchForm">
            <a-form-item label="类型">
                <a-select v-model:value="searchForm.category" :options="categoryOptions" placeholder="选择图片分类" />
            </a-form-item>
            <a-form-item label="标签">
                <a-select mode="tags" v-model:value="searchForm.tags" :options="tagOptions" placeholder="选择图片标签" />
            </a-form-item>
            <a-form-item label="命名规则">
                <a-input v-model:value="searchForm.nameRule" placeholder="请输入命名规则，输入{序号}可动态生成" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button type="primary" block @click="handleSubmit">提交</a-button>
        </template>
    </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, type PropType } from 'vue'
import { usePublicStore } from '@/stores/publicStore'
import { editPictureByBatchUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/userStore'

const emit = defineEmits(['handleUpateBatch'])
const props = defineProps({
    pictures: {
        type: Array as PropType<API.PictureVO[]>
    }
})
const publicStore = usePublicStore()
const userStore = useUserStore()
const visible = ref(false)
const searchForm = ref({
    category: '',
    tags: [],
    pictureIdList: [],
    spaceId: userStore.showSpaceId,
    nameRule: ''
})
let tagOptions = ref(publicStore.tagOptions) //标签选项
let categoryOptions = ref(publicStore.categoryOptions) //分类选项

const handleSubmit = async () => {
    // 这里处理提交逻辑
    searchForm.value.pictureIdList = props.pictures?.map((picture) => picture.id);
    const res = await editPictureByBatchUsingPost(searchForm.value)
    if (res.data.code == 200) {
        message.success('修改成功')
        emit('handleUpateBatch')
    }
    visible.value = false
    handleCancel()
}
const handleCancel = () => {
    visible.value = false
    searchForm.value = {
        category: '',
        tags: [],
        spaceId: undefined,
        nameRule: ''
    }
}

onMounted(() => {
    searchForm.value.pictureIdList = props.pictures.map(item => item.id);
})
// 供父组件控制弹窗显示
defineExpose({ visible })
</script>

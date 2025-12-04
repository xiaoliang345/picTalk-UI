<template>
  <a-modal v-model:open="visible" :title="isEditMode ? '编辑帖子' : '发布新帖'" :width="isEditMode ? 720 : 500"
    @ok="handleSubmit" :confirmLoading="submitting" okText="保存" cancelText="取消" @cancel="handleCancel">
    <a-form :model="formData" layout="vertical">
      <a-form-item label="标题" required>
        <a-input v-model:value="formData.title" placeholder="请输入帖子标题" :maxlength="100" show-count />
      </a-form-item>
      <a-form-item label="内容" required>
        <a-textarea ref="contentTextareaRef" v-model:value="formData.content" :rows="isEditMode ? 4 : 5"
          placeholder="分享你的想法..." :maxlength="5000" show-count />
        <div style="margin-top:5px">
          <EmojiPicker v-model:open="emojiPickerVisible" placement="bottomLeft" @select="addEmoji" />
        </div>
      </a-form-item>
      <a-form-item label="图片链接（可选,最多4张）">
        <PicturesUpload v-model:pictureMaps="pictureMaps" :postId="postId" @success="handleSuccess" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { createPostUsingPost, updatePostUsingPost } from '@/api/forumController'
import EmojiPicker from '@/components/EmojiPicker.vue'
import PicturesUpload from "./PicturesUpload.vue"

interface Props {
  open: boolean
  postId?: number
  initialData?: {
    id?: number
    title?: string
    content?: string
    imageUrls?: Array<{ url: string, thumbnailUrl: string }>
  }
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  postId: 4,
  initialData: () => ({
    title: '',
    content: '',
    imageUrls: []
  })
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}>()

const visible = ref(false)
const submitting = ref(false)
const emojiPickerVisible = ref(false)
const contentTextareaRef = ref<any>(null)

// 统一的表单数据
const formData = ref({
  id: undefined as number | undefined,
  title: '',
  content: '',
  imageUrls: [] as Array<{ url: string, thumbnailUrl: string }>
})

// 统一的图片列表
const pictureMaps = ref<Array<{ url: string, thumbnailUrl: string }>>([])

// 判断是否为编辑模式
const isEditMode = computed(() => !!props.initialData?.id)

// 监听 open prop 变化
watch(() => props.open, (newVal) => {
  visible.value = newVal
  if (newVal) {
    // 打开弹窗时初始化数据
    if (isEditMode.value && props.initialData) {
      formData.value = {
        id: props.initialData.id,
        title: props.initialData.title || '',
        content: props.initialData.content || '',
        imageUrls: []
      }
      pictureMaps.value = props.initialData.imageUrls || []
    } else {
      // 创建模式，重置表单
      formData.value = {
        id: undefined,
        title: '',
        content: '',
        imageUrls: []
      }
      pictureMaps.value = []
    }
  }
})

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:open', newVal)
})

// 添加 emoji
function addEmoji(emoji: string) {
  const textarea = contentTextareaRef.value?.resizableTextArea?.textArea
  if (!textarea) return

  // 获取当前光标位置
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  // 插入 emoji 到光标位置
  const before = formData.value.content.substring(0, start)
  const after = formData.value.content.substring(end)
  formData.value.content = before + emoji + after

  // 等待 DOM 更新后，恢复光标位置
  nextTick(() => {
    const newCursorPos = start + emoji.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })

  emojiPickerVisible.value = false
}



// 提交表单
async function handleSubmit() {
  if (!formData.value.title.trim()) {
    message.warning('请输入帖子标题')
    return
  }
  if (!formData.value.content.trim()) {
    message.warning('请输入帖子内容')
    return
  }

  submitting.value = true
  try {
    if (isEditMode.value) {
      // 编辑模式
      const res = await updatePostUsingPost({
        id: formData.value.id,
        title: formData.value.title.trim(),
        content: formData.value.content.trim(),
        imageUrls: pictureMaps.value
      } as any)

      if (res.data?.code === 200) {
        message.success('更新成功')
        visible.value = false
        emit('success')
      } else {
        message.error(res.data?.message || '更新失败')
      }
    } else {
      // 创建模式
      const res = await createPostUsingPost({
        title: formData.value.title.trim(),
        content: formData.value.content.trim(),
        imageUrls: pictureMaps.value as any
      })

      if (res.data?.code === 200) {
        message.success('发布成功')
        visible.value = false
        emit('success')
      } else {
        message.error(res.data?.message || '发布失败')
      }
    }
  } catch (e) {
    message.error('请求失败')
  } finally {
    submitting.value = false
  }
}

// 取消操作
function handleCancel() {
  visible.value = false
}
</script>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 20px !important;
}
</style>

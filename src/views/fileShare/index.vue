<template>
  <div class="file-manager">
    <!-- 页面头部 -->
    <header class="app-header">
      <div class="header-content">
        <h2>文件共享系统</h2>
        <p>安全便捷的文件上传与下载服务</p>
      </div>
    </header>

    <div class="container">
      <!-- 上传进度条 -->
      <transition name="fade">
        <!-- <a-progress v-if="showProgress" :percent="uploadPercent" :status="uploadStatus" :stroke-width="12"
          class="upload-progress" /> -->
        <div v-if="showProgress" style="text-align: center;">
          <a-progress :percent="uploadPercent" :status="uploadStatus" :stroke-width="12" class="upload-progress" />
        </div>
      </transition>

      <div class="content-wrapper">
        <!-- 文件上传区域 -->
        <section class="upload-section card">
          <div class="section-header">
            <h2>
              <i class="fas fa-upload"></i>
              上传文件
            </h2>
            <p class="section-description">选择文件并上传到云端存储</p>
          </div>

          <div class="upload-area">
            <a-spin :spinning="uploading">
              <a-upload ref="uploadRef" class="upload-box" name="avatar" list-type="picture-card"
                :show-upload-list="false" :before-upload="beforeUpload" :custom-request="handleCustomRequest">
                <div class="ant-upload-drag-icon">
                  <i class="fas fa-cloud-upload-alt upload-icon"></i>
                </div>
                <p class="ant-upload-text">点击上传</p>
                <p class="ant-upload-hint">最大支持 100MB</p>
                <p class="ant-upload-hint" style="color: orange">
                  多个文件请打包成 rar/zip 上传哟~
                </p>
              </a-upload>
            </a-spin>

          </div>

        </section>

        <!-- 文件列表区域 -->
        <section class="file-list-section card">
          <div class="section-header">
            <h2>
              <i class="fas fa-file-download"></i>
              下载文件
            </h2>
            <p class="section-description">输入提取码获取文件列表</p>
          </div>

          <div class="download-controls">
            <a-form :model="fileForm" class="download-form">
              <a-form-item>
                <a-input v-model:value="fileForm.code" placeholder="请输入提取码" class="code-input">
                </a-input>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="onSubmit" :loading="loading">
                  <i class="fas fa-download"></i>
                  提取
                </a-button>
              </a-form-item>
            </a-form>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>正在加载文件列表...</p>
          </div>

          <!-- 空状态 -->
          <div v-else-if="fileList.length === 0 && fileForm.code" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>未找到文件</p>
            <span>请检查提取码是否正确</span>
          </div>

          <div v-else-if="fileList.length === 0 && !fileForm.code" class="empty-state">
            <i class="fas fa-file-alt"></i>
            <p>暂无文件</p>
            <span>请输入提取码获取文件列表</span>
          </div>

          <!-- 文件列表 -->
          <div v-else class="file-list">
            <transition-group name="file-list" tag="div">
              <div v-for="(item, index) in fileList" :key="index" class="file-item">
                <div class="file-info">
                  <i class="fas fa-file file-icon"></i>
                  <div class="file-details">
                    <span class="file-name">{{ item.fileName }}</span>
                  </div>
                </div>
                <a-button size="small" @click="downloadFile(item)" class="download-button">
                  <i class="fas fa-download"></i>
                  下载
                </a-button>
              </div>
            </transition-group>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  getDownloadUrlUsingPost, getUploadProgressUsingGet,
  listFilesUsingGet, uploadFileUsingPost
} from '@/api/fileController'
import { downloadImage } from '@/utils'

// 响应式数据
const fileList = ref([])
const loading = ref(false)
const uploadLoading = ref(false)
const uploading = ref(false)
const uploadRef = ref()
const showProgress = ref(false)
const uploadPercent = ref(0)
const uploadStatus = ref('')
const fileForm = ref({
  code: ''
})

// 上传控制
let uploadInfo = ref<API.UploadVO>()
let progressTimer = null

onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
})

// 方法
const fetchFileList = async () => {
  if (!fileForm.value.code) {
    message.warning('请输入提取码')
    return
  }

  loading.value = true
  try {
    const res = await listFilesUsingGet({ code: fileForm.value.code })
    if (res.data?.code == 200) {
      fileList.value = res.data.data

      if (fileList.value.length === 0) {
        message.info('未找到相关文件')
      }
    }
    else {
      message.error(res.data.message)
      fileList.value = []
    }
  } catch (error) {

  } finally {
    loading.value = false
  }
}

const beforeUpload = (file) => {
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    message.error('文件大小不能超过 100MB!')
    return false
  }
  return true
}

// 自定义上传处理函数
const handleCustomRequest = async (options) => {
  const { file, onSuccess, onError } = options
  uploading.value = true
  try {
    const res = await uploadFileUsingPost({ file })
    if (res.data.code == 200) {
      uploadInfo.value = res.data.data
      onSuccess(res.data)
      // 显示进度条（但初始为 0）
      showProgress.value = true
      uploadPercent.value = 0
      // 轮询进度
      pollProgress()
    } else {
      onError(new Error(res.data.message))
      uploading.value = false
    }
  } catch (error) {
    onError(error)
  }
}

const onSubmit = async () => {
  await fetchFileList()
}

const pollProgress = () => {
  if (progressTimer) clearInterval(progressTimer)

  progressTimer = setInterval(async () => {
    const res = await getUploadProgressUsingGet({ authCode: uploadInfo.value.code })
    if (res.data.code == 200) {
      const { percent, total } = res.data.data

      // 只有 total > 0 才更新进度
      if (total <= 0) {
        uploadPercent.value = 0
        return
      }

      const safePercent = Math.min(100, Math.max(0, parseFloat(percent.toFixed(2))))
      uploadPercent.value = safePercent

      if (safePercent >= 100) {
        finishUpload(true)
      }
    }
    else {
      finishUpload(false)
    }
  }, 500)
}

const finishUpload = (success) => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  uploading.value = false
  showProgress.value = false

  if (success) {
    // 显示提取码
    message.success(`上传成功，提取码为：${uploadInfo.value.code}`, 20)
  } else {
    message.error('上传失败，请重试')
  }
}

const downloadFile = async (item) => {
  try {
    const res = await getDownloadUrlUsingPost(item)
    if (res.data.code == 200) {
      downloadImage(res.data.data)
      /*  const link = document.createElement('a')
       link.href = res.data.data
       link.download = filename.split('/').pop()
       document.body.appendChild(link)
       link.click()
       document.body.removeChild(link) */
    }
    else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('下载失败')
  }
}
</script>

<style scoped lang="less">
.file-manager {
  min-height: 100vh;
  // background-image: url("@/assets/富士山.png");
  background-size: 100%;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  // padding: 30px;
  height: 130px;
  color: white; // 改为深色以便在浅色背景上清晰显示
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;


  .header-content {
    display: flex;
    margin: 0 auto;
    height: 100%;
    max-width: 800px;
    // background-color: rgba(0, 0, 0, 0.05);
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .logo {
      font-size: 3rem;
      margin-bottom: 15px;
      color: #333; // 设置 logo 图标颜色
    }

    h2 {
      // font-size: 2.5rem;
      // margin: 10px;
      font-weight: 600;
      color: rgb(56, 56, 56); // 标题使用深色
    }

    p {
      // font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
      color: #9a9a9a; // 描述信息使用深灰色
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;

  .upload-progress {
    max-width: 300px;
    margin: 0px auto 10px;
    // background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    // padding: 5px;
  }

  :deep(.ant-progress-text) {
    // color: white;
  }
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: rgba(255, 255, 255, 0.3);

  &:hover {
    /* transform: translateY(-5px); */
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .section-header {
    margin-bottom: 15px;

    h2 {
      color: #333; // 改为深色以便在浅色背景上清晰显示
      margin: 8px 0;
      display: flex;
      align-items: center;
      font-size: 18px;
    }

    .section-description {
      color: #9a9a9a; // 改为深灰色以便在浅色背景上清晰显示
      // font-size: 1rem;
      margin: 0;
    }
  }
}

.upload-area {
  margin-bottom: 20px;

  .upload-box {
    width: 100%;

    :deep(.ant-upload) {
      width: 100%;
      flex-direction: column;
      min-height: 150px;
    }

    .ant-upload-text,
    .ant-upload-hint,
    .ant-upload-hint {
      margin-bottom: 5px;
      color: #9a9a9a;
    }


  }

  .upload-icon {
    font-size: 3rem;
    color: #409eff;
    margin-bottom: 15px;
  }
}

.download-controls {
  margin-bottom: 10px;

  .download-form {
    display: flex;
    flex-wrap: wrap;
    /* gap: 15px; */
    align-items: center;

    .code-input {
      max-width: 120px;

      :deep(.ant-input) {
        background: rgba(255, 255, 255, 0.8); // 输入框背景
        border: 1px solid #d9d9d9;
        color: #333; // 输入框文字颜色

        &::placeholder {
          color: #999; // 占位符颜色
        }
      }
    }

    .download-btn {
      height: 42px;
    }
  }

  :deep(.ant-btn-primary) {
    background-color: #409eff;
    border-color: #409eff;

    &:hover {
      background-color: #66b1ff;
      border-color: #66b1ff;
    }
  }
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;

  i {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #bdc3c7;
  }
}

.empty-state {
  p {
    font-size: 14px;
    margin-bottom: 5px;
    color: #9a9a9a;
  }

  span {
    font-size: 14px;
  }
}

.file-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 12px;
    background: #f8f9fa;
    transition: all 0.3s ease;
    border: 1px solid #eaeaea;

    &:hover {
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateX(5px);
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;

      .file-icon {
        font-size: 1.5rem;
        color: #409eff;
      }

      .file-details {
        display: flex;
        flex-direction: column;

        .file-name {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 3px;
        }
      }
    }
  }

  .download-button {
    background: #409eff;
    border: none;
    color: white;
    transition: all 0.3s ease;

    &:hover {
      background: #66b1ff;
      transform: translateY(-2px);
    }
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.3s;
}

.file-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.file-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

:deep(.ant-form-item) {
  margin-right: 10px !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.file-list::-webkit-scrollbar {
  width: 6px;
}

.file-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.file-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;

  &:hover {
    background: #a1a1a1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-manager {
    padding: 10px;
  }

  .app-header {
    padding: 20px;

    h1 {
      font-size: 1.8rem;
    }

    p {
      font-size: 1rem;
    }
  }

  .card {
    padding: 20px;

    .section-header {
      h2 {
        font-size: 16px;
      }
    }
  }

  .download-form {
    /* flex-direction: column; */
    align-items: stretch;
  }

  .code-input {
    min-width: auto;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;

    .file-info {
      width: 100%;
    }

    .download-button {
      align-self: flex-end;
    }
  }
}
</style>
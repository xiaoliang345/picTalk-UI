<template>
  <div id="basiclayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <a-layout-sider class="sider" :class="{
          'sider--mobile': publicStore.isMobile,
          'sider--mobile-open': publicStore.isMobile && !publicStore.isFold,
        }" :width="publicStore.isMobile ? 248 : 220" :collapsedWidth="0" :trigger="null">
          <Sider />
        </a-layout-sider>
        <a-layout-content class="content" :class="{ 'content-mobile': publicStore.isMobile }">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>

    <transition name="mobile-overlay">
      <div v-if="publicStore.isMobile && !publicStore.isFold" class="sider-overlay" @click="toggleCollapsed"></div>
    </transition>

    <a-button v-if="publicStore.isMobile" class="collapsed-button" type="primary" shape="circle" size="large"
      @click="toggleCollapsed">
      <template #icon>
        <MenuUnfoldOutlined v-if="publicStore.isFold" />
        <MenuFoldOutlined v-else />
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
//@ts-ignore
import GlobalHeader from '@/components/GlobalHeader.vue'
import Sider from '@/components/Sider.vue'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { usePublicStore } from '@/stores/publicStore'

const publicStore = usePublicStore()

const toggleCollapsed = () => {
  publicStore.isFold = !publicStore.isFold
}

const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'windows phone', 'mobile']

const handleResize = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileAgent = mobileKeywords.some((keyword) => userAgent.includes(keyword))
  const isMobileViewport = window.innerWidth < 500
  const isMobile = isMobileAgent || isMobileViewport
  const wasMobile = publicStore.isMobile

  publicStore.isMobile = isMobile
  if (isMobile) {
    publicStore.isFold = true
  } else if (wasMobile) {
    publicStore.isFold = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})

watch(
  () => [publicStore.isMobile, publicStore.isFold],
  ([isMobile, isFold]) => {
    document.body.style.overflow = isMobile && !isFold ? 'hidden' : ''
  },
  { immediate: true },
)
</script>

<style scoped lang="less">
#basiclayout {

  .header {
    padding: 0px 20px;
    background-color: white;
  }

  :deep(.ant-layout-sider) {
    background: white;
  }

  :deep(.ant-layout-sider-trigger) {
    position: absolute;
    top: 0;
    color: black;
    background-color: white;
  }

  .content {
    margin: 15px;
    padding: 20px;
    background: white;
    border-radius: 10px;

    .sider {
      text-align: center;
      line-height: 120px;
      color: #fff;
      background-color: #3ba0e9;
    }
  }

  .footer {
    width: 100%;
    background-color: #efefef;
    text-align: center;
  }

  .content-mobile {
    margin: 10px 7px;
  }

  .collapsed-button {
    position: fixed;
    bottom: 60px;
    right: 24px;
    z-index: 220;
    // box-shadow: 0 10px 26px rgba(64, 158, 255, 0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:active {
      transform: scale(0.96);
      box-shadow: 0 6px 18px rgba(64, 158, 255, 0.24);
    }
  }

  .sider-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 180;
  }

  .sider--mobile {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 248px;
    max-width: 82vw;
    z-index: 190;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    // box-shadow: 10px 0 28px rgba(0, 0, 0, 0.18);
    overflow-y: auto;
    pointer-events: none;
  }

  .sider--mobile-open {
    transform: translateX(0);
    pointer-events: auto;
  }
}

.mobile-overlay-enter-active,
.mobile-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.mobile-overlay-enter-from,
.mobile-overlay-leave-to {
  opacity: 0;
}
</style>

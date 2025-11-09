<template>
  <div id="about">
    <div class="about-container">
      <div class="about-header">
        <h1 class="about-title">关于项目</h1>
        <p class="about-subtitle">PicTalk - 智能图库空间系统</p>
      </div>

      <div class="about-content">
        <a-card class="project-intro-card" title="项目简介">
          <p class="intro-text">
            PicTalk是一个功能强大的图库空间管理系统，为用户提供专业的图片存储、管理和编辑服务。
            系统采用现代化的技术架构，支持多种空间类型，满足不同用户群体的需求。
          </p>
        </a-card>

        <div class="features-section">
          <h2 class="section-title">核心功能</h2>
          <a-row :gutter="[24, 24]">
            <a-col :xs="24" :sm="12" :md="8">
              <a-card class="feature-card feature-card-1" hoverable>
                <template #title>
                  <div class="feature-title">
                    <GlobalOutlined class="feature-icon" />
                    <span>公共空间</span>
                  </div>
                </template>
                <p class="feature-description">
                  提供公共图库空间，用户可以浏览和分享公共图片资源。
                  支持图片分类、标签管理和搜索功能，方便用户快速找到所需图片。
                </p>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :md="8">
              <a-card class="feature-card feature-card-2" hoverable>
                <template #title>
                  <div class="feature-title">
                    <UserOutlined class="feature-icon" />
                    <span>个人空间</span>
                  </div>
                </template>
                <p class="feature-description">
                  为每个用户提供独立的个人图库空间，支持图片的上传、管理和组织。
                  用户可以创建个人相册，设置访问权限，管理个人图片资源。
                </p>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :md="8">
              <a-card class="feature-card feature-card-3" hoverable>
                <template #title>
                  <div class="feature-title">
                    <TeamOutlined class="feature-icon" />
                    <span>团队空间</span>
                  </div>
                </template>
                <p class="feature-description">
                  支持团队协作的共享空间，团队成员可以共同管理和使用图片资源。
                  提供权限管理、成员管理和空间分析功能，便于团队协作。
                </p>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :md="8">
              <a-card class="feature-card feature-card-4" hoverable>
                <template #title>
                  <div class="feature-title">
                    <RobotOutlined class="feature-icon" />
                    <span>AI图片编辑</span>
                  </div>
                </template>
                <p class="feature-description">
                  集成先进的AI图片编辑功能，支持智能图片处理、风格转换、内容识别等。
                  提供便捷的AI辅助工具，让图片编辑变得更加简单高效。
                </p>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :md="8">
              <a-card class="feature-card feature-card-5" hoverable>
                <template #title>
                  <div class="feature-title">
                    <PictureOutlined class="feature-icon" />
                    <span>图片管理</span>
                  </div>
                </template>
                <p class="feature-description">
                  完善的图片管理系统，支持批量上传、批量操作、图片分类和标签管理。
                  提供详细的图片信息和统计分析功能。
                </p>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :md="8">
              <a-card class="feature-card feature-card-6" hoverable>
                <template #title>
                  <div class="feature-title">
                    <SearchOutlined class="feature-icon" />
                    <span>智能搜索</span>
                  </div>
                </template>
                <p class="feature-description">
                  强大的搜索功能，支持按名称、简介、分类、标签等多种方式检索图片。
                  快速定位所需图片，提升使用效率。
                </p>
              </a-card>
            </a-col>
          </a-row>
        </div>

        <div class="tech-section">
          <h2 class="section-title">技术特点</h2>
          <a-list :data-source="techFeatures" size="large">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <span class="tech-title">{{ item.title }}</span>
                  </template>
                  <template #description>
                    <span class="tech-description">{{ item.description }}</span>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  GlobalOutlined,
  UserOutlined,
  TeamOutlined,
  RobotOutlined,
  PictureOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'

const techFeatures = [
  {
    title: '现代化技术栈',
    description: '采用Vue 3、TypeScript、Ant Design Vue等前沿技术，提供流畅的用户体验。',
  },
  {
    title: '响应式设计',
    description: '支持PC端和移动端，自适应不同屏幕尺寸，随时随地访问和管理图片。',
  },
  {
    title: '安全可靠',
    description: '完善的权限管理系统，保障用户数据安全和隐私保护。',
  },
  {
    title: '高性能',
    description: '优化的图片加载和管理机制，支持大批量图片的高效处理。',
  },
]
</script>

<style scoped lang="less">
#about {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 24px;

  .about-container {
    max-width: 1200px;
    margin: 0 auto;

    .about-header {
      text-align: center;
      margin-bottom: 32px;
      padding: 32px 24px;
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid #404040;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd, #98d8c8);
        background-size: 700% 100%;
        animation: gradientMove 8s ease infinite;
      }

      .about-title {
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 12px 0;
      }

      .about-subtitle {
        font-size: 18px;
        color: #b0b0b0;
        margin: 0;
      }
    }

    .about-content {
      .project-intro-card {
        margin-bottom: 32px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
        border: 1px solid #404040;

        :deep(.ant-card-head) {
          border-bottom: 1px solid #404040;

          .ant-card-head-title {
            color: #ffffff;
            font-weight: 600;
          }
        }

        .intro-text {
          font-size: 16px;
          line-height: 1.8;
          color: #d0d0d0;
          margin: 0;
        }
      }

      .features-section {
        margin-bottom: 32px;

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 24px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #ff6b6b;
        }

        .feature-card {
          height: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          transition: all 0.3s;
          border: 1px solid #404040;
          background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
          overflow: hidden;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            opacity: 0.8;
          }

          &:hover {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            transform: translateY(-8px);
          }

          :deep(.ant-card-head) {
            border-bottom: 1px solid #404040;

            .ant-card-head-title {
              color: #ffffff;
            }
          }

          .feature-title {
            display: flex;
            align-items: center;
            gap: 8px;

            .feature-icon {
              font-size: 20px;
            }

            span {
              font-size: 18px;
              font-weight: 600;
            }
          }

          .feature-description {
            font-size: 14px;
            line-height: 1.8;
            color: #b0b0b0;
            margin: 0;
          }
        }

        .feature-card-1 {
          &::before {
            background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
          }

          .feature-icon {
            color: #ff6b6b;
          }
        }

        .feature-card-2 {
          &::before {
            background: linear-gradient(90deg, #4ecdc4, #6de0d7);
          }

          .feature-icon {
            color: #4ecdc4;
          }
        }

        .feature-card-3 {
          &::before {
            background: linear-gradient(90deg, #45b7d1, #67c9e1);
          }

          .feature-icon {
            color: #45b7d1;
          }
        }

        .feature-card-4 {
          &::before {
            background: linear-gradient(90deg, #96ceb4, #b4e0ca);
          }

          .feature-icon {
            color: #96ceb4;
          }
        }

        .feature-card-5 {
          &::before {
            background: linear-gradient(90deg, #ffeaa7, #fff0c1);
          }

          .feature-icon {
            color: #ffeaa7;
          }
        }

        .feature-card-6 {
          &::before {
            background: linear-gradient(90deg, #dda0dd, #e8b5e8);
          }

          .feature-icon {
            color: #dda0dd;
          }
        }
      }

      .tech-section {
        background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        border: 1px solid #404040;

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 24px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #4ecdc4;
        }

        :deep(.ant-list-item) {
          border-bottom: 1px solid #404040;
          padding: 16px 0;

          &:last-child {
            border-bottom: none;
          }
        }

        .tech-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .tech-description {
          font-size: 14px;
          color: #b0b0b0;
          line-height: 1.8;
        }
      }
    }
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@media (max-width: 768px) {
  #about {
    padding: 16px;

    .about-container {
      .about-header {
        padding: 24px 16px;

        .about-title {
          font-size: 24px;
        }

        .about-subtitle {
          font-size: 16px;
        }
      }

      .about-content {
        .features-section {
          .section-title {
            font-size: 20px;
          }
        }

        .tech-section {
          padding: 16px;

          .section-title {
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>

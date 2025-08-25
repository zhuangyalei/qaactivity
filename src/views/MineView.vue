<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, Loading } from 'vant'
import http from '../utils/http'

const route = useRoute()
const router = useRouter()
const arrowUrl = ref(
  'https://rs-os-lyh-dt-publicread-picture-bosmetadata-prod.liangyihui.net/document_N/65oCJIBw2g_Ul8mXDRyaB9GRGdAXyUlF-xQHRO3zqCNrdNVrkMT5ShghJSpw9l8s/h48UUJSCDnE9NnKY5xrZvzWyZksTgBOp.png',
)
const list = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })

  // 获取问卷列表
  const postData = {
    head: { auth },
  }
  const res = (await http.post('/amtn-form/form/getFormList', postData)).data
  isLoading.value = false
  if (res.responseStatus.errorcode > 0) {
    return
  }
  list.value = res.data
})

const qaItemClick = (item) => {
  if (item.status === 0) {
    showDialog({
      title: `提示`,
      message: `问卷收集尚未开始,敬请期待`,
    }).then(() => {})
    return
  }
  if (item.isFinish === 1 || item.status === 1) {
    router.push({
      name: 'qa',
      params: { qaId: item.id },
    })
    return
  }
  if (item.status === 2 && item.isFinish !== 1) {
    showDialog({
      title: `提示`,
      message: `问卷收集已结束,敬请关注其他问卷收集活动`,
    }).then(() => {})
    return
  }
}
</script>

<template>
  <main class="page">
    <div class="page-title" v-if="!isLoading">问卷列表</div>
    <div class="list" v-if="!isLoading">
      <div class="item" v-for="(item, idx) in list" :key="idx" @click.stop="qaItemClick(item)">
        <div class="title">{{ item.name }}</div>
        <div :class="{ status: true, go: item.status === 1 }">
          {{
            item.isFinish === 1
              ? '已成功参与'
              : item.status === 1
                ? '去参加'
                : item.status === 2
                  ? '问卷已结束'
                  : '问卷未开始'
          }}
        </div>
        <div class="arrow"><img :src="arrowUrl" /></div>
      </div>
      <!-- <div class="item">
        <div class="title">短发gi值二哥偶尔过恶送肉</div>
        <div class="status">活动已结束</div>
        <div class="arrow"><img :src="arrowUrl" /></div>
      </div>
      <div class="item">
        <div class="title">二进宫而我就偶尔感觉你二哥偶尔过恶送肉</div>
        <div class="status go">去参加</div>
        <div class="arrow"><img :src="arrowUrl" /></div>
      </div> -->
    </div>
    <div class="page-loading" v-if="isLoading">
      <Loading size="36px" vertical>加载中...</Loading>
    </div>
  </main>
</template>

<style scoped lang="less">
.page {
  margin: -20px;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  &-title {
    text-align: center;
    color: #2c3e50;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    line-height: 40px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #3498db, #2ecc71);
      border-radius: 2px;
    }
  }

  .list {
    .item {
      padding: 16px;
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .title {
        flex-grow: 1;
        font-size: 16px;
        color: #2c3e50;
        font-weight: 500;
        margin-right: 12px;
      }

      .status {
        flex-shrink: 0;
        flex-grow: 0;
        width: 100px;
        text-align: right;
        margin-right: 12px;
        font-size: 14px;
        color: #95a5a6;
        transition: color 0.3s ease;

        &.go {
          color: #3498db;
          font-weight: 500;
        }
      }

      .arrow {
        img {
          width: 12px;
          vertical-align: middle;
          transition: transform 0.3s ease;
          filter: hue-rotate(121deg) saturate(100%) brightness(70%);
        }
      }

      &:hover .arrow img {
        transform: translateX(4px);
      }
    }
  }

  .page-loading {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    :deep(.van-loading__text) {
      color: #3498db;
      font-size: 16px;
      margin-top: 12px;
    }
  }
}
</style>

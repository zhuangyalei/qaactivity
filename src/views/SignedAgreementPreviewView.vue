<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, Loading } from 'vant'
import http from '../utils/http'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

const route = useRoute()
const router = useRouter()
// const qaId = ref(parseInt(route.params.id))
const qaId = ref(undefined)
const fillId = ref(undefined)
const certificateUrl = ref('')
const signedCertificateUrl = ref('')
const qaStatus = ref(0)
const isFinish = ref(false)
const isLoading = ref(true)
const interval = ref(null)

// Setting worker path to worker bundle.
// pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.mjs'
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'

const pdfPath = ref('')

// Loading a document.
const loadpdf = async () => {
  const loadingTask = pdfjsLib.getDocument({
    url: pdfPath.value,
    cMapUrl: '../../node_modules/pdfjs-dist/cmaps/', // 避免重复文件，使用web模块中提供的文件
    cMapPacked: true,
  })
  const pdfDocument = await loadingTask.promise
  // Request a first page
  const pdfPage = await pdfDocument.getPage(1)
  const scale =
    window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1
  // Display page on the existing canvas with 100% scale.
  const viewport = pdfPage.getViewport({ scale })
  const canvas = document.getElementById('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const box_w = document.body.clientWidth - 24
  const box_h = document.body.clientHeight - 24 - 64
  // console.log("box_w ->", box_w);
  // console.log("box_h ->", box_h)
  const scaleFactor = Math.min(box_w / viewport.width, box_h / viewport.height)
  // const w = viewport.width * scaleFactor
  // const h = viewport.height * scaleFactor
  canvas.style.width = viewport.width * scaleFactor + 'px'
  canvas.style.height = viewport.height * scaleFactor + 'px'
  // const scale = (document.documentElement.clientWidth - 24) / viewport.width
  // canvas.style.transform = `scale(${scale})`
  // canvas.width = document.documentElement.clientWidth - 24
  // canvas.height = viewport.height * canvas.width / viewport.width
  const ctx = canvas.getContext('2d')
  // viewport.scale = 5
  // viewport.transform = 'scale(1)'
  const renderTask = pdfPage.render({
    canvasContext: ctx,
    viewport,
  })
  await renderTask.promise

  // document.getElementsByClassName('pdf-container')[0].scroll(50, 30)
}

const refreshQaDetail = async () => {
  qaId.value = route.params.qaId ? parseInt(route.params.qaId) : undefined
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })

  // 获取问卷详情
  const qaDetailPostData = {
    head: { auth },
    data: { id: qaId.value },
  }
  const qaDetailRes = (await http.post('/amtn-form/form/getFormDetail', qaDetailPostData)).data
  if (qaDetailRes.responseStatus.errorcode > 0) {
    return
  }
  qaId.value = qaDetailRes.data.id
  fillId.value = qaDetailRes.data.fillId
  certificateUrl.value = qaDetailRes.data.certificateUrl
  signedCertificateUrl.value = qaDetailRes.data.signedCertificateUrl
  qaStatus.value = qaDetailRes.data.status
  isFinish.value = qaDetailRes.data.isFinish === 1
  pdfPath.value = signedCertificateUrl.value

  if (signedCertificateUrl.value) {
    clearInterval(interval.value)
    isLoading.value = false
    loadpdf()
  }
}

const goQaDetail = () => {
  if (qaId.value) {
    router.push({
      name: 'qa_with_id',
      params: {
        id: qaId.value,
      },
    })
  } else {
    router.push({
      name: 'qa',
      params: {},
    })
  }
}

onMounted(async () => {
  refreshQaDetail()

  clearInterval(interval.value)
  interval.value = setInterval(() => {
    refreshQaDetail()
  }, 5000)
})
</script>

<template>
  <main class="page">
    <div class="pdf-container">
      <canvas class="canvas" id="canvas"></canvas>
    </div>
    <div class="notice" v-show="!isLoading">如果看不清,可以双击屏幕或双指放大后查看</div>
    <div class="bottom" v-show="!isLoading">
      <div class="signing" @click.stop="refreshQaDetail" v-if="!signedCertificateUrl">
        协议签署中,点击刷新
      </div>
      <div class="signed" v-else @click.stop="goQaDetail">您已完成,点击回顾问卷或关闭窗口</div>
      <!-- 您已完成问卷,点击查看问卷记录 -->
    </div>
    <div class="page-loading" v-if="isLoading">
      <Loading size="36px" vertical>加载中...</Loading>
    </div>
  </main>
</template>

<style scoped lang="less">
.pdf-container {
  margin-top: -8px;
  margin-left: -8px;
  width: calc(100vw - 24px);
  height: calc(100vh - 24px - 64px);
  overflow: -moz-scrollbars-none;
  overflow: scroll;
  scroll-behavior: smooth;
  .canvas {
    width: calc(100vw - 24px);
    height: calc(100vh - 24px - 64px);
  }
}
.pdf-container::-webkit-scrollbar {
  width: 0 !important;
}
.bottom {
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 20px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;

  .signing,
  .signed {
    height: 48px;
    line-height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 24px;
    width: 100%;
    text-align: center;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .signing {
    color: #ffffff;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(52, 152, 219, 0.3);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
    }
  }

  .signed {
    // color: #95a5a6;
    // background: #f1f5f9;
    // border: 1px solid #e5e5e8;

    // &:hover {
    //   color: #3498db;
    //   border-color: #3498db;
    //   background: #ffffff;
    //   transform: translateY(-1px);
    // }

    // &:active {
    //   transform: translateY(1px);
    // }
    font-weight: 400;
    color: #454556;
    background: #ffffff;
    border: 1px solid #3498db;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);

    &:hover {
      color: #ffffff;
      background: #3498db;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(52, 152, 219, 0.1);
    }
  }
}
.page-loading {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
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

.notice {
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 80px;
  text-align: center;
  font-size: 12px;
  color: #9898a2;
}
</style>

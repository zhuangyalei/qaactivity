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

// Setting worker path to worker bundle.
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'

// const pdfPath = ref(
//   'https://bosdev.oss-cn-hangzhou.aliyuncs.com/qa-pdf/24863_sign_certificate_1747027542485.pdf',
// )
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
  const scaleFactor = Math.min(box_w / viewport.width, box_h / viewport.height)
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
    annotationMode: pdfjsLib.AnnotationMode.ENABLE_FORMS,
  })
  await renderTask.promise

  // document.getElementsByClassName('pdf-container')[0].scroll(50, 30)
}

onMounted(async () => {
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
  pdfPath.value = certificateUrl.value
  isLoading.value = false

  // 尚未完善信息 跳转去完善个人信息
  if (!certificateUrl.value) {
    showDialog({
      title: `提示`,
      message: `您尚未完善信息,前往提交个人信息`,
    }).then(() => {
      // 跳转去完善信息
      modifyInfoClick()
    })
    return
  }
  // 已完成签名 跳转去查看已签名协议
  if (isFinish.value) {
    showDialog({
      title: `提示`,
      message: `您已签署该协议,前往查看已签署协议`,
    }).then(() => {
      // 查看已签署协议协议
      router.replace({
        name: 'signed-agreement-preview',
        params: {
          qaId: qaId.value,
        },
      })
    })
    return
  }

  // 问卷 未开始、已结束 跳转去问卷列表页面
  if (qaStatus.value === 0 || qaStatus.value === 2) {
    showDialog({
      title: `提示`,
      message: `该协议不在有效期,请前往问卷列表查看参与有效问卷并签署协议`,
    }).then(() => {
      // 查看问卷列表
      router.replace({
        name: 'mine',
        params: {},
      })
    })
    return
  }

  // 检查是否都已作答
  const uncompletedAndGoQaView = () => {
    showDialog({
      title: `提示`,
      message: `问卷尚未完成无法签署协议,前往填写问卷`,
    }).then(() => {
      // 前往填写问卷
      router.replace({
        name: 'qa',
        params: {},
      })
    })
  }
  const modules = ref(qaDetailRes.data.modules)
  for (let i = 0; i < modules.value.length; i++) {
    const m = modules.value[i]
    for (let j = 0; j < m.questions.length; j++) {
      const q = m.questions[j]
      let checked = false
      let sortedCount = 0
      for (let k = 0; k < q.answers.length; k++) {
        const a = q.answers[k]
        if (q.type === 2) {
          if (a.checked === 1) {
            sortedCount++
          }
          if (!a.checked) {
            // 排序题有一个选项未排序
            // uncompletedAndGoQaView()
            // return
          } else if (a.checked === 1 && a.type === 1 && !a.content && k !== q.answers.length - 1) {
            // 非最后一项带填空但未填写内容
            uncompletedAndGoQaView()
            return
          }
        } else if ((q.type === 0 || q.type === 1) && a.checked === 1) {
          // 单选、多选题
          checked = true
          if (a.type === 1 && !a.content) {
            // 带填空但未填写内容则终止
            uncompletedAndGoQaView()
            return
          }
        } else if (q.type === 3) {
          // 填空
          // 滑块百分比题
          if (
            q.answerTotal > 0 ||
            (q.answers[0]?.answerRange?.type === 'num' && q.answers[0]?.answerRange?.max > 10)
          ) {
            const total = q.answers.reduce((pre, cur) => {
              pre += cur.content
              return pre
            }, 0)
            if (total <= 0) {
              uncompletedAndGoQaView()
              return
            }
            // if (total > q.answers[0]?.answerRange?.max) {
            //   uncompletedAndGoQaView()
            //   return
            // }
            // if (!a.content) {
            //   uncompletedAndGoQaView()
            //   return
            // }
          }
          // 评分题
          if (
            !q.answerTotal &&
            q.answers[0]?.answerRange?.type === 'num' &&
            q.answers[0]?.answerRange?.end <= 10
          ) {
            if (!a.content || a.content < 1) {
              uncompletedAndGoQaView()
              return
            }
          }
          // 纯填空题
          if (!q.answerTotal && q.answers[0]?.answerRange?.type === 'text') {
            if (!a.content) {
              uncompletedAndGoQaView()
              return
            }
          }
        }
      }
      if ((q.type === 0 || q.type === 1) && !checked) {
        uncompletedAndGoQaView()
        return
      } else if (q.type === 2) {
        // 排序题少于2项则终止
        if (sortedCount < 2) {
          uncompletedAndGoQaView()
          return
        }
      }
    }
  }

  loadpdf()
})

const modifyInfoClick = () => {
  // 跳转去完善信息
  const redirect_uri = encodeURIComponent(location.href)
  location.replace(import.meta.env.VITE_EDIT_INFO_URL + '/?redirect_uri=' + redirect_uri)
}

const goSignClick = () => {
  // 跳转去签署协议
  router.replace({
    name: 'ds',
    params: { qaId: qaId.value, fillId: fillId.value },
  })
}
</script>

<template>
  <main class="page">
    <div class="pdf-container">
      <canvas class="canvas" id="canvas" v-show="!isLoading"></canvas>
    </div>
    <div class="notice" v-show="!isLoading">
      如果看不清,可以双击屏幕或双指放大后查看<br />签署姓名后,问卷信息仅可预览不再支持进行修改
    </div>
    <div class="bottom" v-show="!isLoading">
      <div class="modify-info" @click.stop="modifyInfoClick">修改信息</div>
      <div class="go-sign" @click.stop="goSignClick">
        <div class="title">签署姓名</div>
        <div class="desc">签署后问卷不可修改</div>
      </div>
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
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  z-index: 100;

  .modify-info,
  .go-sign {
    height: 48px;
    // line-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
    border-radius: 24px;
    padding: 0 24px;
    transition: all 0.3s ease;
  }

  .modify-info {
    font-weight: 400;
    flex: 1;
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

  .go-sign {
    flex: 2;
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

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    // position: relative;
    .title {
      line-height: 18px;
    }
    .desc {
      // margin-top: 0px;
      font-size: 12px;
      line-height: 14px;
      // position: absolute;
      // bottom: 0px;
      color: rgba(255, 255, 255, 0.6);
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
  z-index: 1000;

  :deep(.van-loading__text) {
    color: #3498db;
    font-size: 16px;
    margin-top: 12px;
  }
}

.notice {
  position: fixed;
  z-index: 1000;
  left: 20px;
  right: 20px;
  bottom: 72px;
  text-align: center;
  font-size: 12px;
  line-height: 14px;
  color: #9898a2;
}
</style>

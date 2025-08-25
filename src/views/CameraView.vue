<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, Loading, Overlay } from 'vant'
import OSS from 'ali-oss'
import http from '../utils/http'

const route = useRoute()
const router = useRouter()
const qaId = ref(route.query.qaId ? parseInt(route.query.qaId) : undefined)
const isLoading = ref(true)
const showOverlay = ref(false)
const isSubmitting = ref(false)
// 摄像头实时预览
const videoRef = ref<HTMLVideoElement | null>(null)
// 可删除？
// const canvasRef = ref<HTMLCanvasElement | null>(null)
// 点击拍照预览拍摄的照片
const previewRef = ref<HTMLCanvasElement | null>(null)
const scanCanvasRef = ref<HTMLCanvasElement | null>(null)
const isCameraActive = ref(false)
const stream = ref<MediaStream | null>(null)
const showPreview = ref(false)
const scanProgress = ref(0)
const scanAngle = ref(0)
const scanInterval: number | null = null
let scanAnimation: number | null = null
// const showTipsDialog = ref(true)
// const windowWidth = ref(document.documentElement.clientWidth)
// const windowHeight = ref(document.documentElement.clientHeight)
const startCameraCount = ref(0)
// const releaseMediaStreams = (stream: MediaStream) => {
//   const tracks = stream.getTracks()
//   tracks.forEach((track) => {
//     track.stop()
//   })
// }

// 启动摄像头
const startCamera = async () => {
  startCameraCount.value++
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      // 前置摄像头
      video: { facingMode: 'user' }, // width: { min: 640, ideal: 1280, max: 1920 }
      audio: false,
    })
    // if (mediaStream.getVideoTracks().length < 1) {
    //   showDialog({
    //     title: `提示`,
    //     message: `访问摄像头失败，尝试重新获取访问摄像头权限`,
    //   }).then(() => {
    //     stopCamera()
    //     startCamera()
    //   })
    // }
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      isCameraActive.value = true
      stream.value = mediaStream
    }
    setTimeout(() => {
      const newCanvas = document.createElement('canvas')
      const newCtx = newCanvas.getContext('2d')!
      newCanvas.width = videoRef.value!.videoWidth
      newCanvas.height = videoRef.value!.videoHeight
      newCtx.drawImage(videoRef.value!, 0, 0)
      newCanvas.toBlob(
        async (blob) => {
          if (!blob) {
            if (startCameraCount.value <= 3) {
              showDialog({
                title: '提示',
                message: '访问摄像头失败，尝试重新获取访问摄像头权限',
              }).then(() => {
                refreshBtnClick()
              })
            } else {
              if (window.ISWX) {
                // 弹窗提示引导用户打开到手机浏览器操作
                showOverlay.value = true
              }
            }
          }
        },
        'image/jpeg',
        1,
      )
    }, 1500)
    // if (startCameraCount.value > 3 && ) {

    // }
    // showTipsDialog.value = false
  } catch (error) {
    // if (startCameraCount.value === 1) {
    //   startCamera()
    // }
    console.error('无法访问摄像头:', error)
    showDialog({
      title: `提示`,
      message: `访问摄像头失败，尝试重新获取访问摄像头权限`,
    }).then(() => {
      startCamera()
    })
  }
}

// 停止摄像头
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    isCameraActive.value = false
    stream.value = null
  }
}

// 开始扫描动画
const startScan = () => {
  scanProgress.value = 0
  scanAngle.value = 0
  if (scanInterval) clearInterval(scanInterval)
  if (scanAnimation) cancelAnimationFrame(scanAnimation)

  // 立即拍照
  takePhoto()

  // 开始扫描动画
  const animateScan = () => {
    if (scanCanvasRef.value) {
      const ctx = scanCanvasRef.value.getContext('2d')
      if (ctx) {
        const size = scanCanvasRef.value.width
        const center = size / 2
        const radius = size * 0.6

        // 清除画布
        ctx.clearRect(0, 0, size, size)

        // 创建渐变
        const gradient = ctx.createLinearGradient(
          center + Math.cos(scanAngle.value) * radius,
          center + Math.sin(scanAngle.value) * radius,
          center + Math.cos(scanAngle.value + Math.PI) * radius,
          center + Math.sin(scanAngle.value + Math.PI) * radius,
        )

        gradient.addColorStop(0, 'rgba(0, 255, 136, 0)')
        gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.3)')
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)')

        // 绘制扫描效果
        ctx.save()
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, Math.PI * 2)
        ctx.clip()

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, size, size)

        ctx.restore()

        // 更新角度
        scanAngle.value = (scanAngle.value + 0.02) % (Math.PI * 2)
      }
    }
    scanAnimation = requestAnimationFrame(animateScan)
  }
  animateScan()
}

const containImgRect = (box_w: number, box_h: number, img_w: number, img_h: number) => {
  // 计算缩放比例, 使图片适应容器（保持宽高比）
  const scaleFactor = Math.min(box_w / img_w, box_h / img_h)
  const w = img_w * scaleFactor
  const h = img_h * scaleFactor
  const x = (box_w - w) * 0.5
  const y = (box_h - h) * 0.5
  return {
    x,
    y,
    w,
    h,
  }
}

// 拍照
const takePhoto = async () => {
  // if (videoRef.value && canvasRef.value && previewRef.value) {
  if (videoRef.value && previewRef.value) {
    // const context = canvasRef.value.getContext('2d')
    const previewContext = previewRef.value.getContext('2d')
    // if (context && previewContext) {
    if (previewContext) {
      previewContext.clearRect(0, 0, previewRef.value.width, previewRef.value.height)
      // const size = Math.min(videoRef.value.videoWidth, videoRef.value.videoHeight)
      // canvasRef.value.width = size
      // canvasRef.value.height = size
      // previewRef.value.width = size
      // previewRef.value.height = size

      // 绘制圆形裁剪区域
      // context.save()
      // context.beginPath()
      // context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      // context.clip()
      // context.drawImage(
      //   videoRef.value,
      //   (videoRef.value.videoWidth - size) / 2,
      //   0,
      //   size,
      //   size,
      //   0,
      //   0,
      //   size,
      //   size,
      // )
      // context.restore()

      // 复制到预览画布
      // previewContext.drawImage(canvasRef.value, 0, 0)
      // console.log('videoRef.value.videoWidth =>', videoRef.value.videoWidth)
      // console.log('videoRef.value.videoHeight =>', videoRef.value.videoHeight)
      // console.log('previewRef.value.width =>', previewRef.value.width)
      // console.log('previewRef.value.height =>', previewRef.value.height)
      // console.log('previewRef.value.clientWidth =>', previewRef.value.clientWidth)
      // console.log('previewRef.value.clientHeight =>', previewRef.value.clientHeight)
      // console.log(
      //   'previewRef.value.clientHeight-videoRef.value.videoHeight/videoRef.value.videoWidth*previewRef.value.clientWidth =>',
      //   previewRef.value.clientHeight -
      //     (videoRef.value.videoHeight / videoRef.value.videoWidth) * previewRef.value.clientWidth,
      // )
      const imgRect = containImgRect(
        previewRef.value.width,
        previewRef.value.height,
        videoRef.value.videoWidth,
        videoRef.value.videoHeight,
      )
      // console.log('imgRect =>', imgRect)
      previewContext.drawImage(
        videoRef.value,
        0,
        0,
        videoRef.value.videoWidth,
        videoRef.value.videoHeight,
        imgRect.x,
        imgRect.y,
        imgRect.w,
        imgRect.h,
      )
      // console.log(previewRef.value.toDataURL('image/jpeg', 1))
      // previewContext.getImageData(imgRect.x, imgRect.y, canvas.width, canvas.height);
      const newCanvas = document.createElement('canvas')
      const newCtx = newCanvas.getContext('2d')!
      newCanvas.width = videoRef.value.videoWidth
      newCanvas.height = videoRef.value.videoHeight
      newCtx.drawImage(videoRef.value, 0, 0)
      // newCtx.putImageData(videoRef.value, 0, 0)
      // console.log(newCanvas.toDataURL('image/jpeg', 1))

      showPreview.value = true
      // isSubmitting.value = true
      if (isSubmitting.value) {
        return
      }

      try {
        isSubmitting.value = true

        // 获取照片数据
        const newCanvas = document.createElement('canvas')
        const newCtx = newCanvas.getContext('2d')!
        newCanvas.width = videoRef.value!.videoWidth
        newCanvas.height = videoRef.value!.videoHeight
        newCtx.drawImage(videoRef.value!, 0, 0)

        // const imageData = newCanvas.toDataURL('image/jpeg', 0.8)

        // 上传到OSS
        const ossInfo = await (
          await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')
        ).json()
        const ossClient = new OSS({
          region: 'oss-cn-hangzhou',
          bucket: 'bosdev',
          accessKeyId: ossInfo.AccessKeyId,
          accessKeySecret: ossInfo.AccessKeySecret,
          stsToken: ossInfo.SecurityToken,
          refreshSTSToken: async () => {
            const info = await (
              await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')
            ).json()
            return {
              accessKeyId: info.AccessKeyId,
              accessKeySecret: info.AccessKeySecret,
              stsToken: info.SecurityToken,
            }
          },
          refreshSTSTokenInterval: 900,
        })

        newCanvas.toBlob(
          async (blob) => {
            // console.log(blob)
            if (!blob) {
              showDialog({
                title: '提示',
                message: '访问摄像头失败，尝试重新获取访问摄像头权限',
              }).then(() => {
                retakePhoto()
                refreshBtnClick()
              })
              return
            }
            // 上传图片
            const result = await ossClient.put(`/qa-face/${new Date().getTime()}.jpeg`, blob, {
              mime: 'image/jpeg',
              headers: {
                'Content-Type': 'image/jpeg',
              },
            })

            const faceUrl = `https://devoss.liangyihui.net/${result.name}`

            // 提交人脸信息
            const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
            const postData = {
              head: { auth },
              data: faceUrl,
            }

            const submitRes = (await http.post('/amtn-form/user/checkUserFace', postData)).data

            if (submitRes?.responseStatus?.errorcode === 0) {
              showDialog({
                title: '提示',
                message: '人脸信息识别成功，正在跳转到问卷页面',
              }).then(() => {
                // 跳转到问卷页面
                if (qaId.value) {
                  router.replace({ name: 'qa_with_id', params: { id: qaId.value } })
                } else {
                  router.replace({ name: 'qa', params: {} })
                }
              })
            } else {
              showDialog({
                title: '提示',
                message: submitRes?.responseStatus?.message || '人脸信息识别失败，请重试',
              }).then(() => {
                isSubmitting.value = false
              })
            }
          },
          'image/jpeg',
          1,
        )
      } catch (error) {
        // console.error('提交人脸照片失败:', error)
        showDialog({
          title: '提示',
          message: '网络错误，请检查网络连接后重试',
        }).then(() => {
          isSubmitting.value = false
        })
      }
    }
  }
}

// 重新拍照
const retakePhoto = (isRealClick: boolean) => {
  if (isSubmitting.value) {
    return
  }
  if (isRealClick) {
    startCameraCount.value = 0
  }
  showPreview.value = false
  scanProgress.value = 0
  scanAngle.value = 0

  // 清除所有动画
  if (scanInterval) {
    clearInterval(scanInterval)
  }
  if (scanAnimation) {
    cancelAnimationFrame(scanAnimation)
  }

  // 清除扫描画布
  if (scanCanvasRef.value) {
    const ctx = scanCanvasRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, scanCanvasRef.value.width, scanCanvasRef.value.height)
    }
  }
}

// 提交人脸照片
const submitFacePhoto = async () => {
  if (isSubmitting.value) {
    return
  }

  try {
    isSubmitting.value = true

    // 获取照片数据
    const newCanvas = document.createElement('canvas')
    const newCtx = newCanvas.getContext('2d')!
    newCanvas.width = videoRef.value!.videoWidth
    newCanvas.height = videoRef.value!.videoHeight
    newCtx.drawImage(videoRef.value!, 0, 0)

    // const imageData = newCanvas.toDataURL('image/jpeg', 0.8)

    // 上传到OSS
    const ossInfo = await (await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')).json()
    const ossClient = new OSS({
      region: 'oss-cn-hangzhou',
      bucket: 'bosdev',
      accessKeyId: ossInfo.AccessKeyId,
      accessKeySecret: ossInfo.AccessKeySecret,
      stsToken: ossInfo.SecurityToken,
      refreshSTSToken: async () => {
        const info = await (await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')).json()
        return {
          accessKeyId: info.AccessKeyId,
          accessKeySecret: info.AccessKeySecret,
          stsToken: info.SecurityToken,
        }
      },
      refreshSTSTokenInterval: 900,
    })

    // 上传图片
    const result = await ossClient.put(
      `/face-photos/${new Date().getTime()}.jpg`,
      newCanvas.toBlob((blob) => blob),
      {
        mime: 'image/jpeg',
        headers: {
          'Content-Type': 'image/jpeg',
        },
      },
    )

    const faceUrl = `https://devoss.liangyihui.net/${result.name}`

    // 提交人脸信息
    const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
    const postData = {
      head: { auth },
      data: { faceUrl },
    }

    const submitRes = (await http.post('/amtn-form/user/updateUserInfo', postData)).data

    if (submitRes?.responseStatus?.errorcode === 0) {
      showDialog({
        title: '提交成功',
        message: '人脸信息提交成功，正在跳转到问卷页面',
      }).then(() => {
        // 跳转到问卷页面
        if (qaId.value) {
          router.replace({ name: 'qa', params: { id: qaId.value } })
        } else {
          router.replace({ name: 'mine' })
        }
      })
    } else {
      showDialog({
        title: '提交失败',
        message: submitRes?.responseStatus?.message || '人脸信息提交失败，请重试',
      }).then(() => {
        isSubmitting.value = false
      })
    }
  } catch (error) {
    console.error('提交人脸照片失败:', error)
    showDialog({
      title: '提交失败',
      message: '网络错误，请检查网络连接后重试',
    }).then(() => {
      isSubmitting.value = false
    })
  }
}

const refreshBtnClick = (isRealClick: boolean) => {
  if (isRealClick) {
    startCameraCount.value = 0
  }
  stopCamera()
  startCamera()
}

onMounted(async () => {
  const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })

  // 获取用户信息
  const userInfoPostData = {
    head: { auth },
  }
  const userInfoRes = (await http.post('/amtn-form/user/getUserInfo', userInfoPostData)).data
  // 是否录入过人脸
  // const hasFace = false
  const hasFace = userInfoRes?.data?.faceUrl?.length > 0
  if (hasFace) {
    // 直接跳转问卷页面
    router.replace({ name: 'qa' })
    return
  }
  isLoading.value = false
  showDialog({
    title: `提示`,
    message: `因合规要求请允许访问摄像头采集您的面部信息`,
  }).then(() => {
    startCamera()
  })
})

onUnmounted(() => {
  stopCamera()
  if (scanInterval) clearInterval(scanInterval)
  if (scanAnimation) cancelAnimationFrame(scanAnimation)
})
</script>

<template>
  <main class="page">
    <div class="camera-container">
      <video
        ref="videoRef"
        class="camera-feed"
        autoplay
        playsinline
        webkit-playsinline="true"
        preload="auto"
        loop
        muted
        :style="{ visibility: showPreview ? 'hidden' : 'visible' }"
      ></video>
      <canvas
        ref="previewRef"
        class="photo-preview"
        :width="videoRef?.clientWidth"
        :height="videoRef?.clientHeight"
        :style="{ visibility: showPreview ? 'visible' : 'hidden' }"
      ></canvas>
      <!-- <canvas ref="canvasRef" class="photo-canvas"></canvas> -->
      <canvas ref="scanCanvasRef" class="scan-canvas"></canvas>

      <!-- 人脸轮廓参考 -->
      <div class="face-guide" v-show="!showPreview">
        <img src="@/assets/face-outline.png" alt="人脸轮廓参考" class="face-outline" />
      </div>

      <!-- 光效 -->
      <div class="glow-effect"></div>
    </div>
    <!-- <div class="dialog" @click="startCamera" v-show="showTipsDialog">
      <div class="dialog-box">
        <div class="dialog-box-top">请允许访问摄像头</div>
        <div class="dialog-box-bottom">好的</div>
      </div>
    </div> -->
    <div class="refresh">
      <button class="refresh-btn" @click="refreshBtnClick(true)">
        <span class="btn-text">刷新</span>
        <span class="btn-glow"></span>
      </button>
    </div>
    <div class="controls">
      <button v-if="!showPreview" class="capture-btn" @click="startScan">
        <span class="btn-text">拍照</span>
        <span class="btn-glow"></span>
      </button>
      <button v-else class="capture-btn" @click="retakePhoto(true)">
        <span class="btn-text">重新拍照</span>
        <span class="btn-glow"></span>
      </button>
    </div>
    <div class="notice">如果圆形区域没有画面,请尝试点击左侧刷新按钮</div>
    <div class="page-loading" v-if="isLoading">
      <Loading size="36px" vertical>加载中...</Loading>
    </div>
    <div class="page-loading" v-show="isSubmitting">
      <Loading size="36px" vertical>识别中...</Loading>
    </div>
    <Overlay :show="showOverlay" @click="showOverlay = false" style="z-index: 100">
      <div class="wrapper" style="display: flex; align-items: center; justify-content: center">
        <img
          style="max-width: 96vw; max-height: 96vh"
          class="image"
          src="https://devoss.liangyihui.net/ys-img/1751342174483.png"
        />
      </div>
    </Overlay>
  </main>
</template>

<style lang="less" scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  padding: 20px;
  margin: -20px;
}

.dialog {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  &-box {
    border: solid 1px #e5e5e8;
    border-radius: 8px;
    width: 80vw;
    height: 130px;
    background-color: white;
    color: #454556;
    &-top {
      font-size: 18px;
      height: 86px;
      text-align: center;
      line-height: 86px;
      border-bottom: solid 1px #e5e5e8;
    }
    &-bottom {
      font-size: 16px;
      text-align: center;
      line-height: 44px;
    }
  }
}

.camera-container {
  position: relative;
  width: 280px;
  height: 280px;
  // width: 100vw;
  // height: 100vh;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.camera-feed {
  margin-left: calc(50% - 50vw);
  margin-top: calc(50% - 50vh);
  width: 100vw;
  height: 100vh;
  // object-fit: cover;
}

.photo-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin-left: calc(50% - 50vw);
  margin-top: calc(50% - 50vh);
  // object-fit: cover;
  // border-radius: 50%;
}

.photo-canvas {
  display: none;
}

.face-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  pointer-events: none;
  z-index: 1;

  .face-outline {
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0.3;
    filter: drop-shadow(0 0 5px rgba(0, 255, 136, 0.5));
  }
}

.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.refresh {
  position: fixed;
  bottom: 20px;
  left: 70px;
  transform: translateX(-50%);
  z-index: 10;
}

.notice {
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 83px;
  text-align: center;
  font-size: 12px;
  color: #9898a2;
}

.capture-btn,
.refresh-btn {
  position: relative;
  padding: 12px 30px;
  font-size: 18px;
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 30px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  .btn-text {
    position: relative;
    z-index: 1;
  }

  .btn-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(0, 255, 136, 0.2);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);

    .btn-glow {
      transform: translateX(100%);
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.refresh-btn {
  background-color: rgba(255, 255, 255, 0);
  color: rgba(0, 255, 136, 0.5);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.scan-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
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

  :deep(.van-loading__text) {
    color: #3498db;
    font-size: 16px;
    margin-top: 12px;
  }
}
</style>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SignCanvasPlus, { IOptions } from 'sign-canvas-plus'
import { showDialog } from 'vant'
import OSS from 'ali-oss'
import http from '../utils/http'

const route = useRoute()
const router = useRouter()
const qaId = ref(route.params.qaId ? parseInt(route.params.qaId) : undefined)
const fillId = ref(route.params.fillId ? parseInt(route.params.fillId) : undefined)
const isSubmitting = ref(false)

const windowWidth = ref(document.documentElement.clientWidth)
const windowHeight = ref(document.documentElement.clientHeight)
const data = ref<string | null>(null)
const options = reactive<IOptions>({
  isFullScreen: false, ////是否全屏手写 [Boolean] 可选
  isFullCover: false, //是否全屏模式下覆盖所有的元素 [Boolean]   可选
  isDpr: true, //是否使用dpr兼容高分屏 [Boolean] 可选
  lastWriteSpeed: 1, //书写速度 [Number] 可选
  lastWriteWidth: 2, //下笔的宽度 [Number] 可选
  lineCap: 'round', //线条的边缘类型 [butt]平直的边缘 [round]圆形线帽 [square] 正方形线帽
  lineJoin: 'bevel', //线条交汇时边角的类型  [bevel]创建斜角 [round]创建圆角 [miter]创建尖角。
  canvasWidth: document.documentElement.clientWidth - 24 - 44, //canvas宽高 [Number] 可选
  canvasHeight: document.documentElement.clientHeight - 24, //高度  [Number] 可选
  isShowBorder: false, //是否显示边框 [可选]
  bgColor: 'rgba(255,255,255,0)', //背景色 [String] 可选
  borderWidth: 1, // 网格线宽度  [Number] 可选
  borderColor: '#ff787f', //网格颜色  [String] 可选
  writeWidth: 5, //基础轨迹宽度  [Number] 可选
  maxWriteWidth: 30, // 写字模式最大线宽  [Number] 可选
  minWriteWidth: 5, // 写字模式最小线宽  [Number] 可选
  writeColor: '#101010', // 轨迹颜色  [String] 可选
  isSign: true, //签名模式 [Boolean] 默认为非签名模式,有线框, 当设置为true的时候没有任何线框
  imgType: 'png', //下载的图片格式  [String] 可选为 jpeg  canvas本是透明背景的.
  quality: 1, //  图片压缩系数[0-1]之间 可以选 默认为1
})
const SignCanvasPlusRef = ref<InstanceType<typeof SignCanvasPlus | null>>(null)

const isWrited = ref(false)
watch(data, (newVal: string | null, oldVal: string | null) => {
  if (newVal) {
    isWrited.value = true
  }
})

/**
 * 清除画板
 */
const canvasClear = () => {
  SignCanvasPlusRef.value.canvasClear()
  isWrited.value = false
}

/**
 * 保存图片
 */
const saveAsImg = async () => {
  if (isWrited.value === false) {
    showDialog({
      title: `提示`,
      message: `请请手写签署您的姓名后再提交`,
    }).then(() => {})
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  const img = SignCanvasPlusRef.value.saveAsImg()
  const { canvas: newCanvas, base64Str: rotatedImg } = await rotateBase64Img(img, 270)
  // console.log('============ image 的base64 ============')
  // console.log(rotatedImg)

  const ossInfo = await (await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')).json()
  const ossClient = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-hangzhou',
    // 填写Bucket名称。
    bucket: 'bosdev',
    // endpoint: 'devoss.liangyihui.net',
    // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
    accessKeyId: ossInfo.AccessKeyId,
    accessKeySecret: ossInfo.AccessKeySecret,
    // 从STS服务获取的安全令牌（SecurityToken）。
    stsToken: ossInfo.SecurityToken,
    // cname: true,
    refreshSTSToken: async () => {
      // 向您搭建的STS服务获取临时访问凭证。
      const info = await (await fetch('//fed.liangyihui.net/get_sts_token_for_oss_upload')).json()
      return {
        accessKeyId: info.AccessKeyId,
        accessKeySecret: info.AccessKeySecret,
        stsToken: info.SecurityToken,
      }
    },
    // 刷新临时访问凭证的时间间隔，单位为毫秒。
    refreshSTSTokenInterval: 900,
  })
  try {
    newCanvas.toBlob(
      async (blob) => {
        // 填写Object完整路径。Object完整路径中不能包含Bucket名称。
        // 您可以通过自定义文件名（例如exampleobject.txt）或文件完整路径（例如exampledir/exampleobject.txt）的形式实现将数据上传到当前Bucket或Bucket中的指定目录。
        // data对象可以自定义为file对象、Blob数据或者OSS Buffer。
        const options = {
          // meta: { temp: "demo" },
          mime: 'image/png',
          headers: { 'Content-Type': 'image/png' },
        }

        const result = await ossClient.put(
          `/qa-signature/${new Date().getTime()}.png`,
          blob,
          options,
        )
        // console.log(result)
        const signatureUrl = `https://devoss.liangyihui.net/${result.name}`
        // console.log('signatureUrl =>', signatureUrl)
        const submitSignature = async (signatureUrl: string) => {
          const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
          // 提交签名
          const postData = {
            head: { auth },
            data: { fillId: fillId.value, signatureUrl },
          }
          const res = (await http.post('/amtn-form/form/submitSignature', postData)).data
          if (res.responseStatus.errorcode > 0) {
            // 电子签名失败
            showDialog({
              title: `提示`,
              message: `电子签名失败,请稍后再试或联系客服处理`,
            }).then(() => {})
            return
          }
          showDialog({
            title: `提示`,
            message: `电子签名成功,前往查看已签署协议`,
          }).then(() => {
            router.replace({
              name: 'signed-agreement-preview',
              params: { qaId: qaId.value },
            })
          })
        }
        await submitSignature(signatureUrl)
        isSubmitting.value = false
      },
      'image/png',
      1,
    )
  } catch (e) {
    isSubmitting.value = false
    console.log(e)
  }
}

/**
 * 下载图片
 */
// const downloadSignImg = () => {
//   SignCanvasPlusRef.value.downloadSignImg()
// }

/**
 * 下载dealImage图片
 */
// const dealImage = () => {
//   SignCanvasPlusRef.value.dealImage()
// }

// 图片旋转方法 旋转图片 src 为路径 edg 是旋转度数
async function rotateBase64Img(src: string, edg: number) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    let imgW // 图片宽度
    let imgH // 图片高度
    // let size // canvas初始大小
    if (edg % 90 !== 0) {
      console.error('旋转角度必须是90的倍数!')
      reject('旋转角度必须是90的倍数!')
    }
    if (edg < 0) {
      edg = (edg % 360) + 360
    }
    // const quadrant = (edg / 90) % 4 // 旋转象限
    // const cutCoor = { sx: 0, sy: 0, ex: 0, ey: 0 } // 裁剪坐标
    const image = document.createElement('img')
    image.crossOrigin = 'anonymous'
    image.src = src
    // image.style.transform = 'rotate(270deg)'
    // image.setAttribute('style', `transform: rotate(${edg}deg)`)
    image.onload = function () {
      // console.log('加载了')

      // console.log('image.width => ', image.width)
      // console.log('image.height => ', image.height)
      imgW = image.width
      imgH = image.height
      // image.width = imgW
      // image.height = imgH
      if (imgH > imgW) {
        canvas.width = imgH
        canvas.height = imgW
        canvas.style.width = imgH + 'px'
        canvas.style.height = imgW + 'px'
        // const x = imgW / 2
        // const y = imgH / 2
        ctx?.translate(0, imgW)
        // 旋转是沿着左上角为圆心旋转
        ctx?.rotate((270 * Math.PI) / 180)
        ctx?.drawImage(image, 0, 0, imgW, imgH)
      } else {
        canvas.width = imgW
        canvas.height = imgH
        canvas.style.width = imgW + 'px'
        canvas.style.height = imgH + 'px'
        ctx?.drawImage(image, 0, 0, imgW, imgH)
      }
      const base64Str = canvas.toDataURL('image/png')
      resolve({ canvas, base64Str })
    }
  })
}
</script>

<template>
  <main class="page">
    <div class="container">
      <!-- <h3>Vue & Vue3 Sign Canvas 电子签名板</h3> -->
      <div class="sign-btns">
        <span class="clear" @click="canvasClear">清空</span>
        <span class="notice" v-if="windowHeight > windowWidth">请将屏幕横置在白板处签名</span>
        <span class="save" @click="saveAsImg">提交</span>
        <!-- <span class="save" @click="downloadSignImg">下载</span>
        <span class="save" @click="dealImage">压缩</span> -->
      </div>
      <div class="canvas-bg"></div>
      <SignCanvasPlus
        class="sign-canvas"
        ref="SignCanvasPlusRef"
        :options="options"
        v-model="data"
      />
    </div>
    <div class="page-loading" v-show="isSubmitting">
      <Loading size="36px" vertical></Loading>
    </div>
  </main>
</template>

<style lang="less" scoped>
.page {
  font-weight: normal;
}

.container {
  margin: -20px;
  font-weight: normal;
  text-align: center;
  background-color: lightgray;
  width: 100vw;
  height: 100vh;
  padding: 12px;
  // display: flex;
}

.canvas-bg {
  position: absolute;
  top: 12px;
  right: 12px;
  width: calc(100vw - 24px - 44px);
  height: calc(100vh - 24px);
  background-color: #fcc;
  border: solid 1px #ff787f;
  pointer-events: none;
  z-index: 0;
}

.sign-canvas {
  // flex-grow: 1;
  margin-left: 44px;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.preview-img {
  display: block;
  margin: 20px auto;
}

.control {
  width: 350px;
  margin: 20px auto;
  font-size: 14px;
}

ul {
  text-align: left;

  li {
    list-style: none;
    padding: 4px 10px;
  }
}

.sign-btns {
  position: absolute;
  left: 12px;
  top: 12px;
  // height: 28px;
  // width: calc(100vh - 40px);
  width: 36px;
  height: calc(100vh - 40px);
  // transform: rotate(90deg);
  display: flex;
  justify-content: space-around;
  flex-direction: column;
}

.clear,
.save,
.notice {
  width: 200px;
  height: 36px;
  line-height: 36px;
  border: 1px solid #eee;
  background: #e1e1e1;
  border-radius: 4px;
  text-align: center;
  // margin: 20px auto;
  cursor: pointer;
  transform: rotate(90deg) translateY(80px);
}

.notice {
  border: none;
  background-color: rgba(255, 255, 255, 0);
  border: none;
  color: #9898a2;
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

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import http from './utils/http'

onMounted(async () => {
  // console.log(location.href.split('#')[0])
  if (/micromessenger/gi.test(navigator.userAgent.toLowerCase())) {
    // 获取问卷详情
    const auth = await window.forceGetAuth({ pageSource: 'activity_project_ent_2025qa' })
    const qaDetailPostData = { head: { auth }, data: {} }
    const qaDetailRes = (await http.post('/amtn-form/form/getFormDetail', qaDetailPostData)).data

    const url = location.href.split('#')[0]
    const res = (await http.post(import.meta.env.VITE_WXSHARE_API_URL, { url })).data
    console.log('res ->', res)
    /**
    {
      appId: "wxcf1da541faf78511"
      nonceStr: "WX3NqyPntMts3fz7"
      signature: "54e0d0338089e03aab7cc0eaf640c5aba16a3e4c"
      timestamp: 1747044128
      url: "https://demom.liangyihui.net/"
    }
    */
    wx?.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: res.appId, // 必填，公众号的唯一标识
      timestamp: res.timestamp, // 必填，生成签名的时间戳
      nonceStr: res.nonceStr, // 必填，生成签名的随机串
      signature: res.signature, // 必填，签名
      jsApiList: ['hideMenuItems', 'updateAppMessageShareData', 'updateTimelineShareData'], // 必填，需要使用的JS接口列表
    })

    const title = qaDetailRes.data.shareTitle
    const desc = qaDetailRes.data.shareSubTitle
    const link = `https:${import.meta.env.VITE_WEB_URL}/qa`
    const imgUrl = qaDetailRes.data.shareImageUrl
    wx?.ready(function () {
      //需在用户可能点击分享按钮前就先调用
      wx?.hideMenuItems({
        menuList: [
          'menuItem:copyUrl',
          'menuItem:originPage',
          'menuItem:readMode',
          // 'menuItem:openWithQQBrowser',
          // 'menuItem:openWithSafari',
          'menuItem:share:email',
          'menuItem:share:brand',
        ], // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
      })

      wx?.updateAppMessageShareData({
        title: title, // 分享标题
        desc: desc, // 分享描述
        link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrl, // 分享图标
        success: function () {
          // 设置成功
        },
      })
      wx?.updateTimelineShareData({
        title: title, // 分享标题
        link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: imgUrl, // 分享图标
        success: function () {
          // 设置成功
        },
      })
    })
  }
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>

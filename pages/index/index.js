//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    fps: 24, // 动画帧
    screenWidth: 0, // 屏幕宽度
    screenHeight: 0, // 屏幕高度
    videoWidth: 0, // video 元素宽度，对应canvas元素宽度
    videoHeight: 0 // video 元素高度，对应canvas元素高度
  },
  canvasIdErrorCallback: function (e) {
    console.error('canvas画布启动失败：' + e.detail.errMsg)
  },
  onReady: function () {
    this.initCanvas()
    console.log(this.data.fps)
    // this.interval = setInterval(this.drawBall, 17)
  },
  initCanvas: function () {
    
    var context = wx.createContext()
    context.beginPath(0)
    context.arc(150, 50, 5, 0, Math.PI * 2)
    context.setFillStyle('#f46a64')
    context.setStrokeStyle('rgba(1,1,1,0)')
    context.fill()
    context.stroke()

    wx.drawCanvas({
      canvasId: 'canvas',
      actions: context.getActions()
    })
  }
})

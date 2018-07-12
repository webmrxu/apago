//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false
  },
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  onReady: function () {
    this.initCanvas()
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

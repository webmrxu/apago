//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    fps: 24, // 动画帧
    screenWidth: 0, // 屏幕宽度
    screenHeight: 0, // 屏幕高度
    videoWidth: 0, // video 元素宽度，对应canvas元素宽度
    videoHeight: 0, // video 元素高度，对应canvas元素高度
    videoContext: {},
    currentTime: 0
  },
  animationFrames: { // 保存视频时间对应的动画片段，动画间隔最小为 100毫秒
    1000: () => { console.log('animation on frames')}
  },
  canvasIdErrorCallback: function (e) {
    console.error('canvas画布启动失败：' + e.detail.errMsg)
  },
  onReady: function () {
    /**
     * 页面初始化
     */
    this.initPage()
    /**
     * 页面元素事件绑定
     */
    this.bindEvent()

    this.initCanvas()
    console.log(this)
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
  },
  bindtimeupdate: function(event) {
    /**
     * 视频播放触发事件，获取视频播放信息，进度
     */
    let currentTIme = event.detail.currentTime.toFixed(1) * 1000;
    // 播放时间映射到动画
    this.timeMappingAnimation(currentTIme);
    // 保存动画播放时间
    this.setData({
      currentTime: currentTIme
    })
    // pageObj.currentTime = currentTIme;
  },
  timeMappingAnimation: function (currentTime){
    let gapTimes = (currentTime - this.data.currentTime) / 100;
    for (let i = 0; i < gapTimes; i++) {
      let keyAnimation = '' + (this.data.currentTime + i * 100);
      if (this.animationFrames[keyAnimation]) {
        console.log(keyAnimation)
        let anima = this.animationFrames[keyAnimation];
        anima();
      }
    }
  },
  bindEvent: function() {
    // this.videoContext
  },
  initPage: function() {
    /**
     * 获取视频组件上下文
     */
    this.videoContext = wx.createVideoContext('video')
    this.setData({
      videoContext: wx.createVideoContext('video')
    })
    this.videoContext.play()
    /**
     * 获取窗口的宽度和高度
     */
    wx.getSystemInfo({
      success: (system) => {
        this.setData({
          screenWidth: system.windowWidth,
          screenHeight: system.windowHeight
        })
      }
    })
    /**
     * 获取视频元素的宽度和高度
     */
    let query = wx.createSelectorQuery().select('#video').boundingClientRect()
    query.exec((res) => {
      this.setData({
        videoWidth: res[0].width,
        videoHeight: res[0].height
      })
    })
    
  }
})

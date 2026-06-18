export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/appeals/index',
    'pages/rectifications/index',
    'pages/detail/index',
    'pages/appeal-form/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165DFF',
    navigationBarTitleText: '景区舆情监测',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F6F7'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#165DFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '舆情首页'
      },
      {
        pagePath: 'pages/appeals/index',
        text: '申诉记录'
      },
      {
        pagePath: 'pages/rectifications/index',
        text: '整改提醒'
      }
    ]
  }
})

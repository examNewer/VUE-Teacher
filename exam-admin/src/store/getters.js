const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  userName: state => state.user.userName,
  adminTid: state => state.user.adminTid,
  userInfo: state => state.user.userInf,
  routes: state => state.router.routes
}
export default getters

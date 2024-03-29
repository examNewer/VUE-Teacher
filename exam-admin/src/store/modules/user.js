import Cookies from 'js-cookie'
import userApi from '@/api/user'
// initial state
const state = {
  userName: Cookies.get('adminUserName'),
  adminTid: Cookies.get('adminTid'),
  userInfo: Cookies.get('adminUserInfo')
}

// actions
const actions = {
  initUserInfo ({ commit }) {
    userApi.getCurrentUser().then(re => {
      commit('setUserInfo', re.response)
    })
  }
}

// mutations
const mutations = {
  setUserName (state, userName) {
    state.userName = userName
    Cookies.set('adminUserName', userName, { expires: 30 })
  },
  setAdminTid (state, adminTid) {
    state.adminTid = adminTid
    Cookies.set('adminTid', adminTid, { expires: 30 })
  },
  setUserInfo: (state, userInfo) => {
    state.userInfo = userInfo
    Cookies.set('adminUserInfo', userInfo, { expires: 30 })
  },
  clearLogin (state) {
    Cookies.remove('adminUserName')
    Cookies.remove('adminTid')
    Cookies.remove('adminUserInfo')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

import { post } from '@/utils/request'

export default {
  index: () => post('/api/dashboard/index')
}

import { post } from '@/utils/uploadConfig'

export default {
  uploadSumit: file => post('/api/upload', file)
}

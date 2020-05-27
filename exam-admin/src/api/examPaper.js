import { post } from '@/utils/request'

export default {
  pageList: query => post('/api/exam/page', query),
  taskExamPage: query => post('/api/admin/exam/paper/taskExamPage', query),
  edit: query => post('/api/exam/edit', query),
  select: id => post('/api/exam/select/' + id),
  deletePaper: id => post('/api/exam/delete/' + id)
}

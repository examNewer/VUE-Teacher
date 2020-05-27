import { post } from '@/utils/request'

export default {
  pageList: query => post('/api/exercises/page', query),
  edit: query => post('/api/exercises/edit', query),
  select: id => post('/api/exercises/select/' + id),
  deleteQuestion: id => post('/api/exercises/delete/' + id)
}

import { post } from '@/utils/request'

export default {
  list: query => post('/api/exam/subject/list'),
  pageList: query => post('/api/Curriculum/subject/page', query),
  edit: query => post('/api/Curriculum/subject/edit', query),
  select: id => post('/api/Curriculum/subject/select/' + id),
  deleteSubject: id => post('/api/Curriculum/subject/delete/' + id)
}

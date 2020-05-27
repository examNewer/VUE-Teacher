<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">
      <el-form-item label="类别" prop="ceId" required>
        <el-select v-model="form.ceId" placeholder="类别"  clearable>
          <el-option v-for="item in subjectFilter" :key="item.ceId" :value="item.ceId" :label="item.ceName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建人:" prop="tid" v-show="false" >
        <el-input v-model="form.tid" />
      </el-form-item>
      <el-form-item label="题干：" prop="ename" required>
        <el-input v-model="form.ename"   @focus="inputClick(form,'ename')" />
      </el-form-item>
      <el-form-item label="选项：" required>
        <el-form-item :label="item.prefix" :key="item.prefix"  v-for="(item,index) in form.items"  label-width="50px" class="question-item-label">
          <el-input v-model="item.prefix"  style="width:50px;" />
          <el-input v-model="item.content"   @focus="inputClick(item,'content')"  class="question-item-content-input"/>
           <el-button type="danger" size="mini" class="question-item-remove" icon="el-icon-delete" @click="questionItemRemove(index)"></el-button>
        </el-form-item>
      </el-form-item>
      <el-form-item label="解析：" prop="comment" required>
        <el-input v-model="form.comment"  @focus="inputClick(form,'comment')" />
      </el-form-item>
      <el-form-item label="分数：" prop="score" required>
        <el-input-number v-model="form.score" :precision="1" :step="1" :max="100"></el-input-number>
      </el-form-item>
      <el-form-item label="难度：" required>
        <el-rate v-model="form.difficulty" class="question-item-rate"></el-rate>
      </el-form-item>
      <el-form-item label="正确答案：" prop="answer" required>
        <el-radio-group v-model="form.answer">
          <el-radio  v-for="item in form.items"  :key="item.prefix"  :label="item.prefix">{{item.prefix}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="success" @click="questionItemAdd">添加选项</el-button>
        <el-button type="success" @click="showQuestion">预览</el-button>
      </el-form-item>
    </el-form>
    <el-dialog  :visible.sync="richEditor.dialogVisible"  append-to-body :close-on-click-modal="false" style="width: 100%;height: 100%"   :show-close="false" center>
      <Ueditor @ready="editorReady"/>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editorConfirm">确 定</el-button>
        <el-button @click="richEditor.dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="questionShow.dialog" style="width: 100%;height: 100%">
      <QuestionShow :qType="questionShow.qType" :question="questionShow.question" :qLoading="questionShow.loading"/>
    </el-dialog>
  </div>
</template>

<script>
import QuestionShow from '../components/Show'
import Ueditor from '@/components/Ueditor'
import { mapGetters, mapState, mapActions } from 'vuex'
import questionApi from '@/api/question'

export default {
  components: {
    Ueditor, QuestionShow
  },
  data () {
    return {
      form: {
        id: null,
        questionType: 1,
        ceId: null,
        tid: null,
        ename: '',
        items: [
          { prefix: 'A', content: '' },
          { prefix: 'B', content: '' },
          { prefix: 'C', content: '' },
          { prefix: 'D', content: '' }
        ],
        comment: '',
        answer: '',
        score: '',
        type: '单选题',
        difficulty: 0
      },
      subjectFilter: null,
      formLoading: false,
      rules: {
        ceId: [
          { required: true, message: '请选择类别', trigger: 'change' }
        ],
        ename: [
          { required: true, message: '请输入题干', trigger: 'blur' }
        ],
        comment: [
          { required: true, message: '请输入解析', trigger: 'blur' }
        ],
        score: [
          { required: true, message: '请输入分数', trigger: 'blur' }
        ],
        answer: [
          { required: true, message: '请选择正确答案', trigger: 'change' }
        ]
      },
      richEditor: {
        dialogVisible: false,
        object: null,
        parameterName: '',
        instance: null
      },
      questionShow: {
        qType: 0,
        dialog: false,
        question: null,
        loading: false
      }
    }
  },
  created () {
    let id = this.$route.query.id
    let _this = this
    if (_this.form.tid == null) {
      _this.form.tid = this.$store.getters.adminTid
    }
    this.initSubject(function () {
      _this.subjectFilter = _this.subjects
    })
    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      questionApi.select(id).then(re => {
        _this.form = re.response
        _this.formLoading = false
      })
    }
  },
  methods: {
    editorReady (instance) {
      this.richEditor.instance = instance
      let currentContent = this.richEditor.object[this.richEditor.parameterName]
      this.richEditor.instance.setContent(currentContent)
      // 光标定位到Ueditor
      this.richEditor.instance.focus(true)
    },
    inputClick (object, parameterName) {
      this.richEditor.object = object
      this.richEditor.parameterName = parameterName
      this.richEditor.dialogVisible = true
    },
    editorConfirm () {
      let content = this.richEditor.instance.getContent()
      this.richEditor.object[this.richEditor.parameterName] = content
      this.richEditor.dialogVisible = false
    },
    questionItemRemove (index) {
      this.form.items.splice(index, 1)
    },
    questionItemAdd () {
      let items = this.form.items
      let last = items[items.length - 1]
      let newLastPrefix = String.fromCharCode(last.prefix.charCodeAt() + 1)
      items.push({ id: null, prefix: newLastPrefix, content: '' })
    },
    submitForm () {
      let _this = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true
          questionApi.edit(this.form).then(re => {
            if (re.code === 1) {
              _this.$message.success(re.message)
              _this.delCurrentView(_this).then(() => {
                _this.$router.push('/exam/question/list')
              })
            } else {
              _this.$message.error(re.message)
              this.formLoading = false
            }
          }).catch(e => {
            this.formLoading = false
          })
        } else {
          return false
        }
      })
    },
    resetForm () {
      this.$refs['form'].resetFields()
    },
    levelChange () {
      this.form.subjectId = null
      this.subjectFilter = this.subjects.filter(data => data.level === this.form.gradeLevel)
    },
    showQuestion () {
      this.questionShow.dialog = true
      this.questionShow.qType = this.form.questionType
      this.questionShow.question = this.form
      console.log(this.questionShow.question)
    },
    ...mapActions('exam', { initSubject: 'initSubject' }),
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      questionTypeEnum: state => state.exam.question.typeEnum,
      levelEnum: state => state.user.levelEnum
    }),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>

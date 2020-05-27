<template>
  <div class="app-container">
    <el-form :model="form"
             ref="form"
             label-width="100px"
             v-loading="formLoading">
      <el-form-item label="类型：">
        <el-select v-model="form.ceId"
                   placeholder="年级"
                   clearable>
          <el-option v-for="item in subjects"
                     :key="item.ceId"
                     :value="item.ceId"
                     :label="item.ceName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="课程名："
                    required>
        <el-input v-model="form.cname"></el-input>
      </el-form-item>
      <el-form-item label="创建人："
                    required>
        <el-input v-model="form.tid"></el-input>
      </el-form-item>
      <el-form-item label="课程封面：">
        <el-upload class="upload-demo"
                   :action="'/api/upload'"
                   multiple
                   :limit="1"
                   name="img"
                   :file-list="fileList"
                   :before-upload="handleBeforeUpload"
                   :on-preview="handlePreview"
                   :on-exceed="handleExceed"
                   list-type="picture-card"
                   :on-success="handleSuccess">

          <el-button size="small"
                     type="primary">点击上传</el-button>
          <div slot="tip"
               class="el-upload__tip">只能上传jpg/png文件，且不超过50kb</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="课节列表">
        <el-table :data="tableData"
                  style="width: 100%"
                  max-height="250">
          <el-table-column fixed
                           prop="sname"
                           label="课节名称"
                           width="150">
          </el-table-column>
          <el-table-column prop="time"
                           label="课节时间"
                           width="120">
          </el-table-column>
          <el-table-column prop="video"
                           label="课节时间"
                           width="120">
          </el-table-column>
          <el-table-column label="操作"
                           width="120">
            <template slot-scope="scope">
              <el-button type="text"
                         @click="open(scope.row)"
                         size=”text>查看</el-button>
              <el-button type="text"
                         size="small">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-dialog title="提示"
                 :visible.sync="dialogVisible"
                 width="100%">
        <div id="dplayer"></div>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
      <el-form-item>
        <el-button type="primary"
                   @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- <div id="dplayer"></div> -->
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import subjectApi from '@/api/subject'

import DPlayer from 'dplayer'
export default {
  data () {
    return {
      form: {
        ceId: null,
        cid: null,
        cname: '',
        tid: null,
        introduceImg: '',
        sectionItem: []
      },
      fileList: [],
      hideUpload: false,
      limitCount: 1,
      uploadLoading: false,
      acceptFileType1: '.jpg',
      acceptFileType2: '.png',
      url: '',
      formLoading: false,
      tableData: [],
      dialogVisible: false
    }
  },
  created () {
    this.initSubject()
    let id = this.$route.query.id
    let _this = this
    if (_this.form.tid == null) {
      _this.form.tid = this.$store.getters.adminTid
    }
    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      subjectApi.select(id).then(re => {
        this.tableData = re.response.sectionItems
        console.log(this.tableData)
        // eslint-disable-next-line no-unused-vars
        var pictureList = [re.response.introduceImg]
        _this.fileList = pictureList.map(item => {
          return {
            name: item,
            url: 'http://106.13.209.161/' + item
          }
        })
        _this.form = re.response
        _this.formLoading = false
      })
    }
  },
  methods: {
    submitForm () {
      let _this = this
      this.formLoading = true
      subjectApi
        .edit(this.form)
        .then(data => {
          if (data.code === 1) {
            _this.$message.success(data.message)
            _this.delCurrentView(_this).then(() => {
              _this.$router.push('/education/subject/list')
            })
          } else {
            _this.$message.error(data.message)
            _this.formLoading = false
          }
        })
        .catch(e => {
          _this.formLoading = false
        })
    },
    addTitle () {
      this.form.sectionItem.push({
        name: '',
        sectionItem: []
      })
    },
    resetForm () {
      this.$refs['form'].resetFields()
    },
    uploadFile () {
      this.uploadLoading = false
      var that = this
      this.fileList = []
      this.uploadTemplateDialog = true
      setTimeout(function () {
        that.$refs.upload.clearFiles()
      }, 100)
    },
    // 文件超出个数限制时的钩子
    handleExceed (files, fileList) {
      this.$message.error({
        duration: 1000,
        message: '最多只能上传' + fileList.length + '个文件'
      })
    },
    submitUpload () {
      this.uploadLoading = true
      var that = this
      setTimeout(function () {
        if (that.$refs.upload.$children[0].fileList.length === 1) {
          that.$refs.upload.submit()
        } else {
          that.uploadLoading = false
          that.$message({
            type: 'error',
            showClose: true,
            duration: 3000,
            message: '请选择文件!'
          })
        }
      }, 100)
    },
    handleRemove (file, fileList) {
      this.hideUpload = fileList.length >= this.limitCount
      console.log(file, fileList)
    },
    // 点击上传的文件列表时的钩子函数
    handlePreview (file) {
      // window.open(file.url);
      this.url = file.url
    },
    // 文件上传后的回调函数
    handleSuccess (response, file, fileList) {
      // response 上传之后的返回值
      file.url = 'http://106.13.209.161/' + response
      // 第二个例子
      this.form.introduceImg = response
      console.log(this.form.introduceImg)
    },
    // 文件上传之前，调用该方法，如果返回false终止文件上传
    handleBeforeUpload (file) {
      // 只能上传png和jpg文件
      let name = file.name
      let extList = ['png', 'jpg']
      let ext = name.substring(name.lastIndexOf('.') + 1)
      if (!extList.includes(ext)) {
        this.$message.error('这个文件类型不能上传')
        return false
      }
      // 上传文件不能大于50k
      if (file.size > (1024 * 50)) {
        this.$message.error('文件不能大于50k')
        return false
      }
    },
    handleClick (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => { })
    },
    open (row) {
      console.log(this.tableData)
      console.log(row.video)
      let _this = this
      this.dialogVisible = true
      this.$nextTick(function () {
        console.log(_this.tableData)
        // eslint-disable-next-line no-unused-vars
        const dp = new DPlayer({
          container: document.getElementById('dplayer'),
          video: {
            url: row.video
          }
        })
      })
    },
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' }),
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    DPlayer,
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      levelEnum: state => state.user.levelEnum
    }),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
<style>
.hide .el-upload--picture {
  display: none;
}
</style>

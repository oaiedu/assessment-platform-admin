<template>
  <v-container>
    <v-row>
      <v-col>
        <editor v-model="content"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MarkdownItVue from 'markdown-it-vue'
import 'tui-editor/dist/tui-editor.css';
import 'tui-editor/dist/tui-editor-contents.css';
import 'codemirror/lib/codemirror.css';
require('tui-editor/dist/tui-editor-contents.css');
require('highlight.js/styles/github.css');
import { Viewer } from '@toast-ui/vue-editor'
import { Editor } from '@toast-ui/vue-editor'

export default {
  name: 'Combined',
  props: ["questionDescription"],
  components: {
    Editor,
    'viewer': Viewer,
    MarkdownItVue
  },
  methods: {
    parseText(){
      // this.text = []
      // var result = this.content.match(/\$\$(.*?)\$\$/gi)
      // var newText = this.content.replace(/\$\$(.*?)\$\$/gi,"<<!!>>")
      // var splitted = newText.split("<<!!>>")
      // var counter = 0
      // if(result==null)
      //   result = []
      // splitted.forEach((item, index) => {
      //   this.text.push({"tag":"text","value":item})
      //   if(index<(splitted.length+result.length-2) && result!=null)
      //     this.text.push({"tag":"math","value":result[index]})
      // })
    }
  },
  watch: {
    questionDescription(val){
      if(val != '')
        this.content = val
    },
    content(val){
      this.$emit("inputData",val);
    }
  },
  data: () => ({
    content: '',
    text: [],
  })
};
</script>

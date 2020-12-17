<template>
  <v-data-table
    v-model="selectedPapers"
    :headers="headers"
    :items="papers"
    :page.sync="page"
    :items-per-page="itemsPerPage"
    :search="search"
    show-select
    item-key="id"
    hide-default-footer
    class="elevation-1"
    @page-count="pageCount = $event"
  ></v-data-table>
</template>

<script>
export default {
  data(){
    return {
      search: '',
      selectedPapers: [],
      itemsPerPage: 10,
      pageCount: 15,
      page: 1,
      headers: [
        { text: "Nome", align: "left",  value: "name" },
      ]
    }
  },
  computed: {
    papers(){
      let papers = JSON.stringify(this.$store.getters.loadedPapers);
      papers = JSON.parse(papers);
      console.log("papers: ", typeof papers);
      let aux = [
        {id: "introduction", description: "", image: "", name: "Introdução"},
        {id: "questions", description: "", image: "", name: "Referência de Questões"},
        {id: "statistics", description: "", image: "", name: "Estatísticas"},
        {id: "answers", description: "", image: "", name: "Introdução"}
      ];
      aux.forEach( element => {
        papers.push(element)
      });
      return papers;
    }
  }
}
</script>

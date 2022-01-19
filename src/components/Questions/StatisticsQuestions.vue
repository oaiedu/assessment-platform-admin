<template>
  <div>
    <v-simple-table dense>
      <template v-slot:default>
        <thead class="grey lighten-2">
          <tr class="font-weight-bold">
            <th class="text-left">DISCIPLINA</th>
            <th class="text-center">QUESTÕES</th>
            <th class="text-center">PARTICIPAÇÃO</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in statistics" :key="item.name" style="height: 40px">
            <td class="text-left">{{ item.name }}</td>
            <td class="text-center">{{ item.questions }}</td>
            <td class="text-center">
              {{
                numberOfQuestions > 0
                  ? ((item.questions * 100) / numberOfQuestions).toFixed(2)
                  : "0"
              }}%
            </td>
          </tr>
        </tbody>
        <thead class="grey lighten-2">
          <tr>
            <th class="text-right">TOTAL</th>
            <th class="text-center">{{ numberOfQuestions }}</th>
            <th class="text-center">
              {{ numberOfQuestions > 0 ? "100" : "0" }}%
            </th>
          </tr>
        </thead>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
export default {
  props: ["statistics", "numberOfQuestions"]
};
</script>

<style>
.v-data-table--dense th {
  height: 48px;
  font-weight: 700;
  border-top: thin solid rgba(0, 0, 0, 0.12);
}
</style>

<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-on="on" v-bind="attrs" text class="pa-2 px-1 ml-2">
        <span class="language__activator">
          <img
            left
            class="language__image mr-2"
            :src="
              require('../assets/flags/' +
                languages[selectedLanguage].value +
                '.svg')
            "
          />

          {{ languages[selectedLanguage].text }}

          <v-icon class="ml-1">{{ mdiChevronDown }}</v-icon>
        </span>
      </v-btn>
    </template>

    <v-list class="pa-1">
      <v-list-item
        v-for="item in languages"
        :key="item.text"
        @click="setLanguage(item)"
      >
        <img
          left
          class="language__image mr-2"
          :src="require('../assets/flags/' + item.value + '.svg')"
        />

        <v-list-item-title>{{ item.text }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mdiChevronDown } from "@mdi/js";

export default {
  name: "LanguagePicker",
  data() {
    return {
      mdiChevronDown,
      selectedLanguage: 0,
      languages: [
        {
          text: "English",
          value: "en"
        },
        {
          text: "Español",
          value: "es"
        },
        {
          text: "Português",
          value: "pt"
        }
      ]
    };
  },
  methods: {
    setLanguage(item) {
      this.$i18n.locale = item.value;
      this.setSelected();

      window.localStorage.setItem("cqg__language", item.value);
    },
    setSelected() {
      this.selectedLanguage = this.languages.findIndex(
        l => l.value === this.$i18n.locale
      );
    }
  },
  mounted() {
    this.setSelected();
  }
};
</script>

<style>
.language__activator {
  display: flex;
  align-items: center;
}

.language__image {
  width: 34px;
  height: 26px;

  border-radius: 3px;

  object-fit: cover;
}
</style>

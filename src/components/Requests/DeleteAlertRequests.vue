<template>
  <div>
    <v-alert
      v-if="confirmCondition"
      text
      prominent
      type="warning"
      color="red"
      :icon="mdiAlert"
    >
      {{ $t("TEST.DELETE_ALERT.success") }}
    </v-alert>

    <v-alert
      v-if="itemsCondition"
      text
      prominent
      type="warning"
      color="red"
      :icon="mdiAlert"
    >
      {{ itemsText }}
      <br />
      {{ items }}
    </v-alert>
  </div>
</template>

<script>
import { mdiAlert } from "@mdi/js";

export default {
  name: "DeleteAlertRequests",
  props: ["confirmCondition", "itemsCondition", "itemsText", "items"],
  data() {
    return {
      mdiAlert
    };
  }
};
</script>

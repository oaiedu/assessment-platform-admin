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

      <div v-if="isAdmin">
        <br />
        {{ $t("TEST.DELETE_ALERT.marked") }}
        <br />
        {{ adminItems }}
      </div>
    </v-alert>
  </div>
</template>

<script>
import { mdiAlert } from "@mdi/js";

export default {
  name: "DeleteAlertTests",
  props: [
    "confirmCondition",
    "itemsCondition",
    "itemsText",
    "items",
    "isAdmin",
    "adminItems"
  ],
  data() {
    return {
      mdiAlert
    };
  }
};
</script>

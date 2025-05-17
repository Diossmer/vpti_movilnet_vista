<script setup>
import { defineProps } from 'vue';

defineProps({
  avisos: {
    type: Object,
    default: null
  },
  avisosAlert: {
    type: Object,
    default: null
  }
});
</script>

<template>
  <div class="container">
    <div class="col-12 badge text-wrap alert alert-success" role="alert" v-if="avisos?.mensaje">
      {{ avisos.mensaje }}
      <div class="row" v-if="avisos.estatus">
        <div class="col-4"><label>cargados:</label>{{ avisos.estatus?.cargados }}</div>
        <div class="col-4"><label>fallidos:</label>{{ avisos.estatus?.fallidos }}</div>
        <div class="col-4"><label>pendientes:</label>{{ avisos.estatus?.pendientes }}</div>
      </div>
    </div>
    <div class="col-12 badge text-wrap alert alert-danger" role="alert" v-else-if="avisos?.error || avisos">
      {{ avisos?.cargo_id || avisos?.departamento_id || avisos?.error || avisos }}
    </div>
    <div class=" col-12 badge text-wrap alert" role="alert" v-else-if="avisosAlert">
      <div v-for="(error, index) in avisosAlert?.error.split('|')" :key="index">
          {{ error.trim() }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>

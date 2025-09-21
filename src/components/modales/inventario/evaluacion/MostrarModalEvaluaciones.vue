<script setup>
import { ref, computed, defineProps } from 'vue';

const props = defineProps({
  paramsE: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  relations: {
    type: Array,
    default: () => [[], []],
  }
});

const searchQuery = ref('');

const filteredProductos = computed(() => {
  if (!searchQuery.value) {
    return props.paramsE.productos;
  }
  return props.paramsE.productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<template>
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Evaluación del producto</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>estado fisico: </b>{{ paramsE.estado_fisico }}</p>
              </div>
              <div class="col-6">
                <p><b>escala: </b>{{ paramsE.escala }}</p>
              </div>
              <div class="col-6">
                <p><b>compatibilidad: </b>{{ paramsE.compatibilidad }}</p>
              </div>
              <div class="col-6">
                <p><b>reemplazo: </b>{{ paramsE.reemplazo }}</p>
              </div>
              <div class="col-6">
                <p><b>mantenimineto: </b>{{ paramsE.mantenimineto }}</p>
              </div>
              <div class="col-12">
                <p><b>observación: </b>{{ paramsE.notas }}</p>
              </div>
              <hr class="border-4 border-primary opacity-75">
              <div class="col-6">
                <p><b>modelo: </b>{{ paramsE?.descripcion?.modelo }}</p>
              </div>
              <div class="col-6">
                <p><b>codigo: </b>{{ paramsE?.descripcion?.codigo }}</p>
              </div>
              <div class="col-6">
                <p><b>dispositivo: </b>{{ paramsE?.descripcion?.dispositivo }}</p>
              </div>
              <div class="col-6">
                <p><b>serial: </b>{{ paramsE?.descripcion?.serial }}</p>
              </div>
              <div class="col-6">
                <p><b>marca: </b>{{ paramsE?.descripcion?.marca }}</p>
              </div>
              <div class="col-6">
                <p><b>codigo_inv: </b>{{ paramsE?.descripcion?.codigo_inv }}</p>
              </div>
              <div class="col-6">
                <p><b>descripcion: </b>{{ paramsE?.descripcion?.observacion }}</p>
              </div>
              <div class="col-6">
                <p><b>estatus: </b>{{ paramsE.estatus?.nombre }}</p>
              </div>
              <div class="col-3">
                <p><b class="text-red fw-bolder">cantidad de productos: </b>{{ filteredProductos?.length }}</p>
              </div>
              <div class="col-9">
                <p><b class="text-red fw-bolder">productos: </b></p>
                <input type="text" v-model="searchQuery" class="form-control mb-2" placeholder="Buscar producto...">
                <div class="product-list-container" style="max-height: 200px; overflow-y: auto;">
                  <ul v-if="filteredProductos && filteredProductos.length">
                    <li v-for="producto in filteredProductos" :key="producto.id">
                      {{ producto.nombre }}
                    </li>
                  </ul>
                  <p v-else class="text-muted">No se encontraron productos.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Regresar</button>
          </div>
        </div>
      </div>
    </div>
</template>

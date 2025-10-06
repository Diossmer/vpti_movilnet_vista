<script setup>
import { ref, watch, defineProps } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';

const props = defineProps({
  handleData: {
    type: Function,
    default: null,
    required: true,
  },
  paramsE: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  relations: {
    type: Array,
    default: () => [[], []],
  },
  isLoadingImport: {
    type: Boolean,
    default: false,
    required: true,
  },
  response: {
    type: Object,
    default: null,
    required: false,
  },
});

const { dataPerfil } = storeToRefs(useLoginStore());
const modalEditar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);

// **1. ESTADO LOCAL PARA LA EDICIÓN**
const formData = ref({});
const escalas = ref([
    {escala:'critico'}, 
    {escala:'alto'}, 
    {escala:'medio'}, 
    {escala:'bajo'}, 
    {escala:'regular'}, 
    {escala:'resuelto'}
]);

// **2. SINCRONIZACIÓN Y CLONACIÓN MEJORADA**
watch(() => props.paramsE, (newParamsE) => {
    // Clonación profunda
    const clonedParams = JSON.parse(JSON.stringify(newParamsE));
    // 2.1. INICIALIZACIÓN CLAVE para el SELECT MULTIPLE:
    // Mapeamos los IDs de las descripciones que ya vienen cargadas.
    // Esto asegura que el v-model se inicialice con un array de IDs.
    const descripcionIds = (clonedParams.descripciones && Array.isArray(clonedParams.descripciones))
        ? clonedParams.descripciones.map(d => d.id) : [];
    // 2.2. Construimos el nuevo formData
    formData.value = {
        ...clonedParams,
        // Usamos la lista de IDs mapeados para el v-model (formData.descripcion_id)
        descripcion_id: descripcionIds,
        // Aseguramos que los demás campos obligatorios/modificables existan
        estatus_id: clonedParams.estatus_id || null, // Para el select simple
        // Los demás campos (escala, compatibilidad, etc.) ya vienen en clonedParams
    };
    // Si el backend requiere que el campo se llame distinto al v-model
    // si el campo en el backend se llama 'descripciones', tendrías que cambiar el v-model o hacer un pre-procesamiento aquí.
    // Pero asumiendo que el backend espera 'descripcion_id' (como sugiere el error), esta estructura es correcta.
}, { deep: true, immediate: true });
watch([
() => formData.value?.compatibilidad,
() => formData.value?.reemplazo,
() => formData.value?.mantenimiento], ([
  compatibilidad,
  reemplazo,
  mantenimiento]) => {
  const errors = [];
  // Usamos el helper validacionesUtils para las validaciones existentes
  const CompatibilidadError = validacionesUtils().textValid(compatibilidad);
  if (CompatibilidadError) errors.push(CompatibilidadError);
  const ReemplazoError = validacionesUtils().textValid(reemplazo);
  if (ReemplazoError) errors.push(ReemplazoError);
  const mantenimientoError = validacionesUtils().textValid(mantenimiento);
  if (mantenimientoError) errors.push(mantenimientoError);

  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  
  // Limpiar el aviso si todos los campos opcionales están vacíos
  if ((!compatibilidad || compatibilidad === '')
  && (!reemplazo || reemplazo === '')
  && (!mantenimiento || mantenimiento === '')) {
    avisosAlert.value = null;
  }
}, { deep: true });

watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
</script>

<template>
  <div class="modal fade" id="staticEditar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalEditar">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Actualizar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
              <!-- 4. USAMOS formData EN EL SUBMIT -->
              <form @submit.prevent="handleData('update', formData, formData.id)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-8">
                      <label for="" class="badge text-secondary">Descripción del productos<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="formData.descripcion_id" multiple required disabled v-if="dataPerfil?.rol?.id === 2">
                        <option v-for="(descripcion, index) in relations[1]" :key="index" :value="descripcion.id">{{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}</option>
                      </select>
                      <select class="form-select" v-model="formData.descripcion_id" multiple required v-else>
                        <option v-for="(descripcion, index) in relations[1]" :key="index" :value="descripcion.id">{{ descripcion?.producto?.nombre }} || {{ descripcion?.dispositivo }} || {{ descripcion?.modelo }} || {{ descripcion?.marca }} || {{ descripcion?.serial }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ formData.estatus?.nombre }}</span>
                      <select class="form-select" v-model="formData.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">escala<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.escala }}</span>
                      <select class="form-select" v-model="paramsE.escala" required>
                        <option v-for="(escala, index) in escalas" :key="index" :value="escala?.escala" v-if="relations?.length > 0">{{ escala?.escala }}</option>
                        <option selected v-else>Sin Escala</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">sistema operativo(compatibilidad)</label>
                      <!-- 5. USAMOS formData.compatibilidad para el v-model y las validaciones -->
                      <input type="text" v-if="dataPerfil?.rol?.id === 2" disabled disabledmaxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': formData.compatibilidad && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.compatibilidad),'is-valid': formData.compatibilidad && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.compatibilidad)}" v-model="formData.compatibilidad" placeholder="Compatibilidad"  />
                      <input type="text" v-else maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': formData.compatibilidad && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.compatibilidad),'is-valid': formData.compatibilidad && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.compatibilidad)}" v-model="formData.compatibilidad" placeholder="Compatibilidad"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">reemplazo</label>
                      <!-- 5. USAMOS formData.reemplazo para el v-model y las validaciones -->
                      <input type="text" v-if="dataPerfil?.rol?.id === 2" disabled maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': formData.reemplazo && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.reemplazo),'is-valid': formData.reemplazo && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.reemplazo)}" v-model="formData.reemplazo" placeholder="Reemplazo"  />
                      <input type="text" v-else maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': formData.reemplazo && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.reemplazo),'is-valid': formData.reemplazo && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.reemplazo)}" v-model="formData.reemplazo" placeholder="Reemplazo"  />
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">mantenimiento</label>
                      <!-- 5. USAMOS formData.mantenimiento para el v-model y las validaciones -->
                      <input type="text" v-if="dataPerfil?.rol?.id === 2" disabled maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': formData.mantenimiento && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.mantenimiento),'is-valid': formData.mantenimiento && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.mantenimiento)}" v-model="formData.mantenimiento" placeholder="mantenimiento"  />
                      <input type="text" v-else maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid': formData.mantenimiento && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.mantenimiento),'is-valid': formData.mantenimiento && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(formData.mantenimiento)}" v-model="formData.mantenimiento" placeholder="mantenimiento"  />
                    </div>
                    <div class="col-8">
                      <label for="" class="badge text-secondary">Observación</label>
                      <!-- 5. USAMOS formData.notas para el v-model y las validaciones -->
                      <textarea class="form-control" :class="{ 'is-invalid': formData.notas && !/^[^<>{}\[\]]+$/.test(formData.notas), 'is-valid':formData.notas && /^[^<>{}\[\]]+$/.test(formData.notas) }" placeholder="Observación" v-model="formData.notas"></textarea>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Cancelar</button>
                  <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport">
                    <span v-if="!isLoadingImport">Actualizar</span>
                      <span v-else>
                      <span class="spinner-border spinner-border-sm" role="status"></span>
                        Procesando...
                      </span>
                  </button>
                </div>
              </form>
            </template>
            <template #fallback>
              <div class="modal-body text-center py-5">
                <div class="spinner-border text-red" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 text-muted">Procesando archivo...</p>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>
</template>

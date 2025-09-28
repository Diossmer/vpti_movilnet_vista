<script setup>
import { ref, watch, computed } from 'vue';
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
const modalAgregar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);
const paramsA = ref({});
const passwordVisible = ref(false);

const resetParams = () => {
  paramsA.value = {};
  avisos.value = null;
  avisosAlert.value = null;
};

watch([
  () => paramsA.value?.nombre,
  () => paramsA.value?.apellido,
  () => paramsA.value?.cedula,
  () => paramsA.value?.usuario,
  () => paramsA.value?.correo,
  () => paramsA.value?.password,
  () => paramsA.value?.ciudad,
  () => paramsA.value?.estado,
  () => paramsA.value?.telefono_casa,
  () => paramsA.value?.telefono_celular,
  () => paramsA.value?.telefono_alternativo,
  () => paramsA.value?.codigo_postal,
  () => paramsA.value?.direccion,
],
  ([
  nombre, apellido, cedula,
  usuario, correo, password,
  ciudad, estado, telefono_casa,
  telefono_celular, telefono_alternativo, codigo_postal,
  direccion,
  ]) => {
  const errors = [];
  const nombreError = validacionesUtils().textValid(nombre);
  if (nombreError) errors.push(nombreError);
  const apellidoError = validacionesUtils().textValid(apellido);
  if (apellidoError) errors.push(apellidoError);
  const usuarioError = validacionesUtils().usuariosValid(usuario);
  if (usuarioError) errors.push(usuarioError);
  const cedulaError = validacionesUtils().cedulaValid(cedula);
  if (cedulaError) errors.push(cedulaError);
  const correoError = validacionesUtils().emailValid(correo);
  if (correoError) errors.push(correoError);
  const passwordError = validacionesUtils().passwordValid(password);
  if (passwordError) errors.push(passwordError);
  const ciudadError = validacionesUtils().textValid(ciudad);
  if (ciudadError) errors.push(ciudadError);
  const estadoError = validacionesUtils().textValid(estado);
  if (estadoError) errors.push(estadoError);
  const telefono_casaError = validacionesUtils().phoneLocalValid(telefono_casa);
  if (telefono_casaError) errors.push(telefono_casaError);
  const telefono_celularError = validacionesUtils().phoneValid(telefono_celular);
  if (telefono_celularError) errors.push(telefono_celularError);
  const telefono_alternativoError = validacionesUtils().phoneAlternativeValid(telefono_alternativo);
  if (telefono_alternativoError) errors.push(telefono_alternativoError);
  const codigo_postalError = validacionesUtils().numberValid(codigo_postal);
  if (codigo_postalError) errors.push(codigo_postalError);
  const direccionError = validacionesUtils().textareaValid(direccion);
  if (direccionError) errors.push(direccionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((nombre==='' || nombre===undefined)
  && (apellido==='' || apellido===undefined)
  && (usuario==='' || usuario===undefined)
  && (cedula==='' || cedula===undefined)
  && (correo==='' || correo===undefined)
  && (ciudad==='' || ciudad===undefined)
  && (estado==='' || estado===undefined)
  && (telefono_celular==='' || telefono_celular===undefined)
  && (telefono_alternativo==='' || telefono_alternativo===undefined)
  && (codigo_postal==='' || codigo_postal===undefined)
  && (direccion==='' || direccion===undefined)
  && (telefono_casa==='' || telefono_casa===undefined))
  avisosAlert.value = null;
});
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});

const filteredRoles = computed(() => {
  const allRol = props.relations[1];
  const restrictedRolNames = ['SuperUsuario', 'Administrador', 'Activo'];
  if (dataPerfil.value?.rol?.id !== 1) {
    return allRol?.filter(rol =>
      !restrictedRolNames.includes(rol.nombre)
    );
  }
  return allRol;
});
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetParams()"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('create', paramsA)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">
                          {{ estatus.nombre }}
                        </option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">roles<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.rol_id" required>
                        <option v-for="(rol, index) in filteredRoles" :key="index" :value="rol.id">{{ rol.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">nombre<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.nombre),'is-valid':paramsA.nombre && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.nombre)}" v-model="paramsA.nombre" placeholder="Nombre" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Apellido<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.apellido && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.apellido),'is-valid':paramsA.apellido && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.apellido)}" v-model="paramsA.apellido" placeholder="Apellido" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Cedula<span class="text-danger">*</span></label>
                      <input type="text" maxlength="10" pattern="^[a-zA-Z]?(-?)\d{7,10}$" class="form-control" :class="{'is-invalid':paramsA.cedula && !/^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsA.cedula),'is-valid':paramsA.cedula && /^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsA.cedula)}" v-model="paramsA.cedula" placeholder="Cedula" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Usuario<span class="text-danger">*</span></label>
                      <input type="text" maxlength="15" pattern="^[a-zA-Z0-9]{4,}$" class="form-control" :class="{'is-invalid':paramsA.usuario && !/^[a-zA-Z0-9]{4,}$/.test(paramsA.usuario),'is-valid':paramsA.usuario && /^[a-zA-Z0-9]{4,}$/.test(paramsA.usuario)}" v-model="paramsA.usuario" placeholder="Usuario" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Correo<span class="text-danger">*</span></label>
                      <input type="email" maxlength="35" pattern="^\S+@\S+\.\S+$" class="form-control" :class="{'is-invalid':paramsA.correo && !/^\S+@\S+\.\S+$/.test(paramsA.correo),'is-valid':paramsA.correo && /^\S+@\S+\.\S+$/.test(paramsA.correo)}" v-model="paramsA.correo" placeholder="Correo" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <div class="row">
                        <div class="col-12">
                          <label for="" class="badge text-secondary">Contraseña<span class="text-danger">*</span></label>
                        </div>
                        <div class="col-8 m-0 ms-3 p-0">
                          <input :type="passwordVisible?'text':'password'" maxlength="20" pattern="^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$" class="form-control" :class="{'is-invalid':paramsA.password && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsA.password),'is-valid':paramsA.password && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsA.password)}" v-model="paramsA.password" placeholder="Contraseña" required autocomplete="on"/>
                        </div>
                        <div class="col-3 m-0 p-0">
                          <button type="button" @click="passwordVisible = !passwordVisible" class="icono btn btn-outline-secondary">
                            <span  v-if="passwordVisible">👁️</span>
                            <span v-else>👁️‍🗨️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Ciudad</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.ciudad && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.ciudad),'is-valid':paramsA.ciudad && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.ciudad)}" v-model="paramsA.ciudad" placeholder="Ciudad capital" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Estado</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsA.estado && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.estado),'is-valid':paramsA.estado && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsA.estado)}" v-model="paramsA.estado" placeholder="Estado geográfico" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de casa</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsA.telefono_casa && !/^(0?212)-?\d{7}$/.test(paramsA.telefono_casa),'is-valid': paramsA.telefono_casa && /^(0?212)-?\d{7}$/.test(paramsA.telefono_casa)}" v-model="paramsA.telefono_casa" placeholder="Telefono de casa" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de celular<span class="text-danger">*</span></label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46])-?\d{7}$" class="form-control" :class="{'is-invalid': paramsA.telefono_celular && !/^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsA.telefono_celular),'is-valid': paramsA.telefono_celular && /^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsA.telefono_celular)}" v-model="paramsA.telefono_celular" placeholder="Telefono de celular" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de alternativo</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46]|0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsA.telefono_alternativo && !/^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsA.telefono_alternativo),'is-valid': paramsA.telefono_alternativo && /^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsA.telefono_alternativo)}" v-model="paramsA.telefono_alternativo" placeholder="Telefono de alternativo" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Codigo postal</label>
                      <input type="text" inputmode="numeric" maxlength="4" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsA.codigo_postal && !/^\d+(^\.\d+)?$/.test(paramsA.codigo_postal),'is-valid': paramsA.codigo_postal && /^\d+(^\.\d+)?$/.test(paramsA.codigo_postal)}" v-model="paramsA.codigo_postal" placeholder="Codigo postal" autocomplete="on"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">Dirección</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsA.direccion && !/^[^<>{}\[\]]+$/.test(paramsA.direccion), 'is-valid':paramsA.direccion && /^[^<>{}\[\]]+$/.test(paramsA.direccion) }" placeholder="Dirección" v-model="paramsA.direccion" autocomplete="on"></textarea>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="resetParams()">Cancelar</button>
                  <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport">
                    <span v-if="!isLoadingImport">Agregar</span>
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
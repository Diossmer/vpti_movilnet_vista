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
const passwordshow = ref(false);

watch(() => props.paramsE,() =>{},{ deep: true });
watch([
  () => props.paramsE?.nombre,
  () => props.paramsE?.apellido,
  () => props.paramsE?.cedula,
  () => props.paramsE?.usuario,
  () => props.paramsE?.correo,
  () => props.paramsE?.password,
  () => props.paramsE?.ciudad,
  () => props.paramsE?.estado,
  () => props.paramsE?.telefono_casa,
  () => props.paramsE?.telefono_celular,
  () => props.paramsE?.telefono_alternativo,
  () => props.paramsE?.codigo_postal,
  () => props.paramsE?.direccion,
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
              <form @submit.prevent="handleData('update', paramsE, paramsE.id)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-4">
                      <label for="" class="badge text-secondary">estatus actual<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.estatus?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.estatus_id" required>
                        <option v-for="(estatus, index) in relations[0]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">roles actual<span class="text-danger">*</span></label>
                      <span class="badge text-secondary">{{ paramsE.rol?.nombre }}</span>
                      <select class="form-select" v-model="paramsE.rol_id" required>
                        <option v-for="(rol, index) in relations[1]" :key="index" :value="rol.id">{{ rol.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">nombre<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.nombre),'is-valid':paramsE.nombre && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.nombre)}" v-model="paramsE.nombre" placeholder="Nombre" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Apellido<span class="text-danger">*</span></label>
                      <input type="text" maxlength="25" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.apellido && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.apellido),'is-valid':paramsE.apellido && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.apellido)}" v-model="paramsE.apellido" placeholder="Apellido" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Cedula<span class="text-danger">*</span></label>
                      <input type="text" maxlength="10" pattern="^[a-zA-Z]?(-?)\d{7,10}$" class="form-control" :class="{'is-invalid':paramsE.cedula && !/^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsE.cedula),'is-valid':paramsE.cedula && /^[a-zA-Z]?(-?)\d{7,10}$/.test(paramsE.cedula)}" v-model="paramsE.cedula" placeholder="Cedula" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Usuario<span class="text-danger">*</span></label>
                      <input type="text" maxlength="15" pattern="^[a-zA-Z0-9]{4,}$" class="form-control" :class="{'is-invalid':paramsE.usuario && !/^[a-zA-Z0-9]{4,}$/.test(paramsE.usuario),'is-valid':paramsE.usuario && /^[a-zA-Z0-9]{4,}$/.test(paramsE.usuario)}" v-model="paramsE.usuario" placeholder="Usuario" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Correo<span class="text-danger">*</span></label>
                      <input type="email" maxlength="35" pattern="^\S+@\S+\.\S+$" class="form-control" :class="{'is-invalid':paramsE.correo && !/^\S+@\S+\.\S+$/.test(paramsE.correo),'is-valid':paramsE.correo && /^\S+@\S+\.\S+$/.test(paramsE.correo)}" v-model="paramsE.correo" placeholder="Correo" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <div class="row">
                        <div class="col-12">
                          <label for="" class="badge text-secondary">Contraseña<span class="text-danger">*</span></label>
                        </div>
                        <div class="col-8 m-0 ms-3 p-0">
                          <input :type="passwordshow?'text':'password'" maxlength="20" pattern="^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$" class="form-control" :class="{'is-invalid':paramsE.password && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsE.password),'is-valid':paramsE.password && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(paramsE.password)}" v-model="paramsE.password" placeholder="Contraseña" required autocomplete="on"/>
                        </div>
                        <div class="col-3 m-0 p-0">
                          <button type="button" @click="passwordshow = !passwordshow" class="icono btn btn-outline-secondary">
                            <span  v-if="passwordshow">👁️</span>
                            <span v-else>👁️‍🗨️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Ciudad</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.ciudad && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.ciudad),'is-valid':paramsE.ciudad && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.ciudad)}" v-model="paramsE.ciudad" placeholder="Ciudad capital" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Estado</label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s]+$" class="form-control" :class="{'is-invalid':paramsE.estado && !/^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.estado),'is-valid':paramsE.estado && /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(paramsE.estado)}" v-model="paramsE.estado" placeholder="Estado geográfico" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de casa</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsE.telefono_casa && !/^(0?212)-?\d{7}$/.test(paramsE.telefono_casa),'is-valid': paramsE.telefono_casa && /^(0?212)-?\d{7}$/.test(paramsE.telefono_casa)}" v-model="paramsE.telefono_casa" placeholder="Telefono de casa" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de celular<span class="text-danger">*</span></label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46])-?\d{7}$" class="form-control" :class="{'is-invalid': paramsE.telefono_celular && !/^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsE.telefono_celular),'is-valid': paramsE.telefono_celular && /^(0?41[246]|0?42[46])-?\d{7}$/.test(paramsE.telefono_celular)}" v-model="paramsE.telefono_celular" placeholder="Telefono de celular" required autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Telefono de alternativo</label>
                      <input type="text" inputmode="tel" maxlength="12" pattern="^(0?41[246]|0?42[46]|0?212)-?\d{7}$" class="form-control" :class="{'is-invalid': paramsE.telefono_alternativo && !/^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsE.telefono_alternativo),'is-valid': paramsE.telefono_alternativo && /^(0?41[246]|0?42[46]|0?212)-?\d{7}$/.test(paramsE.telefono_alternativo)}" v-model="paramsE.telefono_alternativo" placeholder="Telefono de alternativo" autocomplete="on"/>
                    </div>
                    <div class="col-4">
                      <label for="" class="badge text-secondary">Codigo postal</label>
                      <input type="text" inputmode="numeric" maxlength="4" pattern="^\d+(^\.\d+)?$" class="form-control" :class="{'is-invalid': paramsE.codigo_postal && !/^\d+(^\.\d+)?$/.test(paramsE.codigo_postal),'is-valid': paramsE.codigo_postal && /^\d+(^\.\d+)?$/.test(paramsE.codigo_postal)}" v-model="paramsE.codigo_postal" placeholder="Codigo postal" autocomplete="on"/>
                    </div>
                    <div class="col-12">
                      <label for="" class="badge text-secondary">Dirección</label>
                      <textarea class="form-control" :class="{ 'is-invalid': paramsE.direccion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.direccion), 'is-valid':paramsE.direccion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsE.direccion) }" placeholder="Dirección" v-model="paramsE.direccion" autocomplete="on"></textarea>
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
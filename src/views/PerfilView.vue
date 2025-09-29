<script setup>
import { ref, watch, computed } from 'vue';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';

// --- Pinia Store y Router ---
const store = useLoginStore();
const { dataPerfil } = storeToRefs(store); // Datos del perfil reactivos
const { cambioContrasena, actualizarDatosPerfil } = store; // Acciones del store
const router = useRouter();

// --- Estados Reactivos del Formulario de Contraseña ---
const passwordVisible = ref(false);
const passwordRepetir = ref("");
const password = ref(""); // Nueva contraseña
const passwordAntiguo = ref(""); // Contraseña vieja/antigua

// --- Estados de Edición de Perfil ---
// Usamos editedProfile para rastrear lo que el usuario ha cambiado en el DOM
const editedProfile = ref({});

// --- Estados de Alerta y Mensajes ---
const validationErrors = ref(null); // Errores de validación de contraseña en tiempo real
const avisosAlert = ref(null); // Mensajes de éxito/error después del submit

// --- Lógica Computada ---

// Comprueba si se está intentando cambiar la contraseña (al menos un campo no vacío)
const isPasswordAttempt = computed(() => 
    passwordAntiguo.value || password.value || passwordRepetir.value
);

// Comprueba si la validación de contraseña es válida (no hay errores y hay intento COMPLETO)
const isPasswordValid = computed(() => {
    // Si no hay intento, es válido (porque el botón estará deshabilitado de todas formas)
    if (!isPasswordAttempt.value) return false;
    
    // Si hay errores de validación en tiempo real, no es válido
    if (validationErrors.value !== null) return false;
    
    // Si los 3 campos están llenos Y no hay errores, es válido.
    return !!passwordAntiguo.value && !!password.value && !!passwordRepetir.value;
});

// --- Funciones y Lógica ---

/**
 * Maneja el evento @blur (al salir del campo) en los campos contenteditable.
 * Captura el cambio y, si es diferente al valor original, lo actualiza inmediatamente.
 * @param {Event} event Evento DOM
 * @param {string} field Nombre del campo ('nombre', 'correo', etc.)
 */
const handleInputBlur = async (event, field) => {

    // Obtenemos el contenido sin espacios extra
    const newValue = event.target.innerText.trim();
    // Valor actual en el store (puede ser nulo/indefinido)
    const currentValue = dataPerfil.value?.[field] || '';
  
    // 1. Limpieza y Restauración si el valor se borró accidentalmente
    if (newValue === '' && currentValue) {
         // Si el usuario borró el contenido, restauramos el valor original para feedback visual
         event.target.innerText = currentValue;
         // Si no hubo cambio significativo, no hacemos nada más.
         return; 
    }

    // 2. Si el valor es el mismo que el actual del store, no hacemos nada.
    if (newValue === currentValue) {
        // Aseguramos que el campo no esté marcado como editado si no hay cambio.
        delete editedProfile.value[field];
        return;
    }

    // 3. Hay un cambio significativo. Preparamos la actualización inmediata.
    editedProfile.value = { [field]: newValue }; // Solo el campo que acaba de cambiar

    // 4. Ejecutamos la función de actualización inmediatamente.
    avisosAlert.value = null; // Limpiar alertas

    try {
        const result = await actualizarDatosPerfil(editedProfile.value);
        if (!result || !result.cambioContrasena) {
            avisosAlert.value = { error: `Fallo al actualizar ${field}: ${result?.error || "Error desconocido."}` };
            // Opcional: Revertir el campo a su valor original en caso de fallo
            // event.target.innerText = currentValue;
        } else {
            // El store ya debe estar actualizado gracias a la acción 'actualizarDatosPerfil'
            avisosAlert.value = { cambioContrasena: `Campo ${field} actualizado exitosamente.` };
            editedProfile.value = {}; // Resetear estado de edición
        }
    } catch (e) {
        avisosAlert.value = { error: `Error de red al actualizar ${field}.` };
    }
    
    // Nos aseguramos de limpiar el estado de edición después de intentar la actualización
    editedProfile.value = {};
};


// Validación de contraseña en tiempo real usando watcher profundo
watch([passwordAntiguo, passwordRepetir, password], () => {
    if (!isPasswordAttempt.value) {
        validationErrors.value = null;
        return;
    }
    
    const errors = [];
    const util = validacionesUtils();
    
    // --- Lógica de Validación Detallada ---
    
    // 1. Validar que la contraseña antigua no esté vacía si hay intento de cambio
    if (!passwordAntiguo.value) {
        errors.push('La contraseña antigua es requerida.');
    }
    
    // 2. Validar formato de la Nueva Contraseña
    if (password.value) {
        const nuevoError = util.passwordValid(password.value);
        if (nuevoError) errors.push(`Nueva: ${nuevoError}`);
    } else if (isPasswordAttempt.value) {
        errors.push('La nueva contraseña es requerida.');
    }
    
    // 3. Validar formato de la Contraseña de Repetición
    if (passwordRepetir.value) {
        const repetirError = util.passwordValid(passwordRepetir.value);
        if (repetirError) errors.push(`Repetir: ${repetirError}`);
    } else if (isPasswordAttempt.value) {
        errors.push('Repetir contraseña es requerido.');
    }

    // 4. Validar que las nuevas contraseñas coincidan (solo si ambas tienen contenido y no tienen errores de formato)
    const hasFormatErrors = errors.some(err => err.startsWith('Nueva:') || err.startsWith('Repetir:'));

    if (password.value && passwordRepetir.value && !hasFormatErrors) {
        const verificError = util.passwordVerificValid(password.value, passwordRepetir.value);
        if (verificError) errors.push(verificError);
    }
    
    // 5. Advertencia general si solo algunos campos están llenos
    const allFieldsFilled = !!passwordAntiguo.value && !!password.value && !!passwordRepetir.value;
    
    if (isPasswordAttempt.value && !allFieldsFilled && errors.length === 0) {
         errors.push('Completa los 3 campos de contraseña para cambiarla.');
    }

    validationErrors.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
}, { deep: true });


// --- HANDLER PARA CAMBIAR LA CONTRASEÑA ---
const handlePasswordChange = async () => {
    avisosAlert.value = null; // Limpiar alertas anteriores

    // 1. Verificar la validez final antes del submit
    if (!isPasswordValid.value) {
         avisosAlert.value = { error: "Corrige los errores y completa los 3 campos de contraseña." };
         return;
    }
    
    // 2. Ejecutar la acción de cambio de contraseña
    const passwordPayload = { 
        passwordAntiguo: passwordAntiguo.value,
        password: password.value,
        passwordRepetir: passwordRepetir.value,
    };
    
    try {
        // La acción 'cambioContrasena' debe encargarse de la validación de la contraseña antigua
        const result = await cambioContrasena(passwordPayload); 
        
        if (!result || !result.cambioContrasena) {
            avisosAlert.value = { error: "Fallo al cambiar la contraseña: " + (result?.error || "Error desconocido.") };
        } else {
            avisosAlert.value = { mensaje: "Contraseña actualizada exitosamente." };
            // Limpiar campos de contraseña en éxito
            passwordAntiguo.value = '';
            password.value = '';
            passwordRepetir.value = '';
        }
    } catch (e) {
        avisosAlert.value = { error: "Error de red al cambiar la contraseña." };
    }
};

const goBack = () => {router.go(-1)}
</script>

<template>    
    <div class="profile-container">
        <!-- Header y Botón de Regreso -->
        <header class="d-flex justify-content-start align-items-center mb-4">
            <button @click="goBack" class="btn btn-outline-primary-m btn-lg me-3 shadow-sm"><i class="bi bi-arrow-left-circle"></i> Regresar</button>
            <span class="badge fs-2 fw-bold">👤 Perfil de Usuario</span>
        </header>
    
        <hr class="border-3 border-red-m opacity-75">

        <!-- Contenedor Principal (Card) -->
        <div class="card shadow-lg w-100">
          <div class="card-body p-4 p-md-5 bg-light-red-m">
            
            <div class="row">
                
                <!-- Columna Izquierda: Imagen y Cambio de Contraseña -->
                <div class="col-lg-5 col-md-12 order-lg-1 order-1 mb-4 mb-lg-0 password-section border-lg-end border-3 pe-lg-5">
                    
                    <!-- Imagen -->
                    <div class="img mb-4">
                        <!-- Usando un placeholder genérico ya que la ruta '../assets/img/logo2.png' no existe en este contexto -->
                        <img src="../assets/img/logo2.png" alt="Logo" class="rounded-circle shadow-lg">
                    </div>
    
                    <hr class="mt-4 mb-4 border-2 border-red-m">
                    
                    <!-- Sección de Cambio de Contraseña -->
                    <h4 class="mb-3 text-dark fw-bold">Cambiar Contraseña</h4>
                    
                    <!-- Correo (Solo Lectura) -->
                    <div class="mb-3 row align-items-center">
                        <label for="staticEmail" class="col-sm-5 col-form-label fw-semibold">Email</label>
                        <div class="col-sm-7">
                            <input type="text" readonly class="form-control-plaintext p-1 fw-bold text-primary-m" id="staticEmail" :value="dataPerfil?.correo">
                        </div>
                    </div>
    
                    <!-- Contraseña Antigua -->
                    <div class="mb-3 row">
                        <label for="inputPasswordAntiguo" class="col-sm-5 col-form-label fw-semibold">Antígua</label>
                        <div class="col-sm-7 input-group">
                            <input :type="passwordVisible ? 'text' : 'password'" v-model="passwordAntiguo" id="inputPasswordAntiguo" 
                                   class="form-control" placeholder="Contraseña Antígua" :required="isPasswordAttempt" autocomplete="current-password" maxlength="20" />
                            <button type="button" @click="passwordVisible = !passwordVisible" class="btn btn-outline-secondary">
                                <i :class="passwordVisible ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                            </button>
                        </div>
                    </div>
    
                    <!-- Nueva Contraseña -->
                    <div class="mb-3 row">
                        <label for="inputPasswordNuevo" class="col-sm-5 col-form-label fw-semibold">Nueva</label>
                        <div class="col-sm-7 input-group">
                            <input :type="passwordVisible ? 'text' : 'password'" v-model="password" id="inputPasswordNuevo" 
                                   class="form-control" placeholder="Mín. 8 caracteres" :required="isPasswordAttempt" autocomplete="new-password" maxlength="20" />
                            <button type="button" @click="passwordVisible = !passwordVisible" class="btn btn-outline-secondary">
                                <i :class="passwordVisible ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                            </button>
                        </div>
                    </div>
    
                    <!-- Repetir Contraseña -->
                    <div class="mb-3 row">
                        <label for="inputPasswordRepetir" class="col-sm-5 col-form-label fw-semibold">Repetir</label>
                        <div class="col-sm-7 input-group">
                            <input :type="passwordVisible ? 'text' : 'password'" v-model="passwordRepetir" id="inputPasswordRepetir" 
                                   class="form-control" placeholder="Confirma la nueva" :required="isPasswordAttempt" autocomplete="new-password" maxlength="20" />
                            <button type="button" @click="passwordVisible = !passwordVisible" class="btn btn-outline-secondary">
                                <i :class="passwordVisible ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- BOTÓN PARA GUARDAR SÓLO CONTRASEÑA -->
                    <div class="mb-3 row justify-content-center justify-content-md-end">
                        <div class="col-12 col-md-7 col-lg-8">
                            <button 
                                type="button" 
                                @click="handlePasswordChange"
                                class="btn btn-red w-100 py-2 fw-bold shadow mt-3" 
                                :disabled="!isPasswordValid"
                            >
                                Guardar Contraseña
                            </button>
                        </div>
                    </div>
    
                </div>
    
                <!-- Columna Derecha: Datos del Perfil (Edición automática al perder foco) -->
                <div class="col-lg-7 col-md-12 order-lg-2 order-2 profile-info-section ps-lg-5">
                  <h4 class="mb-4 text-dark fw-bold">Información Personal (Edición automática)</h4>
                  <div class="row g-4">
                    
                    <!-- Campos Editables -->
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Nombre:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'nombre')"
                      >{{ dataPerfil?.nombre }}</span>
                    </div>
                    
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Apellido:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'apellido')"
                      >{{ dataPerfil?.apellido }}</span>
                    </div>
    
                    <!-- Cédula y Usuario (No Editables) -->
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Cédula:</label>
                      <span class="non-editable">{{ dataPerfil?.cedula }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Usuario:</label>
                      <span class="non-editable">{{ dataPerfil?.usuario }}</span>
                    </div>
    
                    <!-- Ubicación y Contacto Editables -->
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Ciudad:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'ciudad')"
                      >{{ dataPerfil?.ciudad }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Estado:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'estado')"
                      >{{ dataPerfil?.estado }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Casa:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'telefono_casa')"
                      >{{ dataPerfil?.telefono_casa }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Celular:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'telefono_celular')"
                      >{{ dataPerfil?.telefono_celular }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Alternativo:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'telefono_alternativo')"
                      >{{ dataPerfil?.telefono_alternativo }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Cód. Postal:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'codigo_postal')"
                      >{{ dataPerfil?.codigo_postal }}</span>
                    </div>
    
                    <!-- Estatus y Rol (No Editables) -->
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Estatus:</label>
                      <span class="non-editable text-cambioContrasena fw-bold">{{ dataPerfil?.estatus?.nombre }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Rol:</label>
                      <span class="non-editable text-info fw-bold">{{ dataPerfil?.rol?.nombre }}</span>
                    </div>
    
                    <!-- Correo y Dirección (Ancho completo) -->
                    <div class="col-12 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Correo:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'correo')"
                      >{{ dataPerfil?.correo }}</span>
                    </div>
                    <div class="col-12 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Dirección:</label>
                      <span 
                        contenteditable="true" 
                        class="editable-data flex-grow-1"
                        @blur="handleInputBlur($event, 'direccion')"
                      >{{ dataPerfil?.direccion }}</span>
                    </div>

                    <!-- Alertas globales (para errores de validación en tiempo real y resultados de submit) -->
                    <!-- Mantenemos la alerta fuera de las secciones para que sea visible en todo momento -->
                    <div class="mb-4">
                        <AlertComponents :avisos="avisosAlert" :avisosAlert="validationErrors"/>
                    </div>

                  </div>
                </div>
                
              </div>
            
          </div>
        </div>
    </div>
  
</template>

<style scoped>

.bg-light-red-m {
    /* Fondo claro que hace juego con el color cerezo */
    background-color: #fffafa; /* Casi blanco, con un toque rojo */
}
.border-red-m {
    border-color: var(--institucional-m-cerezo) !important;
}

/* Botones */
.btn-outline-primary-m {
    border-color: var(--institucional-m-gris-claro);
    color: var(--institucional-m-cerezo);
    background-color: var(--institucional-m-blanco);
}
.btn-outline-primary-m:hover {
    background-color: var(--institucional-m-cerezo);
    color: var(--institucional-m-blanco);
}
.btn-red {
    background-color: var(--institucional-m-cerezo);
    color: white;
    transition: background-color 0.3s ease, transform 0.1s ease;
}
.btn-red:hover {
    background-color: #a00000;
    transform: translateY(-1px);
}
.btn-red:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Estilos de Imagen */
.img{
    text-align: center;
    display:flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
}
.img img{
    width: 250px;
    height: 250px;
    object-fit: cover;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border: 5px solid var(--institucional-m-cerezo);
    transition: all 0.3s ease;
}

/* Estilo para contenteditable (Editable Data) */
.profile-field {
    display: flex;
    align-items: baseline; /* Alinea texto para mejor lectura */
    gap: 5px; /* Espacio entre label y valor */
    flex-wrap: wrap; 
    border-bottom: 1px dashed var(--bs-gray-300); /* Separador visual */
    padding-bottom: 0.5rem;
}
.profile-field:last-child {
    border-bottom: none;
}
.editable-data {
    padding: 1px 5px;
    border-bottom: 2px solid transparent; /* Fondo transparente */
    cursor: text;
    line-height: 1.5;
    min-width: 100px; 
    font-weight: 500;
    color: var(--bs-dark);
    transition: all 0.2s ease-in-out;
}
.editable-data:empty:before {
    content: "Haz click para ingresar valor...";
    color: var(--bs-gray-500);
    font-style: italic;
}
.editable-data:hover {
    background-color: var(--bs-light);
}
.editable-data:focus {
    outline: none;
    background-color: white;
    border-bottom: 2px solid var(--institucional-m-cerezo);
    box-shadow: 0 1px 0 0 var(--institucional-m-cerezo);
}

/* Estilo para datos no editables */
.non-editable {
    padding: 1px 5px;
    line-height: 1.5;
    color: var(--bs-gray-700);
}

/* Ajustes responsivos */
@media (max-width: 991.98px) { 
    .password-section {
        border-bottom: 1px solid var(--bs-gray-300);
        padding-bottom: 1.5rem;
        margin-bottom: 2.5rem;
        border-right: none !important;
        padding-right: 0 !important;
    }
}
</style>

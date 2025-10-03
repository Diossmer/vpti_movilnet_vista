<script setup>
import { ref, watch, computed } from 'vue';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';

// --- Pinia Store y Router ---
const store = useLoginStore();
const { dataPerfil } = storeToRefs(store);
const { cambioContrasena, actualizarDatosPerfil } = store;
const router = useRouter();

const avisosAlert = ref(null);
const isEditingProfile = ref(false);

// --- ESTADOS REACTIVOS (Ref) ---
const passwordAntiguo = ref(''); // Nuevo campo
const password = ref('');         // Nueva Contraseña
const passwordRepetir = ref('');  // Repetir Nueva Contraseña
const passwordVisible = ref(false); // Controla la visibilidad de los campos
const errorMensaje = ref('');     // Mensajes de error del frontend/backend

// --- VALIDACIÓN DE CLIENTE (Computed) ---

/**
 * Verifica si las nuevas contraseñas tienen al menos 8 caracteres.
 * @returns {boolean}
 */
const isNewPasswordLengthValid = computed(() => {
    // Verifica que la nueva contraseña no esté vacía y cumpla la longitud mínima
    return password.value.length >= 8;
});

/**
 * Verifica si la nueva contraseña y la repetición son idénticas.
 * @returns {boolean}
 */
const passwordsMatch = computed(() => {
    // Si la nueva contraseña tiene contenido, verifica que coincida con la repetición
    if (password.value) {
        return password.value === passwordRepetir.value;
    }
    return true; // Si está vacía, no mostramos el error de coincidencia aún.
});

/**
 * Validación general para habilitar el botón "Guardar Contraseña".
 * @returns {boolean}
 */
const isPasswordValid = computed(() => {
    // Todos los campos deben estar llenos Y las nuevas deben cumplir reglas
    return (
        passwordAntiguo.value.length > 0 && 
        isNewPasswordLengthValid.value && 
        passwordsMatch.value
    );
});

// --- FUNCIÓN DE ENVÍO (Método) ---

const handlePasswordChange = async () => {
    avisosAlert.value = ''; // Limpiar errores

    // 1. Revalidación de Cliente (Aunque el botón ya usa isPasswordValid)
    if (!isPasswordValid.value) {
        avisosAlert.value = 'Por favor, completa todos los campos y asegúrate de que las nuevas contraseñas coincidan y cumplan la longitud mínima.';
        return;
    }
    
    // 2. Preparar datos
    const payload = {
        password_antigua: passwordAntiguo.value,
        nueva_password: password.value,
        password_repetir: passwordRepetir.value,
    };
    
    // 3. Petición al Backend usando la acción de Pinia (asumo que `cambioContrasena` maneja el `fetch`)
    try {
        // Asumo que cambioContrasena es una función async que recibe el payload 
        // y devuelve true/false o lanza un error.
        const data = await cambioContrasena(payload);
        avisosAlert.value = data.mensaje;
        // Limpiar campos
        passwordAntiguo.value = '';
        password.value = '';
        passwordRepetir.value = '';

    } catch (error) {
        // Error de backend (ej. contraseña antigua incorrecta, nueva muy débil)
        console.error('Error al cambiar contraseña:', error);

        // Muestra un mensaje amigable o el error exacto del servidor
        avisosAlert.value = error.response?.data?.detail || 
                             error.message || 
                             'Error desconocido al contactar al servidor.';
    }
};

const handleInputBlur = async (e, field) => {
    const newValue = event.target.innerText.trim();
    const currentValue = dataPerfil.value?.[field] || '';
    avisosAlert.value = null;

    // esto es en caso de dejarlo vacio retoma el valor anterior.
    if (newValue === '' && currentValue) {
         event.target.innerText = currentValue;
         return; 
    }
    // en cado de tener campos iguales se mantienen
    if (newValue === currentValue) {
        return;
    }
    const profilePayload = { [field]: newValue };
    
    try {
        switch(Object.keys(profilePayload)[0]){
            case 'nombre': {
                avisosAlert.value = validacionesUtils().textValid(profilePayload.nombre)
                break;
            }
            case 'apellido': {
                avisosAlert.value = validacionesUtils().textValid(profilePayload.apellido)
                break;
            }
            case 'ciudad': {
                avisosAlert.value = validacionesUtils().textValid(profilePayload.ciudad)
                break;
            }
            case 'estado': {
                avisosAlert.value = validacionesUtils().textValid(profilePayload.estado)
                break;
            }
            case 'telefono_casa': {
                avisosAlert.value = validacionesUtils().phoneLocalValid(profilePayload.telefono_casa)
                break;
            }
            case 'telefono_celular': {
                avisosAlert.value = validacionesUtils().phoneValid(profilePayload.telefono_celular)
                break;
            }
            case 'telefono_alternativo' : {
                avisosAlert.value = validacionesUtils().phoneAlternativeValid(profilePayload.telefono_alternativo)
                break;
            }
            case 'codigo_postal': {
                avisosAlert.value = validacionesUtils().numberValid(profilePayload.codigo_postal)
                break;
            }
            case 'correo': {
                avisosAlert.value = validacionesUtils().emailValid(profilePayload.correo)
                break;
            }
            case 'direccion': {
                avisosAlert.value = validacionesUtils().textareaValid(profilePayload.direccion)
                break;
            }
            default:
                break;
        }
        
        if (newValue !== currentValue && newValue !== '') {
            // Opcional: Actualizar el store local inmediatamente para feedback visual
            dataPerfil.value[field] = newValue;
        }
        
        // dependiendo de la validacion del campo se guarda
        if(avisosAlert.value.startsWith('✅')){
            const result = await actualizarDatosPerfil(profilePayload);
        }else if(avisosAlert.value.startsWith('❌')){

        }
    } catch (e) {
        avisosAlert.value = { error: `Error de red al actualizar ${field}.` };
    }
}
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
                        
                    <!-- Contraseña Antigua -->
                    <div class="mb-3 row">
                        <label for="inputPasswordAntiguo" class="col-sm-5 col-form-label fw-semibold">Antígua</label>
                        <div class="col-sm-7 input-group">
                            <input :type="passwordVisible ? 'text' : 'password'" v-model="passwordAntiguo" id="inputPasswordAntiguo" 
                                   class="form-control" :class="{'is-invalid':passwordAntiguo && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{4,}$/.test(passwordAntiguo),'is-valid':passwordAntiguo && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{4,}$/.test(passwordAntiguo)}" placeholder="Contraseña Antígua" :required="isPasswordAttempt" autocomplete="current-password" maxlength="20" />
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
                                   class="form-control" :class="{'is-invalid':password && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(password),'is-valid':password && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(password)}" placeholder="Mín. 8 caracteres" :required="isPasswordAttempt" autocomplete="new-password" maxlength="20" />
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
                                   class="form-control" :class="{'is-invalid':passwordRepetir && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(passwordRepetir),'is-valid':passwordRepetir && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(passwordRepetir)}" placeholder="Confirma la nueva" :required="isPasswordAttempt" autocomplete="new-password" maxlength="20" />
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
                        maxlength="20"
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
                      <span class="non-editable text-red">{{ dataPerfil?.cedula }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Usuario:</label>
                      <span class="non-editable text-red">{{ dataPerfil?.usuario }}</span>
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
                    <!-- Cargo (No Editables) -->
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Cargo:</label>
                      <span class="non-editable text-red fw-bold">{{ dataPerfil.cargo }}</span>
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
                      <span class="non-editable text-red fw-bold">{{ dataPerfil?.estatus?.nombre }}</span>
                    </div>
                    <div class="col-12 col-md-6 profile-field">
                      <label class="col-form-label fw-bolder text-secondary">Rol:</label>
                      <span class="non-editable text-red fw-bold">{{ dataPerfil?.rol?.nombre }}</span>
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
                    <div class="mb-4">
                        <!-- AlertComponents recibe los avisos de éxito/error del servidor (avisosAlert) y los errores de validación local (validationErrors) -->
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

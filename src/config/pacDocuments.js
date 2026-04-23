export const declaracionPropietarioConfig = {
  id: 'declaracion-propietario',
  title: 'Declaración del Propietario',
  description: 'Documento de conformidad del propietario para la central de generación',
  fileName: 'Declaracion_Propietario',
  route: '/pac/declaracion-propietario',
  endpoint: '/api/v1/documents/pac/declaracion-propietario', // Endpoint específico en PACController
  fields: [
    { type: 'subsection', label: 'Propietario del inmueble o parcela', name: 'propietario_section' },
    { name: 'propietarioNombre', label: 'D. / Dª / La Entidad', type: 'text', fullWidth: true },
    { name: 'propietarioNif', label: 'CIF/NIF', type: 'text' },
    { name: 'propietarioMunicipio', label: 'Domicilio en (Municipio)', type: 'text' },
    { name: 'propietarioDireccion', label: 'Vía pública y nº', type: 'text', fullWidth: true },
    { name: 'propietarioEmail', label: 'e-mail', type: 'email' },
    { name: 'propietarioTelefono', label: 'Teléfono de contacto', type: 'text' },
    { name: 'ubicacionInmueble', label: 'Ubicación inmueble/parcela', type: 'text', fullWidth: true },
    { name: 'municipioUbicacion', label: 'Municipio de ubicación', type: 'text' },
    { name: 'referenciaCatastral', label: 'Referencia Catastral', type: 'text', fullWidth: true },
    { name: 'opcionPropia', label: 'Actuando por cuenta propia', type: 'checkbox', defaultValue: true },

    { type: 'subsection', label: 'Solicitante', name: 'solicitante_section' },
    { name: 'solicitanteNombre', label: 'D. / Dª / La Entidad', type: 'text', fullWidth: true },
    { name: 'solicitanteNif', label: 'CIF/NIF', type: 'text' },
    { name: 'solicitanteMunicipio', label: 'Domicilio en (Municipio)', type: 'text' },
    { name: 'solicitanteDireccion', label: 'Vía pública y nº', type: 'text', fullWidth: true },
    { name: 'solicitanteEmail', label: 'e-mail', type: 'email' },
    { name: 'solicitanteTelefono', label: 'Teléfono de contacto', type: 'text' },

    { type: 'subsection', label: 'Datos de la central', name: 'central_section' },
    { name: 'tipoGeneracion', label: 'Tipo de generación', type: 'text', fullWidth: true, defaultValue: 'FOTOVOLTAICA AUTOCONSUMO' },
    { name: 'potenciaKw', label: 'Potencia (kW)', type: 'text' },

    { type: 'subsection', label: 'Firma y Fecha', name: 'firma_section' },
    { name: 'lugarFirma', label: 'Lugar de firma', type: 'text' },
    { name: 'diaFirma', label: 'Día', type: 'text' },
    { name: 'mesFirma', label: 'Mes', type: 'text' },
    { name: 'anioFirma', label: 'Año', type: 'text' }
  ],
  defaultData: {
    propietarioNombre: '',
    propietarioNif: '',
    propietarioMunicipio: '',
    propietarioDireccion: '',
    propietarioEmail: '',
    propietarioTelefono: '',
    ubicacionInmueble: '',
    municipioUbicacion: '',
    referenciaCatastral: '',
    opcionPropia: true,
    solicitanteNombre: '',
    solicitanteNif: '',
    solicitanteMunicipio: '',
    solicitanteDireccion: '',
    solicitanteEmail: '',
    solicitanteTelefono: '',
    tipoGeneracion: 'FOTOVOLTAICA AUTOCONSUMO',
    potenciaKw: '',
    lugarFirma: 'Bollullos de la Mitación',
    diaFirma: new Date().getDate().toString(),
    mesFirma: new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date()),
    anioFirma: new Date().getFullYear().toString()
  },
  fieldMapping: {
    // Aquí podemos mapear desde los datos generales si los hubiera
    propietarioNombre: 'apellidosNombre',
    propietarioNif: 'nifCif',
    propietarioMunicipio: 'localidadEmplazamiento',
    propietarioDireccion: (formData) => `${formData.emplazamientoCalle} ${formData.numero ? formData.numero : ''}`.trim(),
    solicitanteNombre: 'apellidosNombre',
    solicitanteNif: 'nifCif',
    solicitanteMunicipio: 'localidadEmplazamiento',
    solicitanteDireccion: (formData) => `${formData.emplazamientoCalle} ${formData.numero ? formData.numero : ''}`.trim(),
    lugarFirma: 'localidadEmplazamiento',
    diaFirma: 'dia',
    mesFirma: 'mes',
    anioFirma: 'anio'
  },
  capabilities: {
    canPreview: true,
    canEdit: true,
    canGeneratePDF: true
  }
}

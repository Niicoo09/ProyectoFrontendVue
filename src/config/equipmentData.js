export const equipmentData = {
  modulos: [
    { 
      id: 1, 
      label: 'JA Solar JAM72S30 450/MR', 
      marca: 'JA Solar', 
      potenciaPicoModulo: '450', 
      intensidadIpmp: '10.84', 
      tensionVpmp: '41.52',
      tecnologia: 'Monocristalino -PERC-'
    },
    { 
      id: 2, 
      label: 'Longi Hi-MO 5m 540W', 
      marca: 'Longi', 
      potenciaPicoModulo: '540', 
      intensidadIpmp: '13.12', 
      tensionVpmp: '41.15',
      tecnologia: 'Monocristalino'
    },
    { 
      id: 3, 
      label: 'Canadian Solar HiKu6 550W', 
      marca: 'Canadian Solar', 
      potenciaPicoModulo: '550', 
      intensidadIpmp: '13.20', 
      tensionVpmp: '41.70',
      tecnologia: 'Monocristalino'
    }
  ],
  inversores: [
    { 
      id: 1, 
      label: 'Fronius Symo 5.0-3-M', 
      marcaModelo: 'Fronius Symo', 
      potencia: '5', 
      vccMaxima: '1000', 
      vccMinima: '150', 
      conexion: 'Trifásica', 
      relacionTension: '230V/400V'
    },
    { 
      id: 2, 
      label: 'SMA Sunny Boy 3.0', 
      marcaModelo: 'SMA Sunny Boy', 
      potencia: '3', 
      vccMaxima: '600', 
      vccMinima: '100', 
      conexion: 'Monofásica', 
      relacionTension: '230V'
    },
    { 
      id: 3, 
      label: 'Huawei SUN2000-5KTL-M1', 
      marcaModelo: 'Huawei SUN2000', 
      potencia: '5', 
      vccMaxima: '1100', 
      vccMinima: '140', 
      conexion: 'Trifásica', 
      relacionTension: '230V/400V'
    }
  ],
  baterias: [
    { 
      id: 1, 
      label: 'BYD Battery-Box Premium HVS 5.1', 
      marcaModelo: 'BYD HVS 5.1', 
      tipoBateria: 'LiFePO4', 
      tensionNominal: '204', 
      profundidadDescarga: '100%', 
      tensionMaxima: '240', 
      tensionMinima: '160', 
      energiaTotal: '5.12', 
      potenciaMaxima: '5.12', 
      maximoPicoPotencia: '10.24'
    },
    { 
      id: 2, 
      label: 'Luna2000-5-S0 5kWh', 
      marcaModelo: 'Huawei Luna2000', 
      tipoBateria: 'Litio', 
      tensionNominal: '360', 
      profundidadDescarga: '100%', 
      tensionMaxima: '450', 
      tensionMinima: '300', 
      energiaTotal: '5.0', 
      potenciaMaxima: '2.5', 
      maximoPicoPotencia: '3.5'
    }
  ]
};

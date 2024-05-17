import './App.css';
import GoogleMap from './GoogleMaps';
import React, { useEffect, useState } from 'react';
import Airtable from 'airtable';

const App = () => {
  const [lugares, setLugares] = useState([]); // Estado para almacenar los lugares
  const [regiones, setRegiones] = useState([]); // Estado para almacenar las regiones
  const [regionSeleccionada, setRegionSeleccionada] = useState(''); // Estado para la región seleccionada
  const [comunasFiltradas, setComunasFiltradas] = useState([]); // Estado para las comunas filtradas
  const [comunaSeleccionada, setComunaSeleccionada] = useState(''); // Estado para la comuna seleccionada

  useEffect(() => {
    // Código para obtener datos de Airtable al montar el componente
    const base = new Airtable({ apiKey: 'patEoi7AtHGGV0JPS.f38ac0e7a3df9f6ba5977200021c377fd6a0fdfb921d1bfa6623ff856081a3bd' }).base('appnuQpTRhrx0edsL');
    base('Lugares').select({
      view: 'Vista de cuadrícula'
    }).eachPage((records, fetchNextPage) => {
      const lugaresData = records.map(record => ({
        nombre: record.get('Nombre'),
        lat: parseFloat(record.get('Latitud')),
        lng: parseFloat(record.get('Longitud')),
        region: record.get('Region'),
        comuna: record.get('Comuna'),
        descripcion: record.get('Descripcion')
      }));
      const regionesData = records.map(record => record.get('Region'));
      setLugares(lugaresData); // Actualizar el estado con los datos de los lugares
      setRegiones([...new Set(regionesData)]); // Eliminar duplicados y actualizar el estado con las regiones
      fetchNextPage();
    }, error => {
      if (error) {
        console.error(error);
      }
    });
  }, []);

  useEffect(() => {
    // Filtrar las comunas basadas en la región seleccionada
    if (regionSeleccionada) {
      const comunasFiltradas = lugares
        .filter(lugar => lugar.region === regionSeleccionada)
        .map(lugar => lugar.comuna);
      setComunasFiltradas([...new Set(comunasFiltradas)]); // Eliminar duplicados
    } else {
      setComunasFiltradas([]);
    }
  }, [regionSeleccionada, lugares]);

  const handleRegionChange = (e) => {
    setRegionSeleccionada(e.target.value);
    setComunaSeleccionada(''); // Resetear la comuna seleccionada cuando se cambia la región
  };

  const handleComunaChange = (e) => {
    setComunaSeleccionada(e.target.value);
  };

  return (
    <div className="App">
      <main>
        <select
          value={regionSeleccionada}
          onChange={handleRegionChange}
        >
          <option value="">Selecciona una región</option>
          {regiones.map((region, index) => (
            <option key={index} value={region}>{region}</option>
          ))}
        </select>
        <select
          value={comunaSeleccionada}
          onChange={handleComunaChange}
          disabled={!regionSeleccionada} // Deshabilitar si no hay una región seleccionada
        >
          <option value="">Selecciona una comuna</option>
          {comunasFiltradas.map((comuna, index) => (
            <option key={index} value={comuna}>{comuna}</option>
          ))}
        </select>
        <GoogleMap lugares={lugares.filter(lugar => {
          return (regionSeleccionada === '' || lugar.region === regionSeleccionada) &&
                 (comunaSeleccionada === '' || lugar.comuna === comunaSeleccionada);
        })} /> {/* Pasar los lugares filtrados al componente GoogleMap */}
      </main>
    </div>
  );
}

export default App;

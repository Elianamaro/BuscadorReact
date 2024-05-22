import './App.css';
import GoogleMaps from './GoogleMaps';
import React, { useEffect, useState, useRef } from 'react';
import Airtable from 'airtable';

const App = () => {
  const [lugares, setLugares] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [regionSeleccionada, setRegionSeleccionada] = useState('');
  const [comunasFiltradas, setComunasFiltradas] = useState([]);
  const [comunaSeleccionada, setComunaSeleccionada] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const floatingWindowRef = useRef(null);

  useEffect(() => {
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
        descripcion: record.get('Descripcion'),
        url: record.get('URL'),
        categoria: record.get('Categorias')
      }));

      const categoriasData = records.flatMap(record => record.get('Categorias'));
      setCategorias([...new Set(categoriasData)]); // Esto actualizará las categorías

      const regionesData = records.map(record => record.get('Region'));
      setLugares(lugaresData);
      setRegiones([...new Set(regionesData)]);
      fetchNextPage();
    }, error => {
      if (error) {
        console.error(error);
      }
    });
  }, []);

  useEffect(() => {
    // Actualizar las comunas filtradas cuando se cambia la región seleccionada o la categoría seleccionada
    if (regionSeleccionada) {
      const comunasFiltradas = lugares
        .filter(lugar => lugar.region === regionSeleccionada)
        .filter(lugar => categoriaSeleccionada === '' || lugar.categoria.includes(categoriaSeleccionada))
        .map(lugar => lugar.comuna);
      setComunasFiltradas([...new Set(comunasFiltradas)]);
    } else {
      const comunasFiltradas = lugares
        .filter(lugar => categoriaSeleccionada === '' || lugar.categoria.includes(categoriaSeleccionada))
        .map(lugar => lugar.comuna);
      setComunasFiltradas([...new Set(comunasFiltradas)]);
    }
  }, [regionSeleccionada, categoriaSeleccionada, lugares]);

  const handleCategoriaChange = (e) => {
    const categoriaSeleccionada = e.target.value;
    setCategoriaSeleccionada(categoriaSeleccionada);

    if (categoriaSeleccionada) {
      const lugaresFiltrados = lugares.filter(lugar => lugar.categoria.includes(categoriaSeleccionada));
      const regionesFiltradas = [...new Set(lugaresFiltrados.map(lugar => lugar.region))];
      setRegiones(regionesFiltradas);

      // Reiniciar las selecciones de región y comuna
      setRegionSeleccionada('');
      setComunaSeleccionada('');
      setComunasFiltradas([]);
    } else {
      // Si no se selecciona ninguna categoría, mostrar todas las regiones y comunas
      setRegiones([...new Set(lugares.map(lugar => lugar.region))]);
      setComunasFiltradas([]);
      setRegionSeleccionada('');
      setComunaSeleccionada('');
    }
  };

  const handleRegionChange = (e) => {
    const regionSeleccionada = e.target.value;
    setRegionSeleccionada(regionSeleccionada);

    if (regionSeleccionada) {
      const comunasFiltradas = lugares
        .filter(lugar => lugar.region === regionSeleccionada)
        .filter(lugar => categoriaSeleccionada === '' || lugar.categoria.includes(categoriaSeleccionada))
        .map(lugar => lugar.comuna);
      setComunasFiltradas([...new Set(comunasFiltradas)]);
      setComunaSeleccionada('');
    } else {
      const comunasFiltradas = lugares
        .filter(lugar => categoriaSeleccionada === '' || lugar.categoria.includes(categoriaSeleccionada))
        .map(lugar => lugar.comuna);
      setComunasFiltradas([...new Set(comunasFiltradas)]);
      setComunaSeleccionada('');
    }
  };

  const handleComunaChange = (e) => {
    setComunaSeleccionada(e.target.value);
  };

  useEffect(() => {
    const floatingWindow = floatingWindowRef.current;
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const onMouseDown = (e) => {
      if (e.target.tagName.toLowerCase() === 'select') return; // Prevent dragging when interacting with the select elements
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = floatingWindow.offsetLeft;
      initialTop = floatingWindow.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      floatingWindow.style.left = `${initialLeft + dx}px`;
      floatingWindow.style.top = `${initialTop + dy}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    floatingWindow.addEventListener('mousedown', onMouseDown);

    return () => {
      floatingWindow.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  return (
    <div className="App">
      <div className="floating-window" ref={floatingWindowRef}>
        <div className="select-wrapper">
          <h3>Categoría</h3>
          <select
            value={categoriaSeleccionada}
            onChange={handleCategoriaChange}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria, index) => (
              <option key={index} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
        <div className="select-wrapper">
          <h3>Región</h3>
          <select
            value={regionSeleccionada}
            onChange={handleRegionChange}
            disabled={!categoriaSeleccionada}
          >
            <option value="">Selecciona una región</option>
            {regiones.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </select>
        </div>
        <div className="select-wrapper">
          <h3>Comuna</h3>
          <select
            value={comunaSeleccionada}
            onChange={handleComunaChange}
            disabled={!regionSeleccionada}
          >
            <option value="">Selecciona una comuna</option>
            {comunasFiltradas.map((comuna, index) => (
              <option key={index} value={comuna}>{comuna}</option>
            ))}
          </select>
        </div>
      </div>
      <GoogleMaps 
        lugares={lugares.filter(lugar => {
          return (categoriaSeleccionada === '' || lugar.categoria.includes(categoriaSeleccionada)) &&
                 (regionSeleccionada === '' || lugar.region === regionSeleccionada) &&
                 (comunaSeleccionada === '' || lugar.comuna === comunaSeleccionada);
        })}
        zoom={5} // Establece un nivel de zoom inicial
      />
    </div>
  );
};

export default App;

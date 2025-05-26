// Variables globales
let countries = []; // Array vacío donde se almacenarán los datos de los países obtenidos de la API.
const searchInput = document.getElementById('search'); // Obtiene la referencia al elemento input del HTML con el id "search" (el campo de búsqueda).
const container = document.querySelector('.container'); // Obtiene la referencia al primer elemento div del HTML con la clase "container" (donde se mostrarán los resultados).
const filterMessage = document.getElementById('filter-message'); // Obtiene la referencia al elemento p del HTML con el id "filter-message" (donde se mostrarán mensajes de filtrado).
const weatherApiKey = '8a971ecffcc0dde412ff5ee2e0f4b165'; // **¡REEMPLAZA 'TU_API_KEY' CON TU CLAVE REAL DE OPENWEATHERMAP!** Esta variable almacena tu clave de API para acceder a los datos del clima.

// Función asíncrona para obtener todos los países desde la API.
const getCountries = async () => {
    try {
        // Verifica si el array 'countries' está vacío. Si lo está, significa que aún no se han cargado los países.
        if (countries.length === 0) {
            console.log('Realizando petición a la API de países...'); // Muestra un mensaje en la consola indicando que se está haciendo la petición.
            const response = await fetch('https://restcountries.com/v3.1/all'); // Realiza una petición HTTP GET a la API de Restcountries para obtener todos los países. 'fetch' devuelve una Promesa.
            if (!response.ok) { // Verifica si la respuesta de la API no fue exitosa (códigos de estado HTTP fuera del rango 200-299).
                throw new Error(`Error al obtener los países: ${response.status}`); // Lanza un nuevo error con un mensaje que incluye el código de estado de la respuesta. Esto detendrá la ejecución del 'try' y pasará al bloque 'catch'.
            }
            const data = await response.json(); // Convierte el cuerpo de la respuesta (que está en formato JSON) a un objeto o array de JavaScript. 'response.json()' también devuelve una Promesa, por lo que usamos 'await' para esperar su resolución.
            countries = data; // Asigna los datos de los países obtenidos de la API al array 'countries'. Ahora 'countries' contiene la información de todos los países.
            console.log('Países cargados desde la API:', countries.length); // Muestra en la consola la cantidad de países cargados.
        } else {
            console.log('Los países ya fueron cargados previamente.'); // Si 'countries' no está vacío, significa que ya se cargaron los datos en una llamada anterior.
        }
    } catch (error) {
        console.error('Error al obtener los países:', error); // Si ocurre algún error durante la petición o el procesamiento de la respuesta, este bloque 'catch' lo captura y muestra el error en la consola.
        container.innerHTML = '<p class="error-message">Ocurrió un error al cargar los países.</p>'; // Muestra un mensaje de error en el contenedor del HTML si no se pudieron cargar los países.
    }
};

// Función asíncrona para obtener el clima de un país utilizando sus coordenadas (latitud y longitud).
const getCountryWeather = async (latlng) => {
    try {
        const [lat, lon] = latlng; // Desestructura el array 'latlng' (que contiene latitud y longitud) en dos variables separadas.
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`; // Construye la URL de la API de OpenWeatherMap para obtener el clima de una ubicación específica por latitud y longitud. '&units=metric' asegura que la temperatura se devuelva en grados Celsius.
        const weatherResponse = await fetch(weatherUrl); // Realiza una petición HTTP GET a la API del clima.
        if (!weatherResponse.ok) { // Verifica si la respuesta de la API del clima no fue exitosa.
            console.warn(`Error al obtener el clima para lat=${lat}, lon=${lon}: ${weatherResponse.status}`); // Muestra una advertencia en la consola si no se pudo obtener el clima para las coordenadas dadas.
            return null; // Devuelve 'null' si hubo un error al obtener el clima.
        }
        const weatherData = await weatherResponse.json(); // Convierte la respuesta de la API del clima a formato JSON.
        return weatherData.main.temp; // Retorna solo la temperatura actual del objeto de datos del clima.
    } catch (error) {
        console.error('Error al obtener el clima:', error); // Muestra un error en la consola si ocurre algún problema durante la petición del clima.
        return null; // Devuelve 'null' en caso de error.
    }
};

// Función asíncrona para mostrar la información detallada de un país en el contenedor.
const displayCountryInfo = async (country) => {
    const countryCard = document.createElement('div'); // Crea un nuevo elemento div para representar la tarjeta del país.
    countryCard.classList.add('country-card'); // Añade la clase CSS 'country-card' al div creado para aplicar estilos.

    const flagImg = document.createElement('img'); // Crea un nuevo elemento img para la bandera.
    flagImg.src = country.flags.png; // Establece la URL de la imagen de la bandera desde la propiedad 'flags.png' del objeto del país.
    flagImg.alt = `Bandera de ${country.name.common}`; // Establece el texto alternativo para la imagen de la bandera (importante para accesibilidad).
    countryCard.appendChild(flagImg); // Añade la imagen de la bandera como hijo del div 'countryCard'.

    const detailsDiv = document.createElement('div'); // Crea un nuevo div para contener los detalles del país.
    detailsDiv.classList.add('country-details'); // Añade la clase CSS 'country-details' al div.
    detailsDiv.innerHTML = `
        <h3>${country.name.common}</h3>
        <p>Capital: ${country.capital ? country.capital.join(', ') : 'No tiene capital'}</p>
        <p>Población: ${country.population.toLocaleString()}</p>
        <p>Región: ${country.region}</p>
        <p>Subregión: ${country.subregion || 'No especificada'}</p>
    `; // Establece el contenido HTML del div de detalles con información básica del país. Utiliza interpolación de cadenas y operadores ternarios para manejar casos donde la capital o la subregión no estén definidas. 'toLocaleString()' formatea la población con separadores de miles.

    const weather = await getCountryWeather(country.latlng); // Llama a la función 'getCountryWeather' para obtener la temperatura del país utilizando sus coordenadas. 'await' espera a que la promesa se resuelva.
    if (weather !== null) { // Verifica si se obtuvo la temperatura correctamente (no es 'null').
        detailsDiv.innerHTML += `<p>Temperatura actual: ${weather} °C</p>`; // Agrega la información de la temperatura al div de detalles.
    } else {
        detailsDiv.innerHTML += `<p>Clima no disponible</p>`; // Si no se pudo obtener el clima, muestra un mensaje indicándolo.
    }

    countryCard.appendChild(detailsDiv); // Añade el div de detalles como hijo del div 'countryCard'.
    container.appendChild(countryCard); // Añade la tarjeta del país completa al contenedor principal en el HTML.
};

// Función asíncrona para mostrar la lista de países filtrados en el contenedor.
const displayFilteredCountries = async (filteredList) => {
    container.innerHTML = ''; // Limpia el contenido del contenedor antes de mostrar los resultados filtrados.
    if (filteredList.length > 10) { // Verifica si la cantidad de países filtrados es mayor que 10.
        filterMessage.textContent = 'Demasiados países, sigue añadiendo letras...'; // Muestra un mensaje al usuario indicando que refine su búsqueda.
    } else if (filteredList.length > 0) { // Si la cantidad de países filtrados está entre 1 y 10 (inclusive).
        filterMessage.textContent = ''; // Limpia cualquier mensaje de filtrado anterior.
        for (const country of filteredList) { // Itera sobre cada país en la lista filtrada.
            await displayCountryInfo(country); // Llama a 'displayCountryInfo' para mostrar la información detallada de cada país. 'await' asegura que cada país se muestre completamente antes de pasar al siguiente (aunque en este caso, el efecto visual no es estrictamente secuencial).
        }
    } else { // Si la lista filtrada está vacía (no se encontraron países).
        filterMessage.textContent = 'No se encontraron países.'; // Muestra un mensaje indicando que no hubo resultados para la búsqueda.
    }
};

// Función para filtrar el array de países según el término de búsqueda ingresado por el usuario.
const filterCountries = (searchTerm) => {
    if (!searchTerm) { // Si el término de búsqueda está vacío.
        container.innerHTML = ''; // Limpia el contenedor de cualquier resultado anterior.
        filterMessage.textContent = ''; // Limpia cualquier mensaje de filtrado anterior.
        return; // Sale de la función sin hacer nada más.
    }

    const searchLower = searchTerm.toLowerCase(); // Convierte el término de búsqueda a minúsculas para hacer la búsqueda insensible a mayúsculas.
    const filteredCountries = countries.filter(country => // Utiliza el método 'filter' en el array 'countries' para crear un nuevo array con los países que cumplen la condición.
        country.name.common.toLowerCase().startsWith(searchLower) // La condición verifica si el nombre común del país (convertido a minúsculas) comienza con el término de búsqueda en minúsculas.
    );

    displayFilteredCountries(filteredCountries); // Llama a la función para mostrar los países que pasaron el filtro.
};

// Evento de escucha para el campo de entrada de texto ('search').
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value; // Obtiene el valor actual (el texto ingresado) del campo de búsqueda cada vez que el usuario escribe algo.
    filterCountries(searchTerm); // Llama a la función 'filterCountries' con el término de búsqueda actual para actualizar la lista de países mostrada.
});

// Llama a la función 'getCountries' una vez al cargar la página para obtener los datos de todos los países desde la API.
getCountries();
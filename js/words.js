const WordService = {
  // CDN público de palabras en español (Siempre activo, respuesta instantánea en JSON)
  API_URL: 'https://raw.githubusercontent.com/javierarce/palabras-en-espanol/master/palabras.json',
  
  // Caché en memoria para no volver a descargar el diccionario completo en la misma sesión
  cache: {},

  /**
   * Normaliza texto: remueve tildes manteniendo la letra Ñ.
   */
  cleanWord(word) {
    return word
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Elimina acentos/tildes
      .replace(/[^A-ZÑ]/g, "");       // Conserva solo A-Z y Ñ
  },

  /**
   * Obtiene la lista completa de palabras desde el endpoint y filtra por longitud.
   */
  async getWordsByLength(targetLength) {
    if (this.cache[targetLength]) {
      return this.cache[targetLength];
    }

    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error('Error al conectar con la API de palabras');

      const allWords = await response.json();

      // Procesar, limpiar tildes y filtrar por cantidad de letras
      const filteredWords = allWords
        .map(w => this.cleanWord(w))
        .filter(w => w.length === targetLength);

      this.cache[targetLength] = filteredWords;
      return filteredWords;
    } catch (error) {
      console.warn('No se pudo conectar al servidor de palabras. Usando respaldo local.', error);
      return null;
    }
  },

  /**
   * Retorna una palabra aleatoria de la longitud indicada.
   */
  async getRandomWord(targetLength) {
    const words = await this.getWordsByLength(targetLength);

    if (words && words.length > 0) {
      return words[Math.floor(Math.random() * words.length)];
    }

    // Respaldo de emergencia en caso de falta de conexión a internet
    return this.getFallbackWord(targetLength);
  },

  getFallbackWord(length) {
    const fallbacks = {
      5: ["PERRO", "CASAS", "PLAZA", "LIBRO", "PLAYA", "FUEGO"],
      6: ["CAMINO", "CIUDAD", "TIEMPO", "PUERTA", "BLANCO", "JARDIN"],
      7: ["VENTANA", "TECLADO", "CARRERA", "SISTEMA", "TRABAJO", "ESPACIO"],
      8: ["PROYECTO", "LENGUAJE", "PANTALLA", "PROGRAMA", "OPCIONES", "RECURSOS"]
    };
    const list = fallbacks[length] || fallbacks[5];
    return list[Math.floor(Math.random() * list.length)];
  }
};
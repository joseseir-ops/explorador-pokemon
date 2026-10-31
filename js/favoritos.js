// js/favoritos.js
// La clave con la que guardaremos en el navegador
const CLAVE = 'pokemon:favoritos';

// Leer los favoritos. Si no hay nada, devuelve un arreglo vacío []
export const leerFavoritos = () => {
    try {
        const lista = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
        return Array.isArray(lista) ? lista : [];
    } catch {
        return [];
    }
};

// Guarda la lista completa convirtiéndola a texto JSON
export const guardarFavoritos = (lista) => {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
};

// Pregunta si un ID específico ya está en la lista de favoritos
export const esFavorito = (lista, id) => lista.some((f) => f.id === id);

// Si el Pokémon está, lo quita. Si no está, lo agrega.
export const alternarFavorito = (lista, pokemon) =>
    esFavorito(lista, pokemon.id)
        ? lista.filter((f) => f.id !== pokemon.id) // Lo quita
        : [...lista, pokemon]; // Lo agrega
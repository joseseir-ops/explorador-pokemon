// js/logica.js
export const filtrarPokemones = (lista, filtros) => {
    const buscado = filtros.texto.trim().toLowerCase();
    return lista
        // Filtra por nombre
        .filter((p) => p.name.toLowerCase().includes(buscado))
        // Filtra por tipo (si el filtro.tipo está vacío, los deja pasar todos)
        .filter((p) => filtros.tipo === '' || p.type === filtros.tipo);
};

// La PokéAPI no tiene "vivos o muertos", así que esta función es solo para cumplir la estructura,
// o podríamos contar cuántos son de un tipo específico, pero dejémosla simple: cuenta el total.
export const contarPokemones = (lista) => lista.length;

// Busca un Pokémon específico por su ID
export const buscarPorId = (lista, id) => lista.find((p) => p.id === id);
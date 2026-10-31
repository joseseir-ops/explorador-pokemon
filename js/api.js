// js/api.js
export const URL_POKEMON = 'https://pokeapi.co/api/v2/pokemon?limit=30&offset=0';

export const pedirJSON = async (url) => {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
    return await respuesta.json();
};

export const obtenerPokemones = async (url) => {
    const datosLista = await pedirJSON(url);
    const promesasDetalles = datosLista.results.map((pokemon) => pedirJSON(pokemon.url));
    const detallesCompletos = await Promise.all(promesasDetalles);
    
   const resultadosFormateados = detallesCompletos.map(data => {
        const getStat = (name) => data.stats.find(s => s.stat.name === name).base_stat;
        
        // Extraemos los primeros 12 movimientos y los ponemos en un arreglo
        const primerosMovimientos = data.moves.slice(0, 12).map(m => m.move.name.replace('-', ' '));

        return {
            id: data.id,
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            type: data.types[0].type.name, 
            image: data.sprites.other['official-artwork'].front_default,
            height: data.height,
            weight: data.weight,
            hp: getStat('hp'),
            attack: getStat('attack'),
            defense: getStat('defense'),
            abilities: data.abilities.map(a => a.ability.name).join(', '),
            cry: data.cries.latest,
            
            // ==========================================
            // NUEVOS DATOS PARA EL MODAL AVANZADO
            // ==========================================
            imageShiny: data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny,
            expBase: data.base_experience,
            speed: getStat('speed'),
            spAttack: getStat('special-attack'),
            spDefense: getStat('special-defense'),
            moves: primerosMovimientos
        };
    });
    
    return {
        info: { next: datosLista.next },
        results: resultadosFormateados
    };
};
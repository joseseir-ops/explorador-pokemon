// js/app.js
import { URL_POKEMON, obtenerPokemones } from './api.js';
import { filtrarPokemones, buscarPorId, contarPokemones } from './logica.js';
import { leerFavoritos, guardarFavoritos, esFavorito, alternarFavorito } from './favoritos.js';

// ============ 1. ESTADO ============
const filtros = { texto: '', tipo: '' };
let pokemones = [];
let cargando = false;
let error = null;
let siguiente = URL_POKEMON;
let favoritos = leerFavoritos();
let vista = 'todos';

// ============ 2. COLORES ============
const TYPE_COLORS = {
    electric: { bg: 'bg-[#F8D030]', text: 'text-[#1F2340]', border: 'border-[#F8D030]' },
    fire:     { bg: 'bg-[#F08030]', text: 'text-white',     border: 'border-[#F08030]' },
    water:    { bg: 'bg-[#6890F0]', text: 'text-white',     border: 'border-[#6890F0]' },
    grass:    { bg: 'bg-[#78C850]', text: 'text-white',     border: 'border-[#78C850]' },
    psychic:  { bg: 'bg-[#F85888]', text: 'text-white',     border: 'border-[#F85888]' },
    rock:     { bg: 'bg-[#A8A878]', text: 'text-white',     border: 'border-[#A8A878]' },
    normal:   { bg: 'bg-[#A8A878]', text: 'text-white',     border: 'border-[#A8A878]' },
    bug:      { bg: 'bg-[#A6B91A]', text: 'text-white',     border: 'border-[#A6B91A]' },
    poison:   { bg: 'bg-[#A040A0]', text: 'text-white',     border: 'border-[#A040A0]' }
};

// ============ 3. PLANTILLA TARJETA ============
const tarjetaHTML = (p) => {
    const colors = TYPE_COLORS[p.type] || { bg: 'bg-slate-400', text: 'text-white', border: 'border-slate-400' };
    const fav = esFavorito(favoritos, p.id); 
    
    return `
    <article class="relative flex flex-col rounded-[16px] border-t-[6px] ${colors.border} bg-white px-5 pb-6 pt-7 text-center shadow-[0_6px_16px_rgba(31,35,64,0.08)] transition-all hover:-translate-y-1 hover:border-t-[10px]">
        <button type="button" data-fav="${p.id}" class="absolute top-2 right-3 text-2xl transition hover:scale-110 focus:outline-none ${fav ? 'text-red-500' : 'text-slate-300'}">
            ${fav ? '♥' : '♡'}
        </button>
        <span class="mx-auto mb-3 inline-block rounded-full ${colors.bg} px-3 py-1 text-[0.75rem] font-bold tracking-[0.3px] ${colors.text} uppercase">${p.type}</span>
        <img src="${p.image}" alt="${p.name}" class="mx-auto mb-3 h-[140px] w-[140px] object-contain transition-transform hover:scale-110">
        <h3 class="mb-2 mt-1 text-[1.25rem] font-bold">${p.name}</h3>
        
        <div class="mt-auto flex flex-col gap-2">
            <button type="button" data-id="${p.id}" class="w-full rounded-lg bg-[#1F2340] py-2 font-bold text-[#F4F6FF] transition hover:bg-[#2C3161]">
                Info Básica
            </button>
            <button type="button" data-adv="${p.id}" class="w-full rounded-lg bg-[#EDEFF3] py-2 font-bold text-[#47496B] transition hover:bg-[#FFCB05] hover:text-[#1F2340]">
                Info Avanzada
            </button>
        </div>
    </article>
    `;
};

// ============ 4. REFERENCIAS AL DOM ============
const grilla = document.getElementById('grilla-pokemon');
const btnMas = document.getElementById('btn-mas');
const formBusqueda = document.getElementById('form-busqueda');
const inputBusqueda = document.getElementById('busqueda');
const selectFiltro = document.getElementById('filtro');
const modal = document.getElementById('modal-detalle');
const modalAvanzado = document.getElementById('modal-avanzado');
const contador = document.getElementById('contador');
const menu = document.getElementById('menu');

// ============ 5. RENDERIZADO ============
const listaActual = () => (vista === 'favoritos' ? favoritos : pokemones);

const render = () => {
    btnMas.hidden = vista === 'favoritos' || siguiente === null || pokemones.length === 0;
    btnMas.disabled = cargando;
    btnMas.textContent = cargando ? 'Cargando...' : error ? 'Error. Reintentar' : 'Cargar más Pokémon';

    const sinDatos = vista === 'todos' && pokemones.length === 0;

    if (cargando && sinDatos) {
        grilla.innerHTML = `<p class="col-span-full text-center py-10 text-lg font-bold text-[#47496B] animate-pulse">Atrapando Pokémon de la red...</p>`;
        contador.textContent = '';
        return;
    }

    if (error && sinDatos) {
        grilla.innerHTML = `<div class="col-span-full text-center py-10"><p class="text-lg font-bold text-red-500 mb-2">Error de conexión</p><p class="text-sm text-gray-500">${error}</p></div>`;
        contador.textContent = '';
        return;
    }

    const lista = listaActual();
    const visibles = filtrarPokemones(lista, filtros);
    
    const totalPokemones = contarPokemones(lista);
    contador.textContent = `Mostrando ${visibles.length} de ${totalPokemones} Pokémon`;
    
    if (visibles.length === 0) {
        const mensaje = vista === 'favoritos' && favoritos.length === 0 
            ? 'Aún no tienes favoritos. Haz clic en el corazón (♡) de algún Pokémon.' 
            : 'No se encontraron Pokémon con esa búsqueda.';
        grilla.innerHTML = `<p class="col-span-full text-center py-10 font-bold text-[#47496B]">${mensaje}</p>`;
    } else {
        grilla.innerHTML = visibles.map(tarjetaHTML).join('');
    }
};

// ============ 6. EVENTOS ============
inputBusqueda.addEventListener('input', (e) => {
    filtros.texto = e.target.value;
    render();
});

selectFiltro.addEventListener('change', (e) => {
    filtros.tipo = e.target.value;
    render();
});

formBusqueda.addEventListener('submit', (e) => e.preventDefault());

menu.addEventListener('click', (e) => {
    const enlace = e.target.closest('[data-vista]');
    if (!enlace) return;
    e.preventDefault();
    vista = enlace.dataset.vista;
    
    document.querySelectorAll('[data-vista]').forEach(el => {
        el.classList.remove('bg-[#FFCB05]');
        el.classList.add('hover:bg-[#FFCB05]', 'bg-transparent');
    });
    enlace.classList.add('bg-[#FFCB05]');
    enlace.classList.remove('hover:bg-[#FFCB05]', 'bg-transparent');

    render();
});

// ============ 7. DELEGACIÓN Y MODALES ============
let audioActual = null; 
const calcularPorcentaje = (valor) => Math.min((valor / 150) * 100, 100) + '%';

const abrirDetalle = (p) => {
    document.getElementById('modal-nombre').textContent = p.name;
    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-tipo').textContent = p.type;
    document.getElementById('modal-altura').textContent = (p.height / 10) + ' m';
    document.getElementById('modal-peso').textContent = (p.weight / 10) + ' kg';
    document.getElementById('modal-habilidades').textContent = p.abilities; 
    
    const btnSonido = document.getElementById('btn-sonido');
    btnSonido.onclick = () => {
        if (audioActual) audioActual.pause();
        audioActual = new Audio(p.cry);
        audioActual.volume = 0.5;
        audioActual.play();
    };

    document.getElementById('modal-hp-text').textContent = p.hp;
    document.getElementById('modal-hp-bar').style.width = calcularPorcentaje(p.hp);
    document.getElementById('modal-atk-text').textContent = p.attack;
    document.getElementById('modal-atk-bar').style.width = calcularPorcentaje(p.attack);
    document.getElementById('modal-def-text').textContent = p.defense;
    document.getElementById('modal-def-bar').style.width = calcularPorcentaje(p.defense);
    
    modal.showModal();
};

const abrirDetalleAvanzado = (p) => {
    const imgAdv = document.getElementById('modal-adv-img');
    const btnShiny = document.getElementById('btn-shiny-toggle');
    
    // Estado inicial de la imagen
    let mostrandoShiny = false;
    imgAdv.src = p.image;
    document.getElementById('modal-adv-nombre').textContent = p.name;
    document.getElementById('modal-adv-exp').textContent = p.expBase;
    
    // Lógica para alternar imagen Shiny
    btnShiny.onclick = () => {
        mostrandoShiny = !mostrandoShiny;
        
        // Reiniciar animación quitando y poniendo la clase
        imgAdv.classList.remove('fade-in');
        void imgAdv.offsetWidth; // Truco mágico de CSS para forzar reinicio
        imgAdv.classList.add('fade-in');
        
        imgAdv.src = mostrandoShiny ? p.imageShiny : p.image;
        btnShiny.innerHTML = mostrandoShiny ? 'Normal' : '✨ Ver Shiny';
    };

    // Llenar barras especiales
    document.getElementById('modal-adv-spd-txt').textContent = p.speed;
    document.getElementById('modal-adv-spd-bar').style.width = calcularPorcentaje(p.speed);
    
    document.getElementById('modal-adv-spa-txt').textContent = p.spAttack;
    document.getElementById('modal-adv-spa-bar').style.width = calcularPorcentaje(p.spAttack);
    
    document.getElementById('modal-adv-spd2-txt').textContent = p.spDefense;
    document.getElementById('modal-adv-spd2-bar').style.width = calcularPorcentaje(p.spDefense);

    // Llenar etiquetas de movimientos (badges)
    const contenedorMovimientos = document.getElementById('modal-adv-moves');
    if (p.moves.length > 0) {
        contenedorMovimientos.innerHTML = p.moves.map(mov => 
            `<span class="bg-[#2C3161] text-[#9AA0D4] px-2.5 py-1 rounded-md border border-[#47496B]">${mov}</span>`
        ).join('');
    } else {
        contenedorMovimientos.innerHTML = `<span class="text-[#9AA0D4]">Sin datos de movimientos</span>`;
    }

    modalAvanzado.showModal();
};

// Detener audios al cerrar modales
document.getElementById('btn-cerrar-modal').addEventListener('click', () => { if (audioActual) audioActual.pause(); });

grilla.addEventListener('click', (evento) => {
    const corazon = evento.target.closest('[data-fav]');
    if (corazon) {
        const id = Number(corazon.dataset.fav);
        const pokemon = buscarPorId(listaActual(), id);
        favoritos = alternarFavorito(favoritos, pokemon);
        guardarFavoritos(favoritos);
        render();
        return;
    }

    const botonInfoNormal = evento.target.closest('[data-id]');
    if (botonInfoNormal) {
        const id = Number(botonInfoNormal.dataset.id);
        const pokemon = buscarPorId(listaActual(), id);
        if (pokemon) abrirDetalle(pokemon);
        return;
    }

    // NUEVO EVENTO: Clic en el botón Info Avanzada
    const botonInfoAvanzada = evento.target.closest('[data-adv]');
    if (botonInfoAvanzada) {
        const id = Number(botonInfoAvanzada.dataset.adv);
        const pokemon = buscarPorId(listaActual(), id);
        if (pokemon) abrirDetalleAvanzado(pokemon);
    }
});

// Cerrar modales clicando el fondo
modal.addEventListener('click', (e) => {
    if (e.target === modal) { if (audioActual) audioActual.pause(); modal.close(); }
});
modalAvanzado.addEventListener('click', (e) => {
    if (e.target === modalAvanzado) modalAvanzado.close();
});

btnMas.addEventListener('click', () => cargar());

// ============ 8. CARGA ============
const cargar = async () => {
    cargando = true;
    error = null;
    render(); 
    
    try {
        const datos = await obtenerPokemones(siguiente);
        pokemones = [...pokemones, ...datos.results]; 
        siguiente = datos.info.next; 
    } catch (e) {
        error = e.message;
        console.error("Error técnico al traer Pokémon:", e);
    }
    
    cargando = false;
    render(); 
};

cargar();
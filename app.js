// ==========================================
// 1. VARIABLES GLOBALES Y DICCIONARIOS
// ==========================================
const inputRival = document.getElementById('rival-name');
const btnBuscarRival = document.getElementById('btn-buscar-rival');
const rivalResult = document.getElementById('rival-result');
const rivalImg = document.getElementById('rival-img');
const rivalDisplayName = document.getElementById('rival-display-name');
const rivalTypesContainer = document.getElementById('rival-types');
const teamContainer = document.getElementById('team-container');
const btnGuardarEquipo = document.getElementById('btn-guardar-equipo');
const datalistAutocompletado = document.getElementById('lista-pokemon-autocompletado');

const btnCalcularEstrategia = document.getElementById('btn-calcular-estrategia');
const estrategiaResult = document.getElementById('estrategia-result');

let pokemonRivalActual = null;
let todosLosNombresPokemon = [];

// Aquí se guardarán los 1100+ ataques cargados del archivo local
let todosLosAtaques = [];

// CREACIÓN DINÁMICA DEL DATALIST PARA ATAQUES
const datalistAtaques = document.createElement('datalist');
datalistAtaques.id = 'lista-attacks-autocompletado';
document.body.appendChild(datalistAtaques);

const coloresTipos = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD'
};

const traductorTipos = {
    normal: 'NORMAL', fire: 'FUEGO', water: 'AGUA', electric: 'ELÉCTRICO',
    grass: 'PLANTA', ice: 'HIELO', fighting: 'LUCHA', poison: 'VENENO',
    ground: 'TIERRA', flying: 'VOLADOR', psychic: 'PSÍQUICO', bug: 'BICHO',
    rock: 'ROCA', ghost: 'FANTASMA', dragon: 'DRAGÓN', dark: 'SINIESTRO',
    steel: 'ACERO', fairy: 'HADA'
};

const listaTipos = Object.keys(coloresTipos);

const tablaTipos = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, flying: 2, ground: 0, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// ==========================================
// 2. FUNCIÓN: DESCARGAR DATOS EN MEMORIA
// ==========================================
async function descargarNombresPokemon() {
    try {
        const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
        const datos = await respuesta.json();
        todosLosNombresPokemon = datos.results.map(p => 
            p.name.charAt(0).toUpperCase() + p.name.slice(1)
        );
    } catch (error) {
        console.error("Error al precargar Pokémon:", error);
    }
}

async function cargarBaseDatosAtaques() {
    try {
        const respuesta = await fetch('ataques.json');
        todosLosAtaques = await respuesta.json();
        console.log("¡Los 1100+ ataques en español se han cargado con éxito!");
    } catch (error) {
        console.error("Error al cargar ataques.json local. Asegúrate de tener el archivo en la misma carpeta.", error);
    }
}

// ==========================================
// 3. FUNCIONES DE FILTRADO INTELIGENTE (MÁXIMO 10)
// ==========================================
function manejarFiltroSugerencias(event) {
    const textoUsuario = event.target.value.trim().toLowerCase();
    if (textoUsuario.length === 0) {
        datalistAutocompletado.innerHTML = '';
        return;
    }
    const filtrados = todosLosNombresPokemon.filter(nombre => 
        nombre.toLowerCase().includes(textoUsuario)
    );
    const top10 = filtrados.slice(0, 10);
    datalistAutocompletado.innerHTML = '';
    top10.forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        datalistAutocompletado.appendChild(option);
    });
}

function manejarFiltroAtaques(event) {
    const textoUsuario = event.target.value.trim().toLowerCase();
    if (textoUsuario.length === 0) {
        datalistAtaques.innerHTML = '';
        return;
    }
    const filtrados = todosLosAtaques.filter(atk => 
        atk.nameES.toLowerCase().includes(textoUsuario)
    );
    const top10 = filtrados.slice(0, 10);
    datalistAtaques.innerHTML = '';
    top10.forEach(atk => {
        const option = document.createElement('option');
        option.value = atk.nameES;
        datalistAtaques.appendChild(option);
    });
}

function verificarYBuscarTipoAtaque(event) {
    const inputAtk = event.target;
    const valorInput = inputAtk.value.trim();
    
    const ataqueEncontrado = todosLosAtaques.find(atk => atk.nameES.toLowerCase() === valorInput.toLowerCase());
    
    if (ataqueEncontrado) {
        const selectTipo = inputAtk.nextElementSibling;
        if (selectTipo && selectTipo.classList.contains('atk-type')) {
            selectTipo.value = ataqueEncontrado.type;
        }
    }
}

// Auxiliar para colorear dinámicamente el fondo de una ranura según sus tipos
function actualizarColorSlot(slotElement, tipo1, tipo2) {
    if (!tipo1) {
        slotElement.style.background = '';
        slotElement.style.borderColor = '';
        return;
    }
    const col1 = coloresTipos[tipo1];
    const col2 = tipo2 ? coloresTipos[tipo2] : col1;
    
    // Inyectamos un degradado sutil y oscuro usando los colores de sus tipos elementales
    slotElement.style.background = `linear-gradient(135deg, ${col1}25 0%, ${col2}10 100%), #1c2030`;
    slotElement.style.borderColor = col1;
}

// ==========================================
// 4. INICIO DE LA APP: GENERAR RANURAS
// ==========================================
async function inicializarApp() {
    teamContainer.innerHTML = ''; 

    await descargarNombresPokemon();
    await cargarBaseDatosAtaques();

    inputRival.addEventListener('input', manejarFiltroSugerencias);
    btnCalcularEstrategia.addEventListener('click', calcularEstrategia);

    const equipoGuardado = JSON.parse(localStorage.getItem('maestro_pokemon_team'));

    for (let i = 1; i <= 6; i++) {
        const datosSlot = equipoGuardado ? equipoGuardado[i - 1] : null;
        const slotDiv = document.createElement('div');
        slotDiv.className = 'pokemon-slot';
        
        let opcionesTiposHTML = `<option value="">Ninguno</option>`;
        listaTipos.forEach(tipo => {
            opcionesTiposHTML += `<option value="${tipo}">${traductorTipos[tipo]}</option>`;
        });

        slotDiv.innerHTML = `
            <div class="slot-mini-container">
                <div class="slot-header">POKÉMON #${i}</div>
                <img class="slot-mini-img ${datosSlot && datosSlot.foto ? '' : 'hidden'}" src="${datosSlot ? datosSlot.foto : ''}" alt="Miniatura">
            </div>
            
            <div class="flex-row">
                <input type="text" class="poke-name" list="lista-pokemon-autocompletado" placeholder="Nombre (Ej: Mewtwo)" value="${datosSlot ? datosSlot.nombre : ''}">
                <button class="btn-cargar-propio" type="button">🔍 Ok</button>
            </div>

            <div class="grid-2">
                <select class="poke-type1">${opcionesTiposHTML}</select>
                <select class="poke-type2">${opcionesTiposHTML}</select>
            </div>
            
            <div class="attacks-title">⚔️ Ataques configurados</div>
            <div class="grid-2"><input type="text" class="atk-name" data-atk="1" placeholder="Ataque 1" value="${datosSlot ? datosSlot.ataques[0].nombre : ''}"><select class="atk-type" data-atk="1">${opcionesTiposHTML}</select></div>
            <div class="grid-2"><input type="text" class="atk-name" data-atk="2" placeholder="Ataque 2" value="${datosSlot ? datosSlot.ataques[1].nombre : ''}"><select class="atk-type" data-atk="2">${opcionesTiposHTML}</select></div>
            <div class="grid-2"><input type="text" class="atk-name" data-atk="3" placeholder="Ataque 3" value="${datosSlot ? datosSlot.ataques[2].nombre : ''}"><select class="atk-type" data-atk="3">${opcionesTiposHTML}</select></div>
            <div class="grid-2"><input type="text" class="atk-name" data-atk="4" placeholder="Ataque 4" value="${datosSlot ? datosSlot.ataques[3].nombre : ''}"><select class="atk-type" data-atk="4">${opcionesTiposHTML}</select></div>
        `;

        teamContainer.appendChild(slotDiv);

        if (datosSlot) {
            slotDiv.querySelector('.poke-type1').value = datosSlot.tipo1;
            slotDiv.querySelector('.poke-type2').value = datosSlot.tipo2;
            slotDiv.querySelectorAll('.atk-type').forEach((select, index) => {
                select.value = datosSlot.ataques[index].tipo;
            });
            actualizarColorSlot(slotDiv, datosSlot.tipo1, datosSlot.tipo2);
        }

        const inputNombrePropio = slotDiv.querySelector('.poke-name');
        inputNombrePropio.addEventListener('input', manejarFiltroSugerencias);

        // Al cambiar manualmente los desplegables de tipo, también actualizamos el color táctico de la tarjeta
        const selT1 = slotDiv.querySelector('.poke-type1');
        const selT2 = slotDiv.querySelector('.poke-type2');
        const dispararColor = () => actualizarColorSlot(slotDiv, selT1.value, selT2.value);
        selT1.addEventListener('change', dispararColor);
        selT2.addEventListener('change', dispararColor);

        slotDiv.querySelectorAll('.atk-name').forEach(inputAtk => {
            inputAtk.setAttribute('list', 'lista-attacks-autocompletado');
            inputAtk.addEventListener('input', manejarFiltroAtaques);
            inputAtk.addEventListener('input', verificarYBuscarTipoAtaque);
        });

        const btnCargar = slotDiv.querySelector('.btn-cargar-propio');
        btnCargar.addEventListener('click', () => cargarPokemonEnMiEquipo(slotDiv));
    }
}

// ==========================================
// 5. AUTO-CARGAR TU POKÉMON DESDE LA API
// ==========================================
async function cargarPokemonEnMiEquipo(slotElement) {
    const inputNombre = slotElement.querySelector('.poke-name');
    const nombreBuscar = inputNombre.value.trim().toLowerCase();

    if (nombreBuscar === '') {
        alert('Escribe el nombre del Pokémon antes de pulsar el botón.');
        return;
    }

    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombreBuscar}`);
        if (!respuesta.ok) throw new Error('No encontrado');

        const datos = await respuesta.json();
        const tipos = datos.types.map(s => s.type.name);

        const selectTipo1 = slotElement.querySelector('.poke-type1');
        const selectTipo2 = slotElement.querySelector('.poke-type2');

        selectTipo1.value = tipos[0] || "";
        selectTipo2.value = tipos[1] || "";

        const imgMini = slotElement.querySelector('.slot-mini-img');
        imgMini.src = datos.sprites.front_default;
        imgMini.classList.remove('hidden');

        inputNombre.value = datos.name.charAt(0).toUpperCase() + datos.name.slice(1);
        
        // Sincronizamos la iluminación de color del slot recién cargado
        actualizarColorSlot(slotElement, tipos[0], tipos[1]);

    } catch (error) {
        alert(`No pudimos encontrar a "${nombreBuscar}". Revisa si está bien escrito.`);
    }
}

// ==========================================
// 6. GUARDAR EL EQUIPO (LocalStorage)
// ==========================================
btnGuardarEquipo.addEventListener('click', () => {
    const slots = document.querySelectorAll('.pokemon-slot');
    const nuevoEquipo = [];

    slots.forEach((slot) => {
        const nombre = slot.querySelector('.poke-name').value.trim();
        const tipo1 = slot.querySelector('.poke-type1').value;
        const tipo2 = slot.querySelector('.poke-type2').value;
        const foto = slot.querySelector('.slot-mini-img').src;

        const ataques = [];
        for (let a = 1; a <= 4; a++) {
            const atkNombre = slot.querySelector(`.atk-name[data-atk="${a}"]`).value.trim();
            const atkTipo = slot.querySelector(`.atk-type[data-atk="${a}"]`).value;
            ataques.push({ nombre: atkNombre, tipo: atkTipo });
        }

        nuevoEquipo.push({ nombre, tipo1, tipo2, foto, ataques });
    });

    localStorage.setItem('maestro_pokemon_team', JSON.stringify(nuevoEquipo));
    alert('🏆 ¡Equipo guardado con éxito!');
});

// ==========================================
// 7. LÓGICA DEL BUSCADOR DEL RIVAL
// ==========================================
btnBuscarRival.addEventListener('click', buscarRivalEnAPI);
inputRival.addEventListener('keypress', (e) => { if (e.key === 'Enter') buscarRivalEnAPI(); });

async function buscarRivalEnAPI() {
    const nombreBuscar = inputRival.value.trim().toLowerCase();
    if (nombreBuscar === '') {
        alert('Escribe el nombre de un Pokémon primero.');
        return;
    }

    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombreBuscar}`);
        if (!respuesta.ok) throw new Error('Pokémon no encontrado');

        const datos = await respuesta.json();
        const tipos = datos.types.map(slot => slot.type.name);

        pokemonRivalActual = { nombre: datos.name, tipos: tipos };

        rivalDisplayName.textContent = datos.name.toUpperCase();
        rivalImg.src = datos.sprites.other['official-artwork'].front_default || datos.sprites.front_default;
        
        rivalTypesContainer.innerHTML = '';
        tipos.forEach(tipo => {
            const badge = document.createElement('span');
            badge.className = 'type-badge';
            badge.textContent = traductorTipos[tipo] || tipo.toUpperCase();
            badge.style.backgroundColor = coloresTipos[tipo] || '#666';
            rivalTypesContainer.appendChild(badge);
        });

        rivalResult.classList.remove('hidden');

    } catch (error) {
        alert('No se ha encontrado ese Pokémon.');
        rivalResult.classList.add('hidden');
        pokemonRivalActual = null;
    }
}

// ==========================================
// 8. FASE 4: CÁLCULO DE ESTRATEGIA MATRICIAL
// ==========================================
function obtenerEfectividad(tipoAtaque, tipoDefensor) {
    if (!tipoAtaque || !tipoDefensor) return 1;
    if (tablaTipos[tipoAtaque] && tablaTipos[tipoAtaque][tipoDefensor] !== undefined) {
        return tablaTipos[tipoAtaque][tipoDefensor];
    }
    return 1;
}

function calcularEstrategia() {
    if (!pokemonRivalActual) {
        alert("⚠️ Primero debes buscar un Pokémon rival para poder calcular la estrategia.");
        return;
    }

    const slots = document.querySelectorAll('.pokemon-slot');
    let htmlResultados = `<h3 style="margin-top:0; color:#fff; border-bottom:2px dashed var(--border-color); padding-bottom:12px; font-family:'Orbitron', sans-serif; letter-spacing:1px; margin-bottom:20px;">📊 ANÁLISIS DE COMBATE CONTRA ${pokemonRivalActual.nombre.toUpperCase()}</h3>`;
    
    let liderRecomendado = null;
    let mejorPuntuacionGlobal = -999;

    slots.forEach((slot, index) => {
        const nombre = slot.querySelector('.poke-name').value.trim() || `Pokémon #${index + 1}`;
        const tipo1 = slot.querySelector('.poke-type1').value;
        const tipo2 = slot.querySelector('.poke-type2').value;

        if (!tipo1 && slot.querySelector('.poke-name').value.trim() === '') return;

        let maxMultiplicadorAtaque = 0;
        let mejorAtaqueNombre = "Ninguno";

        for (let a = 1; a <= 4; a++) {
            const atkNombre = slot.querySelector(`.atk-name[data-atk="${a}"]`).value.trim();
            const atkTipo = slot.querySelector(`.atk-type[data-atk="${a}"]`).value;

            if (atkTipo) {
                let mult = obtenerEfectividad(atkTipo, pokemonRivalActual.tipos[0]);
                if (pokemonRivalActual.tipos[1]) {
                    mult *= obtenerEfectividad(atkTipo, pokemonRivalActual.tipos[1]);
                }
                
                if (mult > maxMultiplicadorAtaque) {
                    maxMultiplicadorAtaque = mult;
                    mejorAtaqueNombre = atkNombre !== "" ? `"${atkNombre}"` : `Ataque tipo ${traductorTipos[atkTipo]}`;
                }
            }
        }

        let maxDañoRecibido = 1;
        pokemonRivalActual.tipos.forEach(tipoRival => {
            let dmg = obtenerEfectividad(tipoRival, tipo1);
            if (tipo2) dmg *= obtenerEfectividad(tipoRival, tipo2);
            if (dmg > maxDañoRecibido) maxDañoRecibido = dmg;
        });

        let puntuacionTactica = (maxMultiplicadorAtaque * 2.5) - (maxDañoRecibido * 1.5);

        let txtOfensivo = `Neutral (x1)`;
        if (maxMultiplicadorAtaque > 1) txtOfensivo = `<span style="color:#34c759; font-weight:bold;">🔥 Súper efectivo (x${maxMultiplicadorAtaque}) con ${mejorAtaqueNombre}</span>`;
        if (maxMultiplicadorAtaque < 1 && maxMultiplicadorAtaque > 0) txtOfensivo = `<span style="color:#ffcc00;">🛡️ Poco efectivo (x${maxMultiplicadorAtaque})</span>`;
        if (maxMultiplicadorAtaque === 0) txtOfensivo = `<span style="color:#ff3b30;">❌ Sin efecto (x0)</span>`;

        let txtDefensivo = `Neutral (x1)`;
        if (maxDañoRecibido > 1) txtDefensivo = `<span style="color:#ff3b30; font-weight:bold;">⚠️ Debilidad crítica (Recibe x${maxDañoRecibido})</span>`;
        if (maxDañoRecibido < 1) txtDefensivo = `<span style="color:#34c759;">🛡️ Resistente (Recibe x${maxDañoRecibido})</span>`;

        htmlResultados += `
            <div style="background: #0d0f17; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--border-color); border-left: 5px solid ${maxMultiplicadorAtaque > 1 ? '#34c759' : '#444'}">
                <strong style="color: var(--poke-yellow); font-family:'Orbitron', sans-serif; font-size: 1.1rem; letter-spacing:0.5px;">${nombre.toUpperCase()}</strong><br>
                <div style="font-size:1rem; color:var(--text-muted); margin-top:8px; line-height:1.6;">
                    • <strong>Poder Ofensivo:</strong> ${txtOfensivo}<br>
                    • <strong>Resistencia Corporal:</strong> ${txtDefensivo}
                </div>
            </div>
        `;

        if (puntuacionTactica > mejorPuntuacionGlobal) {
            mejorPuntuacionGlobal = puntuacionTactica;
            liderRecomendado = nombre;
        }
    });

    if (liderRecomendado) {
        htmlResultados += `
            <div style="background: rgba(52, 199, 89, 0.1); border: 2px solid #34c759; padding: 20px; border-radius: 10px; text-align: center; margin-top: 25px; box-shadow: 0 0 15px rgba(52, 199, 89, 0.2);">
                <h4 style="margin: 0 0 8px 0; color: #34c759; font-family:'Orbitron', sans-serif; font-size: 1.3rem; letter-spacing:1px;">👑 POKÉMON INICIAL RECOMENDADO</h4>
                <p style="margin: 0; color: var(--text-main); font-size: 1.05rem;">Te sugiero empezar el combate con <strong>${liderRecomendado.toUpperCase()}</strong>. Es tu pieza con mejor balance para destrozar al rival minimizando riesgos.</p>
            </div>
        `;
    }

    estrategiaResult.innerHTML = htmlResultados;
    estrategiaResult.classList.remove('hidden');
    estrategiaResult.scrollIntoView({ behavior: 'smooth' });
}

// Inicialización de la App
inicializarApp();
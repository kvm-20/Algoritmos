// =====================================================
// script.js - Lógica de Algoritmos y Visualización Canvas
// Archivo completamente comentado línea por línea
// =====================================================


/* =====================================================
   HERRAMIENTAS BÁSICAS
   ===================================================== */

// Función auxiliar para obtener un elemento del DOM por ID.
function $id(id) { return document.getElementById(id); }

// Escribe texto reemplazando el contenido previo.
function writeOutput(id, text) { $id(id).textContent = text; }

// Agrega texto al final del contenido existente.
function appendOutput(id, text) { $id(id).textContent += text + "\n"; }

// Intenta convertir un texto a JSON. 
// Si falla, devuelve null para evitar errores.
function safeParseJSON(text) { try { return JSON.parse(text); } catch(e) { return null; } }

// Pausa la ejecución X milisegundos para animaciones.
// Retorna una Promesa que se resuelve después del tiempo indicado.
function sleep(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms)); 
}



/* =====================================================
   MOTOR GRÁFICO (CANVAS)
   Se encarga de dibujar nodos, aristas y colores.
   ===================================================== */

// Calcula posiciones de nodos en forma circular dentro del canvas.
function getCircularCoords(nodes, width, height) {
    const coords = {};                    // Objeto donde se guardarán coordenadas finales.
    const centerX = width / 2;            // Centro horizontal del canvas.
    const centerY = height / 2;           // Centro vertical del canvas.
    const radius = Math.min(width, height) / 2 - 50;  // Radio dinámico.
    const angleStep = (2 * Math.PI) / nodes.length;   // Ángulo entre nodos.

    // Recorre cada nodo y le asigna su posición usando trigonometría.
    nodes.forEach((node, index) => {
        coords[node] = {
            x: centerX + radius * Math.cos(index * angleStep),
            y: centerY + radius * Math.sin(index * angleStep)
        };
    });

    return coords; // Devuelve posiciones finales.
}


// Función encargada de dibujar TODO: nodos, aristas y colores.
function drawGraph(ctx, coords, edges, nodeColors = {}, edgeColors = []) {

    // Limpia el canvas completo antes de redibujar.
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Configura estilo de texto para nombres de nodos.
    ctx.font = "bold 14px Consolas";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // -------------------------------------------------
    // DIBUJAR ARISTAS
    // -------------------------------------------------
    edges.forEach(edge => {
        const start = coords[edge.u];     // Coordenada inicial.
        const end = coords[edge.v];       // Coordenada final.

        if (!start || !end) return;       // Si falta una coordenada, no dibuja nada.

        // Busca si la arista tiene un color especial (animación).
        const specialColor = edgeColors.find(e => 
            (e.u === edge.u && e.v === edge.v) ||
            (e.u === edge.v && e.v === edge.u)
        );

        ctx.beginPath();                  // Inicia línea.
        ctx.moveTo(start.x, start.y);     // Punto inicial.
        ctx.lineTo(end.x, end.y);         // Punto final.

        // Si hay color especial, úsalo.
        if (specialColor) {
            ctx.strokeStyle = specialColor.color;
            ctx.lineWidth = 4;            // Línea más gruesa.
        } else {
            ctx.strokeStyle = "#4b5563";  // Color por defecto.
            ctx.lineWidth = 2;
        }
        ctx.stroke();                     // Dibuja línea.

        // Si la arista tiene peso, lo dibuja en el centro.
        if (edge.w !== undefined) {
            const midX = (start.x + end.x) / 2;   // Punto medio X.
            const midY = (start.y + end.y) / 2;   // Punto medio Y.

            ctx.fillStyle = "#000";               // Fondo negro para contraste.
            ctx.fillRect(midX - 12, midY - 12, 24, 24);

            ctx.fillStyle = "#fbbf24";            // Número en amarillo.
            ctx.fillText(edge.w, midX, midY);
        }
    });


    // -------------------------------------------------
    // DIBUJAR NODOS
    // -------------------------------------------------
    for (let node in coords) {
        const { x, y } = coords[node];   // Obtiene coordenadas del nodo.

        ctx.beginPath();                 // Inicia dibujo del círculo.
        ctx.arc(x, y, 22, 0, 2 * Math.PI); // Círculo radio 22px.

        // Color del relleno según estado.
        ctx.fillStyle = nodeColors[node] || "#1f2937";
        ctx.fill();

        // Borde blanco del nodo.
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibuja la letra del nodo.
        ctx.fillStyle = "#fff";
        ctx.fillText(node, x, y);
    }
}



/* =====================================================
   1. ALGORITMO DE EUCLIDES — MCD
   ===================================================== */

// Evento: cuando se hace clic en el botón del MCD.
$id('btn-euclid').addEventListener('click', () => {

    // Obtiene los valores ingresados por el usuario.
    let a = parseInt($id('eu_a').value);
    let b = parseInt($id('eu_b').value);

    // Escribe encabezado en el área de salida.
    writeOutput('out-euclid', `--- MCD de ${a} y ${b} ---\n`);

    let paso = 1;  // Contador para mostrar pasos.

    // Bucle principal del algoritmo de Euclides.
    while (b !== 0) {
        let r = a % b;  // Calcula el residuo.

        // Muestra el paso matemático realizado.
        appendOutput('out-euclid',
            `Paso ${paso}: ${a} = ${b} * ${Math.floor(a/b)} + ${r}`);

        // Actualiza valores para el siguiente ciclo.
        a = b;
        b = r;
        paso++;
    }

    // Muestra el resultado final.
    appendOutput('out-euclid', `✅ Resultado MCD: ${a}`);
});



/* =====================================================
   2. EUCLIDES EXTENDIDO
   ===================================================== */

// Evento: cuando se hace clic en el botón.
$id('btn-ext').addEventListener('click', () => {

    // Se obtienen los números A y B.
    let a = parseInt($id('ext_a').value);
    let b = parseInt($id('ext_b').value);

    // Inicialización de variables del algoritmo extendido.
    let old_r = a, r = b;       // r: residuos.
    let old_s = 1, s = 0;       // s: coeficientes.
    let old_t = 0, t = 1;       // t: coeficientes.

    writeOutput('out-ext', `--- Calculando coeficientes ---\n`);

    // Bucle principal.
    while (r !== 0) {
        let q = Math.floor(old_r / r);   // Cálculo del cociente.

        // Actualización simultánea de r, s y t.
        [old_r, r] = [r, old_r - q * r];
        [old_s, s] = [s, old_s - q * s];
        [old_t, t] = [t, old_t - q * t];
    }

    // Muestra resultados finales.
    appendOutput('out-ext', `MCD: ${old_r}`);
    appendOutput('out-ext', `Coeficientes: s=${old_s}, t=${old_t}`);
    appendOutput('out-ext',
        `Prueba: ${a}(${old_s}) + ${b}(${old_t}) = ${old_r}`);
});



/* =====================================================
   3. RSA - CIFRADO Y DESCIFRADO
   ===================================================== */

// Potenciación modular eficiente para números grandes.
const modPow = (b, e, m) => {
    let r = 1n;                       // Resultado.
    b = BigInt(b); e = BigInt(e); m = BigInt(m);  // Convertir a BigInt.

    while (e > 0n) {                  // Exponente mayor que 0.
        if (e % 2n === 1n)            // Si el exponente es impar:
            r = (r * b) % m;          // Multiplica y reduce módulo.
        b = (b * b) % m;              // Cuadrado base módulo n.
        e /= 2n;                      // Reduce exponente a la mitad.
    }
    return Number(r);                 // Devuelve resultado como número.
};

// Calcula inverso modular usando algoritmo extendido.
const invMod = (a, m) => {
    let [t, newt, r, newr] = [0, 1, m, a];

    // Algoritmo estilo Euclides extendido.
    while (newr !== 0) {
        let q = Math.floor(r / newr);
        [t, newt] = [newt, t - q * newt];
        [r, newr] = [newr, r - q * newr];
    }

    if (r > 1) return null;      // No existe inverso.
    if (t < 0) t += m;           // Ajuste si es negativo.
    return t;
};

// MCD común.
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);


// Evento: botón RSA.
$id('btn-rsa').addEventListener('click', () => {

    // Entrada usuario: p, q y mensaje m.
    let p = parseInt($id('rsa_p').value);
    let q = parseInt($id('rsa_q').value);
    let m = parseInt($id('rsa_m').value);

    // Calcular n y phi.
    let n = p * q;
    let phi = (p - 1) * (q - 1);

    // Elegir e que sea coprimo con phi.
    let e = 3;
    while (gcd(e, phi) !== 1) e += 2;

    // Calcular la clave privada d.
    let d = invMod(e, phi);

    // Mostrar claves.
    writeOutput('out-rsa',
        `Claves generadas:\nPublica (e,n): (${e}, ${n})\nPrivada (d,n): (${d}, ${n})`);

    // Cifrar y descifrar mensaje.
    let c = modPow(m, e, n);
    let original = modPow(c, d, n);

    appendOutput('out-rsa',
        `\nMensaje: ${m} -> Cifrado: ${c} -> Descifrado: ${original}`);
});



/* =====================================================
   4. DIJKSTRA (ANIMADO)
   ===================================================== */

// Evento botón.
$id('btn-dijkstra').addEventListener('click', async () => {

    // Obtiene canvas y su contexto.
    const cv = $id('cv_dijkstra');
    const ctx = cv.getContext('2d');

    // Convierte texto del usuario a JSON.
    const graph = safeParseJSON($id('dij_graph').value);

    // Nodo inicial.
    const start = $id('dij_src').value.trim();

    if (!graph || !graph[start]) 
        return alert("Datos incorrectos");

    // Obtiene lista de nodos.
    const nodes = Object.keys(graph);

    // Calcula posiciones circulares.
    const coords = getCircularCoords(nodes, cv.width, cv.height);

    // Convierte objetos a lista de aristas.
    const edgesDraw = [];
    nodes.forEach(u => {
        Object.keys(graph[u]).forEach(v => {
            if (u < v) edgesDraw.push({u, v, w: graph[u][v]});
        });
    });

    // Inicializa distancias.
    let dist = {};
    nodes.forEach(n => dist[n] = Infinity);
    dist[start] = 0;

    // Conjunto de nodos sin visitar.
    let unvisited = new Set(nodes);

    // Colores visuales de nodos.
    let nodeColors = {};

    // Mensaje inicial.
    writeOutput('out-dijkstra', `Iniciando desde ${start}...`);

    // Ciclo principal del algoritmo.
    while (unvisited.size > 0) {

        // Busca nodo con menor distancia.
        let curr = null;
        for (let n of unvisited)
            if (!curr || dist[n] < dist[curr])
                curr = n;

        // Si quedan nodos desconectados, se termina.
        if (dist[curr] === Infinity) break;

        // Pintar nodo actual en amarillo.
        nodeColors[curr] = '#fbbf24';
        drawGraph(ctx, coords, edgesDraw, nodeColors);

        // Mostrar progreso.
        appendOutput('out-dijkstra',
            `-> Analizando ${curr} (Distancia: ${dist[curr]})`);
        await sleep(800);

        // Revisar vecinos del nodo actual.
        for (let neighbor in graph[curr]) {

            if (unvisited.has(neighbor)) {

                let newDist = dist[curr] + graph[curr][neighbor];

                // Si mejora distancia, actualizar.
                if (newDist < dist[neighbor]) {
                    dist[neighbor] = newDist;

                    // Resaltar arista en rojo.
                    drawGraph(ctx, coords, edgesDraw,
                              nodeColors,
                              [{u: curr, v: neighbor, color: '#ef4444'}]);
                    await sleep(500);
                }
            }
        }

        // Marcar nodo como visitado (verde).
        unvisited.delete(curr);
        nodeColors[curr] = '#10b981';
        drawGraph(ctx, coords, edgesDraw, nodeColors);
    }

    // Mostrar distancias finales.
    appendOutput('out-dijkstra', 
        `Distancias finales: ${JSON.stringify(dist)}`);
});



/* =====================================================
   5. KRUSKAL (ANIMADO)
   ===================================================== */

// Se obtiene el botón con id 'btn-kruskal' y se le agrega un evento
// que se ejecuta cuando el usuario hace clic.
// La función es async porque usa 'await' para las animaciones.
$id('btn-kruskal').addEventListener('click', async () => {

    // Se obtiene el canvas donde se dibuja el grafo.
    const cv = $id('cv_kruskal');

    // Se obtiene el contexto 2D del canvas (para dibujar líneas, nodos, etc.).
    const ctx = cv.getContext('2d');

    // Se obtiene el texto del campo 'kr_graph' y se intenta convertir a JSON.
    // Este campo normalmente contiene una lista de aristas (edges).
    const rawEdges = safeParseJSON($id('kr_graph').value);

    // Si el JSON está mal escrito o vacío, se muestra un error y se detiene.
    if (!rawEdges) return alert("Lista de aristas inválida");

    // Convertimos cada arista del formato "A-B-5" en un objeto:
    // { u: "A", v: "B", w: 5 }
    let edges = rawEdges.map(s => {
        let p = s.split('-');      // Separa por guiones.
        return { 
            u: p[0],               // Nodo origen
            v: p[1],               // Nodo destino
            w: Number(p[2])        // Peso convertido a número
        };
    });

    // Creamos un conjunto para obtener todos los nodos sin repetirse.
    let nodeSet = new Set();
    edges.forEach(e => {
        nodeSet.add(e.u);  // Se agrega nodo u
        nodeSet.add(e.v);  // Se agrega nodo v
    });

    // Convertimos el conjunto a un arreglo normal de nodos.
    let nodes = Array.from(nodeSet);

    // Calculamos posiciones circulares para cada nodo en el canvas.
    // Esto distribuye los nodos de manera uniforme alrededor de un círculo.
    const coords = getCircularCoords(nodes, cv.width, cv.height);

    // Ordenamos las aristas por su peso, como exige el algoritmo de Kruskal.
    edges.sort((a, b) => a.w - b.w);

    // Se crea una estructura Union-Find (o conjunto disjunto).
    // Cada nodo comienza siendo padre de sí mismo.
    let parent = {};
    nodes.forEach(n => parent[n] = n);

    // Función find: busca la raíz del nodo (representante del conjunto).
    const find = (i) => parent[i] === i ? i : find(parent[i]);

    // Función union: une dos conjuntos, haciendo que sus raíces coincidan.
    const union = (i, j) => parent[find(i)] = find(j);

    let mst = [];            // Lista de aristas aceptadas en el MST.
    let totalCost = 0;       // Suma de los pesos aceptados.

    let acceptedEdgesVis = []; // Guarda las aristas aceptadas para la animación.

    // Escribe un mensaje inicial en el panel de salida.
    writeOutput('out-kruskal', "Ordenando aristas...");

    // Dibuja el grafo por primera vez antes de comenzar la animación.
    drawGraph(ctx, coords, edges);
    await sleep(1000);       // Pausa para animación

    // Recorre las aristas ya ordenadas de menor a mayor peso.
    for (let e of edges) {

        // Dibuja la arista que se está evaluando en AMARILLO.
        drawGraph(ctx, coords, edges, {}, 
                  [...acceptedEdgesVis,
                  {u: e.u, v: e.v, color: '#fbbf24'}]);

        // Escribe mensaje indicando qué arista se está revisando.
        appendOutput('out-kruskal',
            `Revisando ${e.u}-${e.v} ($${e.w})...`);
        await sleep(1000);

        // Si las raíces son diferentes → no hay ciclo → se puede aceptar.
        if (find(e.u) !== find(e.v)) {

            // Unimos los conjuntos de los dos nodos.
            union(e.u, e.v);

            // Guardamos la arista en el MST.
            mst.push(e);

            // Sumamos su peso al costo total.
            totalCost += e.w;

            // La arista que se acepta se pinta de verde.
            acceptedEdgesVis.push({
                u: e.u, v: e.v, color: '#10b981'
            });

            appendOutput('out-kruskal', `✅ Aceptada`);

            // Dibuja el grafo con las aristas aceptadas (verdes).
            drawGraph(ctx, coords, edges, {},
                      acceptedEdgesVis);

        } else {
            // Si forman ciclo → se rechaza.
            appendOutput('out-kruskal',
                `❌ Rechazada (Ciclo)`);

            // Se pinta temporalmente la arista rechazada en rojo.
            drawGraph(ctx, coords, edges, {}, 
                      [...acceptedEdgesVis,
                       {u: e.u, v: e.v, color: '#ef4444'}]);

            await sleep(600);

            // Se vuelve a dibujar sin la arista rechazada.
            drawGraph(ctx, coords, edges, {}, 
                      acceptedEdgesVis);
        }

        await sleep(500); // Pausa entre evaluaciones de aristas.
    }

    // Se escribe el costo total del MST al finalizar.
    appendOutput('out-kruskal', `Costo Total: ${totalCost}`);
});


/* =====================================================
   6. COLOREADO DE GRAFOS (GREEDY — ANIMADO)
   ===================================================== */

$id('btn-coloring').addEventListener('click', async () => {

    // Canvas y contexto.
    const cv = $id('cv_coloring');
    const ctx = cv.getContext('2d');

    // Obtiene grafo en formato JSON.
    const graph = safeParseJSON($id('col_graph').value);

    if (!graph) return alert("JSON inválido");

    // Obtiene nodos.
    const nodes = Object.keys(graph);

    // Posiciones circulares.
    const coords = getCircularCoords(nodes, cv.width, cv.height);

    // Construye lista de aristas para dibujar.
    let drawEdges = [];
    nodes.forEach(u => {
        graph[u].forEach(v => {
            if (u < v) drawEdges.push({u, v});
        });
    });

    // Objeto de colores por nodo.
    let nodeColors = {};

    // Colores disponibles para asignar.
    const colors = [
        "#ef4444", "#3b82f6", 
        "#10b981", "#f59e0b", 
        "#8b5cf6"
    ];

    // Mensaje inicio.
    writeOutput('out-coloring', "Iniciando Coloreado Greedy...");

    drawGraph(ctx, coords, drawEdges);
    await sleep(1000);

    // Algoritmo greedy.
    for (let u of nodes) {

        // Animación: nodo seleccionado (blanco).
        drawGraph(ctx, coords, drawEdges, {...nodeColors, [u]: '#ffffff'});
        await sleep(600);

        // Buscar colores usados por vecinos.
        let used = new Set();
        graph[u].forEach(v => {
            if (nodeColors[v]) used.add(nodeColors[v]);
        });

        // Seleccionar color libre.
        let choice = colors.find(c => !used.has(c)) || "#ccc";

        // Guardar color asignado.
        nodeColors[u] = choice;

        appendOutput('out-coloring',
            `Nodo ${u}: Asignado color ${choice}`);

        drawGraph(ctx, coords, drawEdges, nodeColors);
        await sleep(800);
    }

    appendOutput('out-coloring', "Terminado.");
});



/* =====================================================
   7. ALGORITMO DE FLEURY (ANIMADO)
   ===================================================== */

$id('btn-fleury').addEventListener('click', async () => {

    // Canvas y contexto.
    const cv = $id('cv_fleury');
    const ctx = cv.getContext('2d');

    // Grafo original del usuario.
    const graphInput = safeParseJSON($id('fl_graph').value);

    if (!graphInput) return alert("JSON inválido");

    // Copia para modificar la lógica sin tocar el original.
    let gLogic = JSON.parse(JSON.stringify(graphInput));

    // Extraer nodos.
    let nodes = Object.keys(gLogic);

    // Posiciones en el canvas.
    const coords = getCircularCoords(nodes, cv.width, cv.height);

    // Lista de aristas originales para dibujar siempre.
    let baseEdges = [];
    nodes.forEach(u => {
        graphInput[u].forEach(v => {
            if (u < v) baseEdges.push({u, v});
        });
    });

    // Verifica cuántos nodos impares tiene el grafo.
    let odds = nodes.filter(n => gLogic[n].length % 2 !== 0);

    if (odds.length !== 0 && odds.length !== 2) {
        return writeOutput('out-fleury',
            `Error: Hay ${odds.length} nodos impares. No es Euleriano.`);
    }

    // Nodo inicial.
    let curr = odds.length === 2 ? odds[0] : nodes[0];

    // Número total de aristas para saber cuándo terminar.
    let totalEdges = baseEdges.length;

    // Lista de aristas ya recorridas.
    let pathVis = [];

    writeOutput('out-fleury', `Iniciando en nodo ${curr}`);

    // Dibujo inicial: nodo actual en amarillo.
    drawGraph(ctx, coords, baseEdges, {[curr]: '#fbbf24'});
    await sleep(1000);


    // -------------------------------------------
    // Función para eliminar una arista en gLogic.
    // -------------------------------------------
    const removeEdge = (u, v) => {
        gLogic[u] = gLogic[u].filter(x => x !== v);
        gLogic[v] = gLogic[v].filter(x => x !== u);
    };

    // -------------------------------------------------
    // Cuenta cuántos nodos son alcanzables desde "start".
    // -------------------------------------------------
    const countReach = (start) => {
        let vis = new Set([start]);
        let q = [start];

        while (q.length) {
            let n = q.shift();
            (gLogic[n] || []).forEach(next => {
                if (!vis.has(next)) {
                    vis.add(next);
                    q.push(next);
                }
            });
        }

        return vis.size;
    };

    // -------------------------------------------------------
    // Determina si una arista u-v es puente o no.
    // -------------------------------------------------------
    const isValid = (u, v) => {

        // Si u solo tiene una arista disponible, debe usarse.
        if (gLogic[u].length === 1) return true;

        // Cuenta nodos alcanzables antes de borrar la arista.
        let c1 = countReach(u);

        // Quita arista u-v temporalmente.
        removeEdge(u, v);

        // Cuenta nodos alcanzables tras quitar la arista.
        let c2 = countReach(u);

        // Restaura arista.
        gLogic[u].push(v);
        gLogic[v].push(u);

        // Si quitar la arista reduce el número de alcanzables, era puente.
        return c1 === c2;
    };


    // Bucle principal: recorrer todas las aristas.
    while (totalEdges > 0) {

        let neighbors = gLogic[curr];  // Vecinos disponibles.
        let chosen = null;             // Arista elegida.

        // Intentar elegir arista que no sea puente.
        for (let next of neighbors) {
            if (isValid(curr, next)) {
                chosen = next;
                break;
            }
        }

        // Si no encontró ninguna, usar la primera.
        if (!chosen && neighbors.length) {
            chosen = neighbors[0];
        }

        if (chosen) {

            // Mostrar cruce.
            appendOutput('out-fleury', 
                `Cruzando de ${curr} a ${chosen}`);

            // Dibuja animación del cruce.
            let currentAnim = [
                ...pathVis,
                {u: curr, v: chosen, color: '#fbbf24'}
            ];

            drawGraph(ctx, coords, baseEdges, {[curr]: '#fbbf24'}, currentAnim);
            await sleep(800);

            // Añadir arista a recorrido.
            pathVis.push({u: curr, v: chosen, color: '#10b981'});

            // Eliminar arista del grafo lógico.
            removeEdge(curr, chosen);

            // Reducir número total de aristas restantes.
            totalEdges--;

            // Moverse al siguiente nodo.
            curr = chosen;

            // Dibujar estado actual.
            drawGraph(ctx, coords, baseEdges, {[curr]: '#fbbf24'}, pathVis);
            await sleep(800);
        }
    }

    appendOutput('out-fleury', "Recorrido Euleriano completado.");
});

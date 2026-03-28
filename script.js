let mojGrafik = null;

// Funkcija za promenu tabova
function otvoriTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-sadrzaj");
    for (i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active", "");
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementById('dugmeResi').addEventListener('click', function() {
    const a = parseFloat(document.getElementById('koef_a').value);
    const b = parseFloat(document.getElementById('koef_b').value);
    const c = parseFloat(document.getElementById('koef_c').value);

    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
        alert("Proverite unose (a ne sme biti 0)"); return;
    }

    const f = (x) => a * x * x + b * x + c;
    const diskriminanta = b * b - 4 * a * c;
    
    if (diskriminanta >= 0) {
        const r1 = (-b + Math.sqrt(diskriminanta)) / (2 * a);
        const r2 = (-b - Math.sqrt(diskriminanta)) / (2 * a);

        // Pokretanje metoda sa logovanjem
        popuniTabelu('tabela-bisekcija', metodaBisekcije(f, r1 - 1, r1 + 1));
        popuniTabelu('tabela-regula', metodaLaznePozicije(f, r1 - 1, r1 + 1));
        popuniTabelu('tabela-brent', brentovaMetoda(f, r1 - 1, r1 + 1));

        document.getElementById('sekcija-iteracije').classList.remove('skriveno');
        document.getElementById('mat-info').innerHTML = `Analitička rešenja: x₁=${r1.toFixed(4)}, x₂=${r2.toFixed(4)}`;
        document.getElementById('rezultati').classList.remove('skriveno');
        nacrtajGrafik(a, b, c, -b/(2*a), r1, r2, diskriminanta);
    } else {
        alert("Nema realnih rešenja za numeričku vizuelizaciju.");
    }
});

function popuniTabelu(id, podaci) {
    const tbody = document.querySelector(`#${id} tbody`);
    tbody.innerHTML = "";
    podaci.log.forEach(red => {
        const tr = `<tr>
            <td>${red.it}</td>
            <td>${red.a.toFixed(4)}</td>
            <td>${red.b.toFixed(4)}</td>
            <td>${red.c.toFixed(4)}</td>
            <td>${red.fc.toFixed(6)}</td>
        </tr>`;
        tbody.innerHTML += tr;
    });
}

//METODE <bisekcije, lazne pozicije, brentova>

function metodaBisekcije(f, a, b, tol = 1e-3) {
    let log = [];
    let h = 0;
    let fa = f(a), fb = f(b);

    if (fa * fb >= 0) return { res: a, log: [] };

    while (true) {
        let ch = (a + b) / 2;
        let fch = f(ch);
        
        // Beležimo trenutno stanje pre promene intervala
        let stari_a = a, stari_b = b;
        
        log.push({ it: h, a: stari_a, b: stari_b, c: ch, fc: fch });

        // Određivanje novog intervala 
        if (f(a) * fch < 0) b = ch; else a = ch;

        // Kriterijum zaustavljanja: širina novog intervala
        if (Math.abs(b - a) <= tol) {
            return { res: ch, log };
        }
        h++;
        if (h > 100) break; // Sigurnosni prekid
    }
}
 
function metodaLaznePozicije(f, a, b, tol = 1e-3) {
    let log = [];
    let h = 0;
    let ch_prethodno = null;

    while (true) {
        let fa = f(a), fb = f(b);

        let ch = (b * fa - a * fb) / (fa - fb);
        let fch = f(ch);

        log.push({ it: h, a: a, b: b, c: ch, fc: fch });

        // Provera kriterijuma 
        if (ch_prethodno !== null && Math.abs(ch - ch_prethodno) < tol) {
            return { res: ch, log };
        }

        ch_prethodno = ch;
        // Novi interval zagrađivanja
        if (fa * fch < 0) b = ch; else a = ch;
        
        h++;
        if (h > 100) break;
    }
}
 
function brentovaMetoda(f, a, b, tol = 1e-3) {
    let log = [];
    let h = 0;
    let c = (a + b) / 2; // Sredina za početak 
    let dh_prethodno = b - a;

    while (true) {
        let fa = f(a), fb = f(b), fc = f(c);
        
        // Inverzna kvadratna interpolacija kroz (a, fa), (c, fc), (b, fb)
        let d = (fa * fb * c) / ((fc - fa) * (fc - fb)) +
                (fb * fc * a) / ((fa - fb) * (fa - fc)) +
                (fc * fa * b) / ((fb - fc) * (fb - fa));

        let koriscenaBisekcija = false;
        // 2. Provera: Da li je d unutar intervala i da li se interval smanjuje bar 20% 
        let trenutniInterval = Math.abs(b - a);
        if (d < Math.min(a, b) || d > Math.max(a, b) || trenutniInterval > 0.8 * dh_prethodno) {
            d = (a + b) / 2; 
            koriscenaBisekcija = true;
        }

        let fd = f(d);
        log.push({ it: h, a: a, b: b, c: d, fc: fd, napomena: koriscenaBisekcija ? "Bisekcija" : "Interpolacija" });

        // Kriterijum zaustavljanja: |dh+1 - dh| < tol
        if (h > 0 && Math.abs(d - log[h-1].c) < tol) {
            return { res: d, log };
        }

        // 3. Formiranje novog intervala i unutrašnje tačke c
        dh_prethodno = trenutniInterval;
        let tacke = [a, b, d].sort((x, y) => x - y);
        // Logika za zadržavanje tačaka suprotnog znaka
        if (f(a) * fd < 0) { b = d; c = (a + d) / 2; } 
        else { a = d; c = (b + d) / 2; }

        h++;
        if (h > 50) break;
    }
}


function popuniTabelu(id, rezultat) {
    const tbody = document.querySelector(`#${id} tbody`);
    tbody.innerHTML = "";
    rezultat.log.forEach(red => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${red.it}</td>
            <td>${red.a.toFixed(6)}</td>
            <td>${red.b.toFixed(6)}</td>
            <td>${red.c.toFixed(6)}</td>
            <td>${red.fc.toExponential(4)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function nacrtajGrafik(a, b, c, centarX, r1, r2, D) {
    const platno = document.getElementById('grafikFunkcije').getContext('2d');
    const xVrednosti = [], yVrednosti = [];
    for (let x = centarX - 5; x <= centarX + 5; x += 0.1) {
        xVrednosti.push(x);
        yVrednosti.push(a * x * x + b * x + c);
    }
    if (mojGrafik) mojGrafik.destroy();
    mojGrafik = new Chart(platno, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Parabola',
                data: xVrednosti.map((x, i) => ({ x: x, y: yVrednosti[i] })),
                borderColor: '#2563eb', pointRadius: 0, fill: false
            }, {
                label: 'Koreni',
                data: [{x: r1, y: 0}, {x: r2, y: 0}],
                backgroundColor: '#10b981', pointRadius: 6, showLine: false
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'linear' } } }
    });
}
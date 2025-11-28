let quranData = [];
const arabicLetters = "ابتثجحخدذرزسشصضطظعغفقكلمنهويءآأإؤئى";
const signs = ['َ','ِ','ُ','ْ','ً','ٍ','ٌ','ّ'];

let anyLetters = [], allLetters = [];
let anySigns = [], allSigns = [];

let headerCollapsed = false;

// Predefined selections
// Predefined selections
const predefined = {
    none: () => {
        clearSelections();
    },

    // Saakin Halaqiyyah letters
    halaqi: () => {
        clearSelections();
        const halaqiLetters = ["ء","ه","ع","ح","غ","خ","أ","إ","ؤ","ئ"];
        const sukoon = "ْ";

        halaqiLetters.forEach(l => {
            anyLetters.push(l);
            toggleButtonSelection("any-letters", l, true);
        });

        anySigns.push(sukoon);
        toggleButtonSelection("any-signs", sukoon, true);
    },

    // Bold letters (these are letters that are pronounced with emphasis: ط، ص، ظ، ق)
    bold: () => {
        clearSelections();
        const boldLetters = ["ط","ص","ظ","ق"];

        boldLetters.forEach(l => {
            anyLetters.push(l);
            toggleButtonSelection("any-letters", l, true);
        });
    },

    // Qalqalah letters (ق, ط, ب, ج, د) pronounced with echo when sukoon
    qalqalah: () => {
        clearSelections();
        const qalqalahLetters = ["ق","ط","ب","ج","د"];
        const sukoon = "ْ";

        qalqalahLetters.forEach(l => {
            anyLetters.push(l);
            toggleButtonSelection("any-letters", l, true);
        });

        anySigns.push(sukoon);
        toggleButtonSelection("any-signs", sukoon, true);
    },

    // Real Ghunnah (Noon or Meem Mushaddad)
    ghunnah: () => {
        clearSelections();
        const ghunnahLetters = ["ن","م"];
        const shaddah = "ّ"; // Mushaddad

        ghunnahLetters.forEach(l => {
            anyLetters.push(l);
            toggleButtonSelection("any-letters", l, true);
        });

        anySigns.push(shaddah);
        toggleButtonSelection("any-signs", shaddah, true);
    }
};


function clearSelections() {
    anyLetters.length = 0;
    anySigns.length = 0;
    allLetters.length = 0;
    allSigns.length = 0;

    document.querySelectorAll(".letter-btn, .sign-btn")
        .forEach(b => b.classList.remove("selected"));
}

// Toggle UI button state
function toggleButtonSelection(containerId, char, state) {
    let buttons = document.querySelectorAll(`#${containerId} button`);
    buttons.forEach(btn => {
        if (btn.textContent === char) {
            state ? btn.classList.add("selected") : btn.classList.remove("selected");
        }
    });
}

fetch('data/quran.json')
.then(res => res.json())
.then(data => {
    quranData = data;
    createLetterButtons('any-letters', anyLetters, 'any');
    createLetterButtons('all-letters', allLetters, 'all');
    createSignButtons('any-signs', anySigns);
    createSignButtons('all-signs', allSigns);
    displayAyahs();
});

// Occurrence input always triggers redisplay
document.getElementById('occurrence').addEventListener('input', ()=> displayAyahs());

// Prevent propagation
document.querySelector('.occurrence-section')
  .addEventListener('click', e => e.stopPropagation());

// Create letter buttons
function createLetterButtons(containerId, selectedArray, type){
    const container = document.getElementById(containerId);
    arabicLetters.split('').forEach(letter=>{
        const btn = document.createElement('button');
               btn.textContent = letter;
        btn.classList.add('letter-btn');

        btn.addEventListener('click', ()=>{
            btn.classList.toggle('selected');

            if(selectedArray.includes(letter)){
                selectedArray.splice(selectedArray.indexOf(letter),1);
            } else {
                selectedArray.push(letter);
            }
            if(headerCollapsed) displayAyahs();
        });

        container.appendChild(btn);
    });
}

// Create sign buttons
function createSignButtons(containerId, selectedArray){
    const container = document.getElementById(containerId);
    signs.forEach(sign=>{
        const btn = document.createElement('button');
        btn.textContent = sign;
        btn.classList.add('sign-btn');

        btn.addEventListener('click', ()=>{
            btn.classList.toggle('selected');

            if(selectedArray.includes(sign)){
                selectedArray.splice(selectedArray.indexOf(sign),1);
            } else {
                selectedArray.push(sign);
            }
            if(headerCollapsed) displayAyahs();
        });

        container.appendChild(btn);
    });
}

// Custom Select
const displayBox = document.getElementById("custom-select-display");
const optionsBox = document.getElementById("custom-select-options");

displayBox.addEventListener("click", e => {
    e.stopPropagation();
    optionsBox.classList.toggle("hidden");
});

document.querySelectorAll(".custom-option").forEach(option => {
    option.addEventListener("click", e => {
        e.stopPropagation();
        let key = option.dataset.key;

        displayBox.textContent = option.textContent;
        optionsBox.classList.add("hidden");

        predefined[key]();

        if (headerCollapsed) displayAyahs();
    });
});

// Close dropdown when clicking outside
document.body.addEventListener("click", ()=> optionsBox.classList.add("hidden"));

// Header toggle
document.getElementById('toggle-header').addEventListener('click', ()=>{
    const header = document.getElementById('collapsing-area');
    header.classList.toggle('collapsed');
    headerCollapsed = header.classList.contains('collapsed');
    if(headerCollapsed) displayAyahs();
});

// Matching logic
function letterMatchesSigns(letter, ayahText, selectedSigns){
    if(selectedSigns.length === 0)
        return [...ayahText].filter(ch => ch === letter).length;

    let count = 0;
    for(let i=0;i<ayahText.length-1;i++){
        if(ayahText[i] === letter && selectedSigns.includes(ayahText[i+1]))
            count++;
    }
    return count;
}

// Display ayahs
function displayAyahs(){
    const container = document.getElementById('ayah-container');
    container.innerHTML = '';
    const occ = parseInt(document.getElementById('occurrence').value) || 3;

    // Check if ALL selections are empty
    const noSelection =
        anyLetters.length === 0 &&
        anySigns.length === 0 &&
        allLetters.length === 0 &&
        allSigns.length === 0;

    const filtered = quranData.filter(ayah => {
        // If no selection, return all ayahs
        if(noSelection) return true;

        let totalMatches = 0;

        for(let letter of allLetters){
            const count = letterMatchesSigns(letter, ayah.text, allSigns);
            if(count === 0) return false;
            totalMatches += count;
        }

        for(let letter of anyLetters){
            totalMatches += letterMatchesSigns(letter, ayah.text, anySigns);
        }

        return totalMatches >= occ;
    });

    filtered.forEach(ayah => {
        const div = document.createElement('div');
        div.classList.add('ayah');

        let highlightedText = ayah.text.split('').map((ch, i) => {
            const nextCh = ayah.text[i + 1] || '';
            let isHighlighted = false;

            if (allLetters.includes(ch) && (allSigns.length === 0 || allSigns.includes(nextCh)))
                isHighlighted = true;

            if (anyLetters.includes(ch) && (anySigns.length === 0 || anySigns.includes(nextCh)))
                isHighlighted = true;

            return isHighlighted ? `<span class="highlight">${ch}</span>` : ch;
        }).join('');

        div.innerHTML = `
            <div class="ayah-line">
                <strong style="font-family:'Play';">${ayah.surah}:${ayah.ayah}</strong>
                - ${highlightedText}
                <img class="ayah-icon" src="assets/ayah-icon.svg" alt="">
            </div>
        `;

        div.style.cursor = "pointer";
        div.addEventListener('click', () => {
            window.open(`https://quran.com/${ayah.surah}?startingVerse=${ayah.ayah}`, '_blank');
        });

        container.appendChild(div);
    });
}



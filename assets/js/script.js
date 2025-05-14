document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty');
    const themeSelect = document.getElementById('theme');
    const cardsContainer = document.querySelector('.cards-container');
    const timerDisplay = document.querySelector('#timer');
    const clicksDisplay = document.querySelector('#clicks');
    const pairsLeftDisplay = document.querySelector('#pairs-left');
    let timer;
    let clicks = 0;
    let pairsMatched = 0;
    let totalPairs = 0;
    let flippedCards = [];
    let cardData = [];
    let gameTimer = 60; // Default timer for "easy" difficulty

    const fetchPokemonData = async () => {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1500');
        const data = await response.json();
        return data.results;
    };

    const generateGameData = async () => {
        const pokemonList = await fetchPokemonData();
        const selectedPokemons = [];
        while (selectedPokemons.length < totalPairs) {
            const randomIndex = Math.floor(Math.random() * pokemonList.length);
            const pokemon = pokemonList[randomIndex];
            if (!selectedPokemons.includes(pokemon.name)) {
                selectedPokemons.push(pokemon.name);
            }
        }
        cardData = selectedPokemons.map(pokemon => ({
            name: pokemon,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonList.find(p => p.name === pokemon).url.split('/')[6]}.png`
        }));
    };

    const createCards = () => {
        const shuffledCards = [...cardData, ...cardData].sort(() => Math.random() - 0.5);
        cardsContainer.innerHTML = '';
        shuffledCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.setAttribute('data-id', card.id);
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">
                        <img src="${card.image}" alt="${card.name}" />
                    </div>
                </div>
            `;
            cardsContainer.appendChild(cardElement);
        });

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => flipCard(card));
        });
    };

    const flipCard = (card) => {
        if (flippedCards.length === 2 || card.classList.contains('flipped')) return;
        card.classList.add('flipped');
        flippedCards.push(card);
        clicks++;
        clicksDisplay.textContent = clicks;

        if (flippedCards.length === 2) {
            setTimeout(() => checkMatch(), 500); // Delay for animation
        }
    };

    const checkMatch = () => {
        const [firstCard, secondCard] = flippedCards;
        const firstCardId = firstCard.getAttribute('data-id');
        const secondCardId = secondCard.getAttribute('data-id');

        if (firstCardId === secondCardId) {
            pairsMatched++;
            flippedCards = [];
            if (pairsMatched === totalPairs) { // All pairs matched
                alert("You win!");
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
        updateStats();
    };

    const updateStats = () => {
        document.getElementById('clicks').textContent = clicks;
        document.getElementById('pairs-left').textContent = totalPairs - pairsMatched;
    };

    const startTimer = () => {
        const timerInterval = setInterval(() => {
            if (gameTimer > 0) {
                gameTimer--;
                timerDisplay.textContent = gameTimer;
            } else {
                clearInterval(timerInterval);
                alert("Game over! Time's up!");
            }
        }, 1000);
    };

    const resetGame = () => {
        cardsContainer.innerHTML = '';
        createCards();
        pairsMatched = 0;
        clicks = 0;
        gameTimer = 60;
        timerDisplay.textContent = gameTimer;
        updateStats();
    };

    const startGame = async () => {
        pairsMatched = 0;
        flippedCards = [];
        clicks = 0;
        document.getElementById('clicks').textContent = clicks;

        const difficulty = difficultySelect.value;
        totalPairs = difficulty === 'easy' ? 6 : (difficulty === 'medium' ? 8 : 10);
        gameTimer = difficulty === 'easy' ? 60 : (difficulty === 'medium' ? 45 : 30);
        document.getElementById('pairs-left').textContent = totalPairs;

        await generateGameData();
        createCards();
        startTimer();
    };

    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);

    themeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value + '-theme';
    });
});

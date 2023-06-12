// OPENAI configuration
const OPENAI = {
  API_KEY: '', /*<-- your API key here */
  API_BASE_URL: 'https://api.openai.com/v1',
  CHAT_ENDPOINT: '/chat/completions',
  GPT_MODEL: 'gpt-3.5-turbo',
  IMAGE_ENDPOINT: '/images/generations'
}

// Store elements in variables
const ingredients = document.querySelectorAll('.ingredient');
const bowlSlots = document.querySelectorAll('.bowl-slot');
const cookButton = document.querySelector('#cook-button');
const loading = document.querySelector('.loading');
const modal = document.querySelector('.modal');
const recipeContent = document.querySelector('.recipe-content');
const recipeImage = document.querySelector('.recipe-image');
const modalClose = document.querySelector('.modal-close');
const loadingMessage = document.querySelector('.loading-message');

// Init bowl state
let bowl =  [];

// Ingredient click event
ingredients.forEach(function (element) {
  element.addEventListener('click', function () {
    addIngredient(element.innerText)
  });
});

// Create recipe event
cookButton.addEventListener('click', function() {
createRecipe();
});

// Modal close event
modalClose.addEventListener('click', function () {
  modal.classList.add('hidden')
});

// function definitions
function addIngredient(ingredient) {
  if(bowl.length === bowlSlots.length) {
    bowl.shift();
  }

  bowl.push(ingredient)

  bowlSlots.forEach(function (slot, index) {

    if (bowl[index]) {
      slot.innerText = bowl[index]
    }
  });

  if (bowl.length === bowlSlots.length) {
    cookButton.classList.remove('hidden');
  }
}

async function createRecipe() {
loading.classList.remove('hidden');
loadingMessage.innerText = getRandomLoadingMessage();

const messageInterval = setInterval(() => {
  loadingMessage.innerText = getRandomLoadingMessage();
}, 2000);

const prompt = `\
Crea una ricetta con questi ingredienti: ${bowl.join(', ')}.
La ricetta deve essere facile e con un titolo creativo e divertente.
Le tue risposte sono solo in formato JSON come questo esempio:

###

{
    "titolo": "Titolo ricetta",
    "ingredienti": "1 uovo e 1 pomodoro",
    "istruzioni": "mescola gli ingredienti e metti in forno"
}

###`;

const recipeResponse = await makeRequest(OPENAI.CHAT_ENDPOINT, {
  model: OPENAI.GPT_MODEL,
  messages: [
      {
      role: 'user',
      content: prompt
    }
  ],
  temperature: 0.7
});

const recipe = JSON.parse(recipeResponse.choices[0].message.content);


recipeContent.innerHTML = `\
<h2>${recipe.titolo}</h2>
<p>${recipe.ingredienti}</p>
<p>${recipe.istruzioni}</p>`;

loading.classList.add('hidden');
modal.classList.remove('hidden');
clearInterval(messageInterval);

  const imageResponse = await makeRequest(OPENAI.IMAGE_ENDPOINT, {
      prompt: `Crea una immagine per questa ricetta: ${recipe.titolo}`,
      n: 1,
      size: '512x512'
  });

  const imageUrl = imageResponse.data[0].url;
  recipeImage.innerHTML = `<img src="${imageUrl}" alt="recipe image">`;

  clearBowl();

};

function clearBowl() {
  bowl = [];

  bowlSlots.forEach(function (slot) {
    slot.innerText = '?';
  })
}

function getRandomLoadingMessage() {
  const messages = [
      'Preparo gli ingredienti...',
      'Scaldo i fornelli...',
      'Mescolo nella ciotola...',
      'Scatto foto per Instagram...',
      'Prendo il mestolo...',
      'Metto il grembiule...',
      'Mi lavo le mani...',
      'Tolgo le bucce...',
      'Pulisco il ripiano...'
  ];

  const randIdx = Math.floor(Math.random() * messages.length);
  return messages[randIdx];
}

async function makeRequest(endpoint, payload) {
  const response = await fetch(OPENAI.API_BASE_URL + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI.API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  return json;
};
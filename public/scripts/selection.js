let choices = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
}

let currentChoice = 0;

function toggleChoice(choice) {
    currentChoice = choice;
    const selectedChoice = document.querySelector(`li[data-choice="${choice}"]`);
    const previouslySelected = document.querySelector('.selected-choice');
    
    if (previouslySelected) {
      previouslySelected.classList.remove('selected-choice');
      previouslySelected.classList.remove('bg-green-800');
      previouslySelected.classList.remove('rounded-lg');
    }

    if (selectedChoice) {
      selectedChoice.classList.add('selected-choice');
      selectedChoice.classList.add('bg-green-800');
      selectedChoice.classList.add('rounded-lg');
    }
}

function selectChoice(lc1, lc2, lc3) {
    console.log([lc1, lc2, lc3]);
    if (currentChoice !== 0) {
        choices.currentChoice = [lc1, lc2, lc3];
    } else {
        for (const key in choices) {
            const value = choices.key;
            if (value === null) {
                choices.key = [lc1, lc2, lc3];
            }
        }
        currentChoice = 1;
        toggleChoice(1);

        const selected = document.querySelector(`#choice-1`);
        selected.classList.remove('hidden');
        console.log(selected.classList);
    }
    const selectionOptionOne = document.querySelector(`span[data-choice="${currentChoice}-1"]`);
    const selectionOptionTwo = document.querySelector(`span[data-choice="${currentChoice}-2"]`);
    const selectionOptionThree = document.querySelector(`span[data-choice="${currentChoice}-3"]`);

    const selectionOptionOneInput = document.querySelector(`input[data-choice="input-${currentChoice}-1"]`);
    const selectionOptionTwoInput = document.querySelector(`input[data-choice="input-${currentChoice}-2"]`);
    const selectionOptionThreeInput = document.querySelector(`input[data-choice="input-${currentChoice}-3"]`);
    
    selectionOptionOneInput.value = "VGH";
    selectionOptionTwoInput.value = "Burnaby";
    selectionOptionThreeInput.value = "Surrey";

    selectionOptionOne.innerHTML = `1. VGH`;
    selectionOptionTwo.innerHTML = `2. Burnaby`;
    selectionOptionThree.innerHTML = `3. Surrey`;
}

// function handleSubmit(event) {
//     console.log(choices);
// }
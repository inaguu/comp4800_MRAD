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

function selectChoice(lineNumber, choiceOne, choiceTwo, choiceThree, lineId) {
    if (currentChoice !== 0) {
        choices.currentChoice = [choiceOne, choiceTwo, choiceThree];
    } else {
        for (const key in choices) {
            const value = choices.key;
            if (value === null) {
                choices.key = [choiceOne, choiceTwo, choiceThree];
            }
        }
        currentChoice = 1;
        toggleChoice(1);

        const selected = document.querySelector(`#choice-1`);
        selected.classList.remove('hidden');
    }

    const selectedLineNumber = document.querySelector(`span[data-choice="line-${currentChoice}"]`);
    const selectionOptionOne = document.querySelector(`span[data-choice="${currentChoice}-1"]`);
    const selectionOptionTwo = document.querySelector(`span[data-choice="${currentChoice}-2"]`);
    const selectionOptionThree = document.querySelector(`span[data-choice="${currentChoice}-3"]`);

    const lineNumberInput = document.querySelector(`input[data-choice="line-number-${currentChoice}"]`);
    const lineIdInput = document.querySelector(`input[data-choice="line-id-${currentChoice}"]`);
    const selectionOptionOneInput = document.querySelector(`input[data-choice="input-${currentChoice}-1"]`);
    const selectionOptionTwoInput = document.querySelector(`input[data-choice="input-${currentChoice}-2"]`);
    const selectionOptionThreeInput = document.querySelector(`input[data-choice="input-${currentChoice}-3"]`);
    
    lineNumberInput.value = lineNumber;
    selectionOptionOneInput.value = choiceOne;
    selectionOptionTwoInput.value = choiceTwo;
    selectionOptionThreeInput.value = choiceThree;

    selectedLineNumber.innerHTML = `Line # ${lineNumber}`;
    selectionOptionOne.innerHTML = `1. ${choiceOne}`;
    selectionOptionTwo.innerHTML = `2. ${choiceTwo}`;
    selectionOptionThree.innerHTML = `3. ${choiceThree}`;

    lineIdInput.value = lineId;
}


document.addEventListener("DOMContentLoaded", function() {
    // Code to be executed when the DOM is ready
    const allOptions = document.getElementsByClassName("test-option");

    for (const option of allOptions) {
        option.addEventListener("click", function (e) {
            const optionChildren = option.children;
            const lineNumber = optionChildren[0].textContent;
            const choiceOne = optionChildren[1].textContent;
            const choiceTwo = optionChildren[2].textContent;
            const choiceThree = optionChildren[3].textContent;
            const lineId = optionChildren[4].querySelector(`input[data-choice="line-number-1"]`);
            selectChoice(lineNumber, choiceOne, choiceTwo, choiceThree, lineId.value)
        })
    }

}); 



// function handleSubmit(event) {
//     console.log(choices);
// }
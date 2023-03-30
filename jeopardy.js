// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const apiUrl = "https://jservice.io/api/";
const amntOfCats = 6
const amntOfClues = 5
let categories = [];
let catIds = []
function randomNum(i) {
    return Math.floor(Math.random() * i)
};
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let count = 0;
    let response = await axios.get(`${apiUrl}categories?count=100`);
    while (count < amntOfCats) {
        let randomCat = await response.data[randomNum(response.data.length)]
        let catId = randomCat.id;
        let clueCount = randomCat.clues_count
        // make sure there are no duplicate ID's
        // console.log(`this is the clue count ${clueCount}`)
        if (catIds.includes(catId) || clueCount < 5) { console.log('no bueno') } else { catIds.push(catId); count++; };
    }
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 */

async function getCategory(catId) {
    let count = 0;
    let response = await axios.get(`${apiUrl}category?id=${catId}`);
    // console.log(response);
    let cluesSet = [];
    let clueValues = [100, 200, 300, 400, 500];
    // generate 5 sets for each Category and push to cluesSet
    while (count < amntOfClues) {
        let clue = await response.data.clues[randomNum(response.data.clues.length)]
        let set = {
            question: clue.question,
            answer: clue.answer,
            value: clueValues[count],
            showing: null,
        };
        cluesSet.push(set);
        count++;

    }
    // console.log({ title: response.data.title, cluesSet });
    return ({ title: response.data.title, cluesSet });
}


async function fillTable() {
    let $topics = $("thead");
    let $topicrow = $("<tr>").addClass("head");
    let $tbody = $("tbody");
    for (let x = 0; x < amntOfCats; x++) {
        $topicrow.append($("<th>").text(categories[x].title));
    }
    $topics.append($topicrow);
    for (let row = 0; row < amntOfClues; row++) {
        let $tr = $("<tr>");
        for (let column = 0; column < amntOfCats; column++) {
            let $tdContainer = $("<td>").attr("id", `${row}-${column}`).attr('class', 'tdContainer');
            console.log(categories[column].cluesSet[row].value);
            $tdContainer.append($("<td>").text(categories[column].cluesSet[row].value).attr('class', 'value'))
            // $tdContainer.append($("<td>").attr("class", `question`).text(categories[column].cluesSet[row].question))
            // $tdContainer.append($("<td>").attr("class", `answer`).text(categories[column].cluesSet[row].answer))
            $tr.append($tdContainer)
        }
        $tbody.append($tr);
    }
    // console.log(`these are the ids: ${catIds}`);
    //create body clues
    // let $trbody = $("<tr>").addClass("body");

}
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function highlight(clicked, clickedChild, coordinates) {
    clicked.addClass('clicked');
    let x = coordinates[0];
    let y = coordinates[2];
    let buttonContainer = $('<div>').attr('class', 'buttonContainer')
    // create close "highlight button"
    let $closebtn = $('<button class = "closebtn">close</button>').on({
        click: function () {
            buttonContainer.remove();
            clicked.removeClass('clicked');

        }
    });
    let $answer = $('<button class = "answerbtn">answer</button>').on({
        click: function () {
            clickedChild.text(categories[y].cluesSet[x].answer).attr('class', 'answer');
            buttonContainer.remove();
            clicked.removeClass('clicked');
            clicked.click(function () { return false; })
        }
    });
    buttonContainer.append($answer, $closebtn)
    clickedChild.text(categories[y].cluesSet[x].question).attr('class', 'question');
    clicked.append(buttonContainer);

}

function handleClick(evt) {
    let coordinates = evt.target.id;
    console.log(coordinates);
    let $clicked = $(`#${coordinates}`);
    let $clickedChild = $(`#${coordinates}> td`);
    $clicked.on({
        click: highlight($clicked, $clickedChild, coordinates),
    })

}

async function setupAndStart() {
    await getCategoryIds();
    console.log(catIds);
    for (idNum of catIds) {
        categories.push(await getCategory(idNum));
    }; console.log(categories)
    fillTable();
    $("#jeopardy").on("click", "td", handleClick);
    $('#restart').click(function () { location.reload() });
    console.log(restart)
}

setupAndStart()

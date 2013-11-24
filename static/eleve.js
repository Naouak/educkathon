var currentQuestion;

var question_1 = {
    id: 1,
    type: "qcm",
    question: "quel est le cheval blanc d'henri 4",
    answers: ["blanc", "gris", "noi"]
};

var response = {
    question_id: 1,
    answer: 2
};

var socket = io.connect("http://"+host+":8081");

socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});

socket.on('new_question', function (question) {
    console.log(question);
    document.getElementById("question_core").innerHTML = question.question;
    currentQuestion = question;
    var html = "";
    for (var i=0; i<question.answers.length; i++) {
        //html += "<input type='checkbox'>";
        //html += question.answers[i];
        html += "<button onClick='send_answer ("+i+")'>"+question.answers[i]+"</button>";
    }
    document.getElementById("choices").innerHTML = html;
    // socket.emit('my other event', { my: 'data' });
});


socket.on('end_question', function () {
    console.log("fin du temps imparti pour la question");
}	);

socket.on("new_course", function(data){
    console.log("new course");
    document.getElementById("course_content").innerHTML = data;
});


socket.on("next_slide", function(data){
    console.log("next slide");
    document.getElementById("course_content").innerHTML = data;
});


socket.on("previous_slide", function(data){
    console.log("previous slide");
    document.getElementById("course_content").innerHTML = data;
});


function send_answer (index_answer) {
    var answer_object = {
        question_id: parseInt (currentQuestion.id, 10),
        answer: parseInt (index_answer, 10)
    };
    console.log (answer_object);
    socket.emit('answer', answer_object);
    var html  = document.getElementById("id_history").innerHTML;
    var html2 = html + "<br>" + currentQuestion.question + " --> " + currentQuestion.answers[index_answer];
    document.getElementById("id_history").innerHTML = html2;
    reset_question ();
}

function reset_question () {
    document.getElementById("question_core").innerHTML = "";
    currentQuestion = null;
    document.getElementById("choices").innerHTML = "";
}
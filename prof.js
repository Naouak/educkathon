var socket = io.connect('http://localhost:8080');

var elvCount = 0;

var currentQuestion = null;
var currentAnswers = [];
var totalAnswers = 0;

var renderQuestion = function(id, question){
    var content = document.createElement("div");
    content.id = "question"+id;
    content.innerHTML = question.question;

    return content;
};

var questionClicked = function(e){
    e.preventDefault();

    var id = e.currentTarget.id.substr(8);
    renderCurrentQuestion(id);
};

var renderCurrentQuestion = function(id){
    var question = slides[current_slide].questions[id];
    currentQuestion = id;

    var questionDiv = document.querySelector("#currentQuestion");
    questionDiv.innerHTML = "";
    questionDiv.innerHTML += "<h2>"+question.question+"</h2>";
    questionDiv.innerHTML += "<div class='answersStats'><span class='answerCount'>0</span> réponses reçues</div>";
    questionDiv.innerHTML += "<ul><li>"+question.answers.join("</li><li>")+"</li></ul>";

    var button = document.createElement("button");
    button.dataset.question_id=id;
    button.addEventListener("click",sendQuestion);
    button.innerHTML = "Envoyer la question";

    questionDiv.appendChild(button);
    updateAnswers();
};

var sendQuestion = function(e){
    var id = e.currentTarget.dataset.question_id;
    var question = slides[current_slide].questions[id];
    question.id = id;

    currentAnswers = [];
    totalAnswers = 0;

    socket.emit("new_question", question);
    document.getElementById("currentQuestion").className = "questionSent";
    document.getElementById("question"+id).className = "sent";
};

var updateAnswers = function(){
    var total = Math.max(1,totalAnswers);
    for(var i = 0; i < slides[current_slide].questions[currentQuestion].answers.length; i++){
        console.log((currentAnswers[i]/total));
        currentAnswers[i] = currentAnswers[i] || 0;
        var answer = document.querySelector("#currentQuestion > ul > li:nth-child("+(i+1)+")");
        answer.style.width = 100*(currentAnswers[i]/total)+"%";
        answer.innerHTML =
            slides[current_slide].questions[currentQuestion].answers[i]
            + " - "
            + currentAnswers[i]
            + " réponse(s)";
    }
    document.querySelector("#currentQuestion .answerCount").innerHTML = totalAnswers+"/"+elvCount;
};

var load_questions = function() {
	var questionContainer = document.querySelector("#questions");
	questionContainer.innerHTML = "";
	var questions = slides[current_slide].questions;
	for(var i = 0; i < questions.length; i++){
		var questionDiv = renderQuestion(i,questions[i]);
		console.log(questionDiv);
		questionDiv.addEventListener("click",questionClicked);
		questionContainer.appendChild(questionDiv);
	}
};

var load_course = function (course) {
    var script = document.createElement("script");
	script.src = "slides/"+course+".js";
    document.querySelector("head").appendChild(script);
    document.querySelector(".fileLoading").className += " disabled";
};
var register_slides = function(slide){
    slides = slide;
    current_slide = 0;
    changeSlide(null,0);

    var className = document.querySelector(".slideContainer").className;
    className = className.split(" ");
    for(var i = 0; i < className.length; i++){
        if(className[i] == "disabled"){
            className.splice(i,1);
        }
    }
    document.querySelector(".slideContainer").className = className;
    checkSlidesState();
};

var current_slide = 0;
var current_slide_content = null;
var foo_previous_slide = function () {
	if (current_slide > 0) {
        changeSlide(current_slide,current_slide-1);
	}
    checkSlidesState();
};
var foo_next_slide = function () {
	if (current_slide < slides.length-1) {
        changeSlide(current_slide,current_slide+1);
	}
    checkSlidesState();
};

var cleanSlides = function(){
    var slides = document.querySelectorAll(".slide");
    for(var i = slides.length-2; i >= 0; i--){
        slides[i].parentNode.removeChild(slides[i]);
    }
};

var changeSlide = function(oldVal,newVal){
    cleanSlides();
    var data = slides[current_slide].innerHTML;
    var newSlide = document.createElement("div");
    newSlide.className = "";
    newSlide.innerHTML = data;
    var oldSlide = current_slide_content;
    var slider = document.getElementById("slide");

    if(oldSlide){
        if(oldVal > newVal){
            newSlide.className = "slide prevSlide";
            oldSlide.className = "slide nextSlide";
            socket.emit("previous_slide", data);
        } else {
            newSlide.className = "slide nextSlide";
            oldSlide.className = "slide prevSlide";
            socket.emit("next_slide", data);
        }
    } else {
        socket.emit("new_course",data);
    }
    slider.appendChild(newSlide);
    setTimeout(function(){
        newSlide.className = "slide";
    },100);
    current_slide = newVal;
    current_slide_content = newSlide;
    load_questions();
    setTimeout(cleanSlides,1000);
};

var checkSlidesState = function(){
    document.getElementById("next").disabled = false;
    document.getElementById("previous").disabled = false;

    if(current_slide == slides.length-1){
        document.getElementById("next").disabled = true;
    }
    if(current_slide == 0){
        document.getElementById("previous").disabled = true;
    }
};

document.getElementById("previous").addEventListener("click", foo_previous_slide);
document.getElementById("next").addEventListener("click", foo_next_slide);
document.getElementById("courseSelector").addEventListener("change", function(){
    load_course(document.getElementById("courseSelector").value);
});

socket.on("answer", function(data){
    currentAnswers  [data.answer] = currentAnswers[data.answer] || 0;
    currentAnswers[data.answer]++;
    totalAnswers++;
    updateAnswers();
});

socket.on("elvCount", function(data){
    elvCount = data;
});

load_course("health");

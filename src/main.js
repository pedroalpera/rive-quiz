// This is the High level JS runtime for Rive
// https://rive.app/community/doc/web-js/docvlgbnS1mp

const riveInstance = new rive.Rive({
  src: "quiz.riv",
  canvas: document.getElementById("canvas"),
  autoplay: true,
  artboard: "Artboard",
  stateMachines: "State Machine 1",
   automaticallyHandleEvents: true,

  onLoad: () => {
    riveInstance.resizeDrawingSurfaceToCanvas();

    let questions;  
    let questionsScore = 0;
    let questionNumber = 0;
    let numberOfQuestions;
    let solution; 
    let rightAnswer;
    let actualState = "Check";

   // inputs in the Rive File
   const inputs = riveInstance.stateMachineInputs("State Machine 1");

   let answerSelected = inputs.find((i) => i.name === "answerSelected");
   let wrong_Boolean = inputs.find((i) => i.name === "wrong_Boolean");
   let right_Boolean = inputs.find((i) => i.name === "right_Boolean");
   let nextScreen_Trigger = inputs.find((i) => i.name === "nextScreen_Trigger");
   let resultsScreen_Trigger = inputs.find((i) => i.name === "resultsScreen_Trigger");
   let playAgain_Trigger = inputs.find((i) => i.name === "playAgain_Trigger");
   let bar_Number = inputs.find((i) => i.name === "bar_Number");


    // Load JSON with the questions and answers
    fetch('src/questions.json')
    .then((response) => response.json())
    .then((data) =>  questions = data)
    .then((data) =>  init()); 

    
    function init() {
      numberOfQuestions = questions.length;
      questionsScore = 0;
      questionNumber = 0;
      actualState = "Check";
      showQuestion(questionNumber);

      
        // Activate buttons
        riveInstance.setBooleanStateAtPath("active_Boolean",true,"Answer1");
        riveInstance.setBooleanStateAtPath("active_Boolean",true,"Answer2");
        riveInstance.setBooleanStateAtPath("active_Boolean",true,"Answer3");

        // Reset Poll
        riveInstance.setBooleanStateAtPath("selected_Boolean",false,"Answer1");
        riveInstance.setBooleanStateAtPath("selected_Boolean",false,"Answer2");
        riveInstance.setBooleanStateAtPath("selected_Boolean",false,"Answer3");


        riveInstance.setBooleanStateAtPath("active_Boolean",false,"MainButton");
    }

    function playAgain() {
      playAgain_Trigger.fire();
      init();
      
    }

    function goNext() {
  
      questionNumber++;
      
      if (numberOfQuestions > questionNumber) {
        // If we have more questions
        // console.log("SIGUIENTE PREGUNTA");
        
        actualState = "Check";

        nextScreen_Trigger.fire();

        showQuestion(questionNumber);

        // Activate buttons
        riveInstance.setBooleanStateAtPath("active_Boolean",true,"Answer1");
        riveInstance.setBooleanStateAtPath("active_Boolean",true,"Answer2");
        riveInstance.setBooleanStateAtPath("active_Boolean",true,"Answer3");

        // Reset Poll
        riveInstance.setBooleanStateAtPath("selected_Boolean",false,"Answer1");
        riveInstance.setBooleanStateAtPath("selected_Boolean",false,"Answer2");
        riveInstance.setBooleanStateAtPath("selected_Boolean",false,"Answer3");

        riveInstance.setBooleanStateAtPath("active_Boolean",false,"MainButton");
    

        // Reset Values
        wrong_Boolean.value = false;
        right_Boolean.value = false;


      } else {
        // If there is nor more questions go to final screen

        actualState = "Results";

        riveInstance.setTextRunValueAtPath("MainRun", "PLAY AGAIN", "MainButton");     
        resultsScreen_Trigger.fire();
        riveInstance.setTextRunValue("ResultsRun1", +questionsScore + "/" + numberOfQuestions + "\n");
        riveInstance.setTextRunValue("ResultsRun2", "ANSWERS RIGHT");

        // Reset Values
        wrong_Boolean.value = false;
        right_Boolean.value = false;
        
      }
    }

    const onRiveEventReceived = (riveEvent) => {
      
      const eventData = riveEvent.data;
      const eventProperties = eventData.properties;

     // Events from the Rive File
      if (eventData.type === rive.RiveEventType.General) {
        if (eventData.name == "Event MainButtonAction" && actualState == "Next") {
          // Go to next Question
          goNext();

        } else if (eventData.name == "Event MainButtonAction" && actualState == "Results") {
          // Play Again
          playAgain();
          
        } else if (eventData.name == "Event MainButtonAction" && actualState == "Check") {
          if (answerSelected.value != 0) {
          // Check if solution is right or wrong

          actualState = "Next";

          // deactivate buttons
          riveInstance.setBooleanStateAtPath("active_Boolean",false,"Answer1");
          riveInstance.setBooleanStateAtPath("active_Boolean",false,"Answer2");
          riveInstance.setBooleanStateAtPath("active_Boolean",false,"Answer3");

          riveInstance.setTextRunValueAtPath("MainRun", "NEXT", "MainButton");     
        
          

        if (answerSelected.value == solution) {
          // If answer is RIGHT
          questionsScore++;
          right_Boolean.value = true;
          riveInstance.setTextRunValue("TitleRun", "RIGHT \n");
          riveInstance.setTextRunValue("SubtitleRun", "Great Work! :) ");
          riveInstance.setTextRunValue("RightAnswerRun", "");
          answerSelected.value = 0;
    
        } else {  
          // Of anser is WRONG
          wrong_Boolean.value = true;
          riveInstance.setTextRunValue("TitleRun", "WRONG! \n");
          riveInstance.setTextRunValue("SubtitleRun", "The right answer is: \n");
          riveInstance.setTextRunValue("RightAnswerRun", rightAnswer);
          answerSelected.value = 0;
        }
    
  }
        }
      }
    };

    riveInstance.on(rive.EventType.RiveEvent, onRiveEventReceived);

    function showQuestion(i) {

      // calculate graphic bar length
      bar_Number.value = ((questionNumber + 1) *100)/ numberOfQuestions;

      riveInstance.setTextRunValue("QuestionRun", questions[i].question);
      riveInstance.setTextRunValueAtPath("AnswerRun", questions[i].answer1, "Answer1");
      riveInstance.setTextRunValueAtPath("AnswerRun", questions[i].answer2, "Answer2");
      riveInstance.setTextRunValueAtPath("AnswerRun", questions[i].answer3, "Answer3");

      solution = questions[i].solution;
      rightAnswer =eval("questions[i]." +"answer" +  solution);
      
      riveInstance.setTextRunValueAtPath("MainRun", "CHECK ANSWER", "MainButton");      
    
    }

    
  },
});

$(document).ready(()=>{
  // チャット機能用
  const socket=io();
  $("#chatForm").submit(()=>{
    let text=$("#chat-input").val();
    let userName=$("#chat-user-name").val();
    let userId=$("#chat-user-id").val();
    socket.emit("message",{
      content:text,
      userName:userName,
      userId:userId
    });
    $("#chat-input").val("");
    return false;
  });
  socket.on("message",(message)=>{
    displayMessage(message);
    for(let i = 0; i < 2; i++){
      $(".chat-icon")
        .fadeOut(200)
        .fadeIn(200);
    }
  });
  socket.on("load all messages",(data)=>{
    data.forEach(message=>{
      displayMessage(message);
    });
  });
  socket.on("user disconnected",()=>{
    displayMessage({userName: "Notice",content: "User left tha chat"});
  });
  let displayMessage=(message)=>{
    $("#chat").prepend($("<li>").html(`
    <strong class="message ${getCurrentUserClass(message.user)}">${message.userName}:</strong>
    ${message.content}
    `));
  };
  let getCurrentUserClass=(id)=>{
    let userId=$("#chat-user-id").val();
    return userId === id ? "current-user" : "a";
  }
  // 最近のコースの出力
  $("#modal-button").click(()=>{
    console.log("kore");
    $(".modal-body").html('');
    $.get("/api/courses",(results={})=>{
      let data=results.data;
      if(!data || !data.courses) return;
      data.courses.forEach((course)=>{
        $(".modal-body").append(
          `<div>
            <span class="course-title">${course.title}</span>
            <div class="course-description">${course.description}</div>
            <button class='button ${course.joined ? "joined-button" : "join-button"}' data-id="${course._id}">
							${course.joined ? "Joined" : "Join"}
						</button>
          </div>`
        );
      });
    }).then(()=>{
      addJoinButtonListener();
    });
  });
});
// 参加しているコースのボタン変更
// tryagainボタンバグ未修正
let addJoinButtonListener=()=>{
  $(".join-button").click((event)=>{
    console.log("kore");
    let $button=$(event.target);
    $button.text("Try again");
    let courseId=$button.data("id");
    $.get(`/api/courses/${courseId}/join`,(results={})=>{
      let data=results.data;
      $button.text("Try again");
      if(data && data.success){
        $button
          .text("joined")
          .addClass("jouned-button")
          .removeClass("join-button");
      }else{
        $button.text("Try again");
      }
    });
  });
}
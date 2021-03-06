const socket = io();

const login = document.getElementById('login');
const transmission = document.getElementById('transmission');
transmission.style.display = 'none';

/* Login */
const nickname = document.getElementById('nickname');
const code = document.getElementById('code');
const submit = document.getElementById('submit');

submit.addEventListener('click', function(e){
    e.preventDefault();
    if (nickname.value && code.value) {
      socket.emit('login message', {'nickname': nickname.value, 'code': code.value});
      code.value = '';
    }
});

socket.on('login message', function (msg) {
   if (msg.status === 200) {
       if (msg.nick == nickname.value) {
           login.style.display = 'none';
           transmission.style.display = '';
           document.querySelector('h1').innerText = nickname.value;
           document.querySelector('title').innerText = nickname.value;
       }
       alert(msg.success);       
   } 
   if (msg.status === 400 && msg.nick == nickname.value) {
       alert(msg.error);
   }
});

/* Chat */

const message = document.getElementById('message');
const send = document.getElementById('send');
const chatBox = document.getElementById('chatbox');

class ChatItem {
    constructor(message, nick='Anonymous', time='Eternity') {
        this.message = message;
        this.nick = nick;
        this.time = time;
    }
    
    render(parent) {
        let template  = `
        <div class="media border p-3 mt-2">
            <img src="img/avatar-man.png" alt="${this.nick}" class="mr-3 mt-3 rounded-circle" style="width:60px;">
            <div class="media-body">
            <h4>${this.nick} <small><i>Posláno: ${this.time}</i></small></h4>
            <p>${this.message}</p>
            </div>
        </div>`;
        parent.innerHTML += template;
    }
}

send.addEventListener('click', function(e){
    e.preventDefault();
    if (message.value) {
      socket.emit('chat message', {'message': message.value, 'nick': nickname.value});
      message.value = '';
    }
});

socket.on('chat message', function (msg) {
    let chatItem = new ChatItem(msg.message, msg.nick, msg.time);
    chatItem.render(chatBox);
    window.scrollTo(0, document.body.scrollHeight);
});


/* Canvas */
const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");
const color = document.getElementById("color");
const activeNick = document.getElementById('activenick');

class Circle {
  static DEFAULT_RADIUS = 20;

  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Circle.DEFAULT_RADIUS;
  }
}

function redrawCanvas(circles) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(function(circle) {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
      ctx.fillStyle = circle.color;
      ctx.fill();
      ctx.closePath();
    });
}

canvas.addEventListener("click", function (event) {
  if (activeNick.innerText == nickname.value)
    socket.emit('canvas message', new Circle(event.offsetX, event.offsetY, color.value));
});

socket.on('canvas message', function (res) {
  activeNick.innerText = res.nick;  
  redrawCanvas(res.data);
});

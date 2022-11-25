 // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
 // 貼り付ける場所
import { getDatabase, ref, push,set, onChildAdded, remove, onChildRemoved , serverTimestamp} 
from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";
      // TODO: Add SDKs for Firebase products that you want to use
      // https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged }  
from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
    
      // Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBY7Pl8vMrdjcC5Wl75esGnVqveLzjj22M",
    authDomain: "dev245-31571.firebaseapp.com",
    databaseURL: "https://dev245-31571-default-rtdb.firebaseio.com",
    projectId: "dev245-31571",
    storageBucket: "dev245-31571.appspot.com",
    messagingSenderId: "504693795631",
    appId: "1:50469     3795631:web:f870a3753b08bcd23f8fda"
  };
    
 // Initialize Firebase
const app = initializeApp(firebaseConfig);
 //↑↑ 以上はgoogleサイトからコピーする

const db = getDatabase(app);//RealtimeDBに接続
// const dbRef = ref(db, 'room');//RealtimeDatabase内の”room“を使う


//###############################################
//GoogleAuth用
//###############################################
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
const auth = getAuth();

//###############################################
//Loginしていれば処理します
//###############################################
onAuthStateChanged(auth, (user) => {
  if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      //ユーザー情報取得できます
      if (user !== null) {
          user.providerData.forEach((profile) => {
              //Login情報取得
              $("#uname").text(profile.displayName);
              $("#prof").attr("src",profile.photoURL);
              // console.log("Sign-in provider: " + profile.providerId);
              // console.log("Provider-specific UID: " + profile.uid);
              // console.log("Email: " + profile.email);
              // console.log("Photo URL: " + profile.photoURL);
          });
          $("#status").fadeOut(500);
      }

$("#send").hide(); //送信ボタン非表示

//クリックで画像を選択 選択した画像を表示
let d = 0;
const img = ["d.png", "m.png","w.png","p.png"]
$(".icon").on("click", function(){
// console.log(this);
d = $(this).data("img")-1;
console.log(d);
let no = img[d] 
// console.log(no);
let str = '<img src="img/'+ no + '">'
// console.log(str);
$("#choice").html(str);

});

// データ登録(Click)

$("#text").on("keydown",function(e){ //入力されたら送信ボタンを表示する
  $("#send").show();
});

$("#send").on("click",function() {
  const msg = {                 // msg という名前でデータの塊を作ります
      uname: $("#uname").val(), // unameという鍵の名前
      text: $("#text").val(),   //textというカギの名前
      date: serverTimestamp(),
      icon: d //選択した画像を記録
  }
  if ($("#text").val() === ""){
    alert("メッセージを入力してください");
    $("#send").hide();
  } else{
  const dbRef = ref( db, "users/"+uid+"/chat/");
  const newPostRef = push(dbRef); //ユニークKEYを生成,firebaseに送る準備をしている
  set(newPostRef, msg);           //"chat"にユニークKEYをつけてオブジェクトデータを登録

  // 送信後に、入力欄を空にする
  $('#text').val("");
  // カーソルを入力欄に固定する
  $("#text").focus();
  $("#send").hide();
  }
});

// データ登録(Enter)
// $("#text").on("keydown",function(e){
//   console.log(e);        //e変数の中身を確認！！
//   if(e.keyCode == 13){   //EnterKey=13
//       const msg = {
//           uname: $("#uname").val(),
//           text: $("#text").val(),
//           date: serverTimestamp(),
//           icon: d //選択した画像を記録
//       }
//       const newPostRef = push(dbRef); //ユニークKEYを生成
//       set(newPostRef, msg);           //"chat"にユニークKEYをつけてオブジェクトデータを登録
//   }

//   $('#text').val(""); // 送信後に、入力欄を空にする

//   $("#text").focus(); // カーソルを入力欄に固定する

// });

// 受信処理を記述 最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
const dbRef = ref( db, "users/"+uid+"/chat/");
onChildAdded(dbRef, function (data) {

// 登録されたデータを取得します
const msg = data.val(); //オブジェクトデータを取得し、変数msgに代入
console.log(msg, '取得したデータの塊')
const key = data.key; //データのユニークキー（削除や更新に使用可能）
// console.log(key, 'データの塊にアクセス')

//UNIX Epoch timeからJSTへ変換
const time = new Date(msg.date);
// console.log(time);
// let date = dateTime.toLocaleDateString('ja-JP').slice(5) //sliceメソッド
// console.log(date);
// console.log(dateTime.toLocaleTimeString('ja-JP'));

// es6のテンプレートリテラル  表示用テキスト・HTMLを作成

    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate(); 
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();
let h = `
      <div class="msg">
      <p>${year}年${month}月${day}日${hour}:${min}:${sec}</p>
      <p class="name">${msg.uname}</p>
      <p class="msg_text">${msg.text}</p>
      <img src="img/${img[msg.icon]}">
      <button data-a=${key} id="delete">削除</button>
      </div>   
`;

// htmlに埋め込みましょう
$("#output").append(h);
const output = document.querySelector("#output");
// console.log(output);
output.scrollTo(0, output.scrollHeight);

});

//個別投稿削除
$(document).on("click", "#delete", function () {
  // let v = $(this).parent().data("ddd");
  // console.log(v, "親");
  let aa = $(this).data("a"); //data-a data-は省略するので　「a」
  console.log(aa, "カギ");
  remove(ref(db, "room/" + aa));//aaカギのデータを削除
  // remove(dbRef); //remove(deref)=>全削除
  location.reload(); // jsのおまじない、本来はfirebase側に onChildRemoved

});

//全投稿削除
$(document).on("click", "#clear", function () {
  remove(dbRef);// => 全削除
  location.reload();
});

} else {
  _redirect();  // User is signed out
}
});

//###############################################
//Logout処理
//###############################################
$("#out").on("click", function () {
  // signInWithRedirect(auth, provider);
  signOut(auth).then(() => {
      // Sign-out successful.
      _redirect();
  }).catch((error) => {
      // An error happened.
      console.error(error);
  });
});


//###############################################
//Login画面へリダイレクト(関数作成)
//###############################################
function _redirect(){
  location.href="login.html";
}

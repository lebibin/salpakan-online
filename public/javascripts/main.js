// Generated by CoffeeScript 1.4.0
/*

	This is the main app script file
*/(function(){var e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_,D,P,H,B,j,F,I,q,R,U,z,W,X,V,J,K,Q,G;h=$("#board"),_=$("#progress"),G=$("#board ul:gt(4) li"),c=$("#board ul:lt(3) li"),C=null,V=1,z=null,p=null,u=null,a=null,X=null,y="ABCDEFGHI",t=$("#cover"),r=$("#guide"),e=$("#chat"),i=$("#msg"),x=null,b=null,A=21,E=function(){var n;return t.fadeIn(100),n=$("#name"),$(n).submit($.proxy(function(t){t.preventDefault(),C=S($("#playerName").val());if(!C||C.length>16)C="Anonymous";return n.remove(),m(C),k(),socket.emit("player connect",{name:C}),e.fadeIn(100).submit($.proxy(function(e){var t,n;return e.preventDefault(),t=C,n=S(i.val()),n!==""&&n.length<64&&socket.emit("add message",{author:t,message:n}),i.val("")}))})),n.show().appendTo(t),$("#playerName").focus()},T=function(){return e.hide(),l(),E()},w=function(){return B(),d(b),r.fadeOut(100),$("#pieces").show(),z="preparation"},S=function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;")},k=function(){return t.fadeIn(100),_.show().appendTo(t)},B=function(){return t.fadeOut(100),_.hide()},J=function(){return $("#board ul li").off("click")},l=function(){return $(".piece").each(function(){var e,t;return e=$(this),t=e.parent(),t.click(function(){var e,n,r,i,s,o,u,a,f,l,c;u=t.attr("id");if(z==="preparation"){if(u===void 0&&!t.hasClass("occupied"))return L(this)}else if(z==="war"){i=u[1],r=u[0],l=r+(parseInt(i)+1),s=y[y.indexOf(r)-1]+i,a=y[y.indexOf(r)+1]+i,n=r+(parseInt(i)-1),c=e=o=f=!1;if($("li#"+l).hasClass("occupied")||i==="8")c=!0;if($("li#"+n).hasClass("occupied")||i==="1")e=!0;if($("li#"+s).hasClass("occupied")||r==="A")o=!0;if($("li#"+a).hasClass("occupied")||r==="I")f=!0;return c&&e&&o&&f?console.log("can move this piece sorry"):L(this)}})})},K=function(){return $(".piece").parent().off("click")},s=$("#messages ul"),f=function(e){return $("<li><span class='author'>"+e.author+"</span> : "+e.message+"</li>").prependTo(s)},n=$("#Dash"),d=function(e){var t;return e==="black"?t="#130f30":t="#FFFFE5",n.css("background-color",t)},o=$("#turn"),m=function(e){return o.html("General "+e)},F=function(e){var t,n,r,i,s,o,u,f,l,h;if(z==="preparation")return e==="black"?c.addClass("legal").each(function(){var e;e=$(this);if(!e.hasClass("occupied"))return e.click(function(){return U(this)})}):e==="white"?G.addClass("legal").each(function(){var e;e=$(this);if(!e.hasClass("occupied"))return e.click(function(){return U(this)})}):console.log("unknown color");if(z==="war"){u=a[1],o=a[0],u!=="8"&&(h=o+(parseInt(u)+1),i=$("li#"+h),i.hasClass("occupied")||(i.hasClass("opponent")?i.removeClass("opponentMoved").addClass("challenge"):i.addClass("legal"),i.click(function(){return U(this)}))),o!=="A"&&(f=y[y.indexOf(o)-1]+u,n=$("li#"+f),n.hasClass("occupied")||(n.hasClass("opponent")?n.removeClass("opponentMoved").addClass("challenge"):n.addClass("legal"),n.click(function(){return U(this)}))),o!=="I"&&(l=y[y.indexOf(o)+1]+u,r=$("li#"+l),r.hasClass("occupied")||(r.hasClass("opponent")?r.removeClass("opponentMoved").addClass("challenge"):r.addClass("legal"),r.click(function(){return U(this)})));if(u!=="1"){s=o+(parseInt(u)-1),t=$("li#"+s);if(!t.hasClass("occupied"))return t.hasClass("opponent")?t.removeClass("opponentMoved").addClass("challenge"):t.addClass("legal"),t.click(function(){return U(this)})}}},P=function(){return $("#board ul li").removeClass("legal challenge ")},D=function(){return $("#board ul li").removeClass("legal")},H=function(){return $("#board ul li").removeClass("lmove opponentMoved")},L=function(e){var t;return t=$(e),u=e,z==="war"&&(a=t.attr("id")),t.addClass("active"),J(),K(),F(b)},U=function(e){var t,n,i,s,o,f,c,h;if(u)return n=$(e),t=$(u),h=t.html(),i=$(h),i.appendTo(n),o=n.attr("id"),z==="preparation"?(o[0]==="F"||o[0]==="G"||o[0]==="H"||o[0]==="I"?i.addClass("hint--left"):i.addClass("hint--right"),s=i.attr("title"),i.removeAttr("title").attr("data-hint",s),t.removeClass("active").fadeOut(100),--A,n.addClass("occupied").off("click"),socket.emit("place piece",{cell:o,name:C}),A===0&&($("#pieces").hide(),r.fadeIn(100),k(),socket.emit("player ready",{name:C}))):z==="war"&&(c=t.attr("id"),f=$(t.find(".piece img")).attr("alt"),t.removeClass("active occupied").children(".piece").remove(),n.addClass("occupied"),n.hasClass("challenge")?p=!0:p=!1,socket.emit("move piece",{crName:C,srcCell:c,destCell:o,piece:f,challenge:p})),P(),l(),u=null,a=null},O=function(e){return $("li#"+e.cell).addClass("opponent")},Q=function(e){return J(),K(),l(),D(),B(),z="war",g(e)},g=function(e){return X=e.turn,m(e.name),d(X),X===b?B():k()},v=function(){return X==="white"?X="black":X==="black"?X="white":console.log("change_turn error"),socket.emit("change turn",{turn:X})},N=function(e){return H(),$("li#"+e.destCell).addClass("opponentMoved opponent"),$("li#"+e.srcCell).addClass("lmove").removeClass("opponent")},W=function(e){var t;return t=$("li#"+e.destCell).find(".piece img").attr("alt"),socket.emit("challenge end",{challengee:t,ceName:C,destCell:e.destCell,challenger:e.challenger,crName:e.crName,color:b})},j=function(e){var t;t=$("#"+e.destCell),e.tie?(t.find('img[alt="'+e.winner+'"]').parent().remove(),t.removeClass("opponent opponentMoved occupied")):t.find('img[alt="'+e.winner+'"]').length!==0?(t.removeClass("opponent opponentMoved"),M("points",!1)):(t.find('img[alt!="'+e.winner+'"]').parent().remove(),t.removeClass("occupied")),J(),l();if(e.end)return q(e)},q=function(e){var n,r,i;return i=e.winnerName,C===e.winnerName?(r="Well played, congratulations!",M("win",!0)):(r="You've been outplayed, sorry.",M("lose",!0)),B(),n="<div id='result'>\n    <img src='/images/GG_logo.png' alt='Game of the Generals Online' title='Game of the Generals Online' />\n    <hr />\n    <h1>General "+i+"<br/>has WON!</h1>\n    <hr />\n    <h2>"+r+"</h2>\n</div>",t.fadeIn(100),$(n).appendTo(t)},I=function(){var e;return e="<div id='result'>\n    <img src='/images/GG_logo.png' alt='Game of the Generals Online' title='Game of the Generals Online' />\n    <hr />\n    <h1>Sorry the Server is FULL!</h1>\n    <hr />\n    <h2>Please try again later.</h2>\n</div>",t.fadeIn(100),$(e).appendTo(t)},R=new Audio,M=function(e,t){R.canPlayType("audio/mpeg")?R.src="audio/"+e+".mp3":R.canPlayType("audio/ogg")?R.src="audio/"+e+".ogg":R.src=null,R.loop=t;if(R.src)return R.load(),R.play()},window.socket=io.connect(),socket.on("initial connect",function(){return M("title_sound",!0),T()}),socket.on("player assign",function(e){return console.log("socket.on player assign"),x=e.id,b=e.color}),socket.on("game start",function(e){return console.log("socket.on game start"),M("",!1),w()}),socket.on("war start",function(e){return console.log("socket.on war start"),X=e.turn,Q(e)}),socket.on("change turn",function(e){return console.log("socket.on change turn"),g(e)}),socket.on("place piece",function(e){return M("move",!1),console.log("place piece"),O(e)}),socket.on("move piece",function(e){console.log("move piece"),M("move",!1),N(e);if(!e.end)return v()}),socket.on("end game",function(e){return console.log("end game"),q(e)}),socket.on("challenge start",function(e){return console.log("challenge start"),W(e)}),socket.on("challenge complete",function(e){return console.log("challenge end"),M("challenge",!1),j(e)}),socket.on("add message",function(e){return console.log("add message"),f(e)}),socket.on("full",function(){return console.log("full"),I(),socket.disconnect()})}).call(this);
// Generated by CoffeeScript 1.4.0
/*

	This is the main app script file
*/(function(){var e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A,O,M,_,D,P,H,B,j,F,I,q,R,U,z,W,X,V,J,K,Q,G,Y;p=$("#board"),D=$("#progress"),Y=$("#board ul:gt(4) li"),h=$("#board ul:lt(3) li"),k=null,J=1,W=null,d=null,a=null,f=null,V=null,b="ABCDEFGHI",t=$("#cover"),r=$("#guide"),e=$("#chat"),i=$("#msg"),o=$("#online"),T=null,w=null,O=21,S=function(){var n;return t.fadeIn(100),n=$("#name"),$(n).submit($.proxy(function(t){t.preventDefault(),k=x($("#playerName").val());if(!k||k.length>16)k="Anonymous";return n.remove(),g(k),L(),socket.emit("player connect",{name:k}),e.fadeIn(100).submit($.proxy(function(e){var t,n;return e.preventDefault(),t=k,n=x(i.val()),n!==""&&n.length<64&&socket.emit("add message",{author:t,message:n}),i.val("")}))})),n.show().appendTo(t),$("#playerName").focus()},N=function(){return e.hide(),c(),S()},E=function(){return j(),v(w),r.fadeOut(100),$("#pieces").show(),W="preparation"},x=function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;")},L=function(){return t.fadeIn(100),D.show().appendTo(t)},j=function(){return t.fadeOut(100),D.hide()},K=function(){return $("#board ul li").off("click")},c=function(){return $(".piece").each(function(){var e,t;return e=$(this),t=e.parent(),t.click(function(){var e,n,r,i,s,o,u,a,f,l,c;u=t.attr("id");if(W==="preparation"){if(u===void 0&&!t.hasClass("occupied"))return A(this)}else if(W==="war"){i=u[1],r=u[0],l=r+(parseInt(i)+1),s=b[b.indexOf(r)-1]+i,a=b[b.indexOf(r)+1]+i,n=r+(parseInt(i)-1),c=e=o=f=!1;if($("li#"+l).hasClass("occupied")||i==="8")c=!0;if($("li#"+n).hasClass("occupied")||i==="1")e=!0;if($("li#"+s).hasClass("occupied")||r==="A")o=!0;if($("li#"+a).hasClass("occupied")||r==="I")f=!0;return c&&e&&o&&f?console.log("can move this piece sorry"):A(this)}})})},Q=function(){return $(".piece").parent().off("click")},s=$("#messages ul"),l=function(e){return $("<li><span class='author'>"+e.author+"</span> : "+e.message+"</li>").prependTo(s)},n=$("#Dash"),v=function(e){var t;return e==="black"?t="#130f30":t="#FFFFE5",n.css("background-color",t)},u=$("#turn"),g=function(e){return u.html("General "+e)},I=function(e){var t,n,r,i,s,o,u,a,l,c;if(W==="preparation")return e==="black"?h.addClass("legal").each(function(){var e;e=$(this);if(!e.hasClass("occupied"))return e.click(function(){return z(this)})}):e==="white"?Y.addClass("legal").each(function(){var e;e=$(this);if(!e.hasClass("occupied"))return e.click(function(){return z(this)})}):console.log("unknown color");if(W==="war"){u=f[1],o=f[0],u!=="8"&&(c=o+(parseInt(u)+1),i=$("li#"+c),i.hasClass("occupied")||(i.hasClass("opponent")?i.removeClass("opponentMoved").addClass("challenge"):i.addClass("legal"),i.click(function(){return z(this)}))),o!=="A"&&(a=b[b.indexOf(o)-1]+u,n=$("li#"+a),n.hasClass("occupied")||(n.hasClass("opponent")?n.removeClass("opponentMoved").addClass("challenge"):n.addClass("legal"),n.click(function(){return z(this)}))),o!=="I"&&(l=b[b.indexOf(o)+1]+u,r=$("li#"+l),r.hasClass("occupied")||(r.hasClass("opponent")?r.removeClass("opponentMoved").addClass("challenge"):r.addClass("legal"),r.click(function(){return z(this)})));if(u!=="1"){s=o+(parseInt(u)-1),t=$("li#"+s);if(!t.hasClass("occupied"))return t.hasClass("opponent")?t.removeClass("opponentMoved").addClass("challenge"):t.addClass("legal"),t.click(function(){return z(this)})}}},H=function(){return $("#board ul li").removeClass("legal challenge ")},P=function(){return $("#board ul li").removeClass("legal")},B=function(){return $("#board ul li").removeClass("lmove opponentMoved")},A=function(e){var t;return t=$(e),a=e,W==="war"&&(f=t.attr("id")),t.addClass("active"),K(),Q(),I(w)},z=function(e){var t,n,i,s,o,u,l,h;if(a)return n=$(e),t=$(a),h=t.html(),i=$(h),i.appendTo(n),o=n.attr("id"),W==="preparation"?(o[0]==="F"||o[0]==="G"||o[0]==="H"||o[0]==="I"?i.addClass("hint--left"):i.addClass("hint--right"),s=i.attr("title"),i.removeAttr("title").attr("data-hint",s),t.removeClass("active").fadeOut(100),--O,n.addClass("occupied").off("click"),socket.emit("place piece",{cell:o,name:k}),O===0&&($("#pieces").hide(),r.fadeIn(100),L(),socket.emit("player ready",{name:k}))):W==="war"&&(l=t.attr("id"),u=$(t.find(".piece img")).attr("alt"),t.removeClass("active occupied").children(".piece").remove(),n.addClass("occupied"),n.hasClass("challenge")?d=!0:d=!1,socket.emit("move piece",{crName:k,srcCell:l,destCell:o,piece:u,challenge:d})),H(),c(),a=null,f=null},M=function(e){return $("li#"+e.cell).addClass("opponent")},G=function(e){return K(),Q(),c(),P(),j(),W="war",y(e)},y=function(e){return V=e.turn,g(e.name),v(V),V===w?j():L()},m=function(){return V==="white"?V="black":V==="black"?V="white":console.log("change_turn error"),socket.emit("change turn",{turn:V})},C=function(e){return B(),$("li#"+e.destCell).addClass("opponentMoved opponent"),$("li#"+e.srcCell).addClass("lmove").removeClass("opponent")},X=function(e){var t;return t=$("li#"+e.destCell).find(".piece img").attr("alt"),socket.emit("challenge end",{challengee:t,ceName:k,destCell:e.destCell,challenger:e.challenger,crName:e.crName,color:w})},F=function(e){var t;t=$("#"+e.destCell),e.tie?(t.find('img[alt="'+e.winner+'"]').parent().remove(),t.removeClass("opponent opponentMoved occupied")):t.find('img[alt="'+e.winner+'"]').length!==0?(t.removeClass("opponent opponentMoved"),_("points",!1)):(t.find('img[alt!="'+e.winner+'"]').parent().remove(),t.removeClass("occupied")),K(),c();if(e.end)return R(e)},R=function(e){var n,r,i;return i=e.winnerName,k===e.winnerName?(r="Well played, congratulations!",_("win",!0)):(r="You've been outplayed, sorry.",_("lose",!0)),j(),n="<div id='result'>\n    <img src='/images/GG_logo.png' alt='Game of the Generals Online' title='Game of the Generals Online' />\n    <hr />\n    <h1>General "+i+"<br/>has WON!</h1>\n    <hr />\n    <h2>"+r+"</h2>\n</div>",t.fadeIn(100),$(n).appendTo(t)},q=function(){var e;return e="<div id='result'>\n    <img src='/images/GG_logo.png' alt='Game of the Generals Online' title='Game of the Generals Online' />\n    <hr />\n    <h1>Sorry the Server is FULL!</h1>\n    <hr />\n    <h2>Please try again later.</h2>\n</div>",t.fadeIn(100),$(e).appendTo(t)},U=new Audio,_=function(e,t){U.canPlayType("audio/mpeg")?U.src="audio/"+e+".mp3":U.canPlayType("audio/ogg")?U.src="audio/"+e+".ogg":U.src=null,U.loop=t;if(U.src)return U.load(),U.play()},window.socket=io.connect(),socket.on("initial connect",function(){return _("title_sound",!0),N()}),socket.on("player assign",function(e){return console.log("socket.on player assign"),T=e.id,w=e.color}),socket.on("game start",function(e){return console.log("socket.on game start"),_("",!1),E()}),socket.on("war start",function(e){return console.log("socket.on war start"),V=e.turn,G(e)}),socket.on("change turn",function(e){return console.log("socket.on change turn"),y(e)}),socket.on("place piece",function(e){return _("move",!1),console.log("place piece"),M(e)}),socket.on("move piece",function(e){console.log("move piece"),_("move",!1),C(e);if(!e.end)return m()}),socket.on("end game",function(e){return console.log("end game"),R(e)}),socket.on("challenge start",function(e){return console.log("challenge start"),X(e)}),socket.on("challenge complete",function(e){return console.log("challenge end"),_("challenge",!1),F(e)}),socket.on("add message",function(e){return console.log("add message"),l(e)}),socket.on("full",function(){return console.log("full"),q(),socket.disconnect()}),socket.on("show num online",function(e){return console.log("show num online"),o.html(e.numOnline)})}).call(this);
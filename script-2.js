/*globals window, document*/

(function () {
  "use strict";

  function App() {

    this.init();
    this.deal();
  }

  App.prototype = {

    init: function () {
      var suits, cards, i, j, index, el, top, left;
      suits = ["diamonds", "clubs", "heart", "spade"];
      cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
      this.deck = [];
      index = 0;
      top  = -48;
      left = -81;
      for (i = 0; i < suits.length; i += 1) {
        for (j = 0; j < cards.length; j += 1) {
          this.deck.push({
            "suit":  suits[i],
            "card":  cards[j],
            "index": index,
            "top":   top,
            "left":  left,
            "open":  false,
            "black": suits[i] === "clubs" || suits[i] === "spade",
            "red":   suits[i] === "diamonds" || suits[i] === "heart"
          });
          index += 1;
          left -= 132;
        }
        top -= 185;
        left = -81;
      }
      for (i = 0; i < this.deck.length; i += 1) {
        el = document.createElement("DIV");
        el.className = "card" + (this.deck[i].open ? " open" : "");
        el.style.backgroundPosition = this.deck[i].left + "px " + this.deck[i].top + "px";
        this.deck[i].el = el;
      }
    },

    deal: function () {
      var i, j, k = 0, l = 1;
      for (i = 1; i <= 7; i += 1) {
        for (j = 1; j <= l; j += 1) {
          this.deck[k].open = j === l;
          this.deck[k].el.className = "card" + (j === l ? " open" : "");
          document.body.querySelector(".stacks-3 .stack-" + i).appendChild(this.deck[k].el);
          this.deck[k].el.style.top = ((j - 1) * 20) + "px";
          k += 1;
        }
        l += 1;
      }
      for (i = k; i < this.deck.length; i += 1) {
        this.deck[i].open = false;
        this.deck[i].el.className = "card";
        document.body.querySelector(".stacks-1 .stack-1").appendChild(this.deck[i].el);
        this.deck[i].el.style.top = "0px";
      }
    },

    shuffle: function() {
      var j, x, i;
      for (i = this.deck.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = this.deck[i - 1];
        this.deck[i - 1] = this.deck[j];
        this.deck[j] = x;
      }
    }

  };


  window.app = new App();

}());

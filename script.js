/*globals window, document, setTimeout, clearTimeout, setInterval, clearInterval*/

(function () {
  "use strict";

  var timeoutId, intervalId, solveSpeed = 20;

  function App() {

    this.deck = this.initDeck();
    this.dealCards();
    document.body.querySelector(".controls .deal").onclick = this.dealCards.bind(this);
    document.body.querySelector(".controls .solve").onclick = this.solve.bind(this);
  }

  App.prototype = {

    initDeck: function () {
      var deck, card, suits, faces, top, left, i, j, dealer;
      suits  = ["diamonds", "clubs", "heart", "spade"];
      faces  = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
      dealer = document.body.querySelector(".dealer[data-id='1']");
      deck   = [];
      top    = -48;
      left   = -81;
      for (i = 0; i < suits.length; i += 1) {
        for (j = 0; j < faces.length; j += 1) {
          card = document.createElement("DIV");
          card.className = "card";
          card.style.backgroundPosition = left + "px " + top + "px";
          card.dataset.suit  = suits[i];
          card.dataset.face  = faces[j];
          card.dataset.value = faces[j] === "ace" ? 1 : (j + 2);
          card.dataset.black = suits[i] === "clubs" || suits[i] === "spade";
          card.dataset.red   = suits[i] !== "clubs" && suits[i] !== "spade";
          card.dataset.open  = false;
          deck.push(card);
          dealer.appendChild(card);
          left -= 132;
        }
        top -= 185;
        left = -81;
      }
      this.deck = deck;
      return this.deck;
    },

    dealCards: function () {
      var piles, dealer, idx, len;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      piles = document.body.getElementsByClassName("pile");
      for (idx = 0, len = piles.length; idx < len; idx += 1) {
        piles[idx].dataset.suit = null;
      }
      dealer = document.body.querySelector(".dealer[data-id='1']");
      this.collectCardsAnimate(0, dealer, function () {
        this.shuffleCards();
        this.dealCardsAnimate();
      }.bind(this));
    },

    collectCardsAnimate: function (idx, targetDiv, callback) {
      var card = this.deck[idx];
      if (!card) {
        callback();
        return;
      }
      if (card.dataset.open === "true" || card.dataset.open === true) {
        this.flipFaceDown(card, function () {
          this.collectCardsAnimate(idx, targetDiv, callback);
        }.bind(this));
        return;
      }
      if (card.parentNode !== targetDiv) {
        this.moveCard(card, targetDiv, function () {
          this.collectCardsAnimate(idx, targetDiv, callback);
        }.bind(this));
        return;
      }
      this.collectCardsAnimate(idx + 1, targetDiv, callback);
    },

    dealCardsAnimate: function (cardNr) {
      var card, stack;
      cardNr = cardNr || 1;
      if      (cardNr <=  1)  { stack = 1; }
      else if (cardNr <=  3)  { stack = 2; }
      else if (cardNr <=  6)  { stack = 3; }
      else if (cardNr <= 10)  { stack = 4; }
      else if (cardNr <= 15)  { stack = 5; }
      else if (cardNr <= 21)  { stack = 6; }
      else if (cardNr <= 28)  { stack = 7; }
      if (!stack) {
        return;
      }
      stack  = document.body.querySelector(".stack[data-id='" + stack + "']");
      card   = this.deck[this.deck.length - cardNr - 1];
      this.moveCard(card, stack, function() {
        switch(cardNr) {
          case 1:
          case 3:
          case 6:
          case 10:
          case 15:
          case 21:
            this.flipFaceUp(card, function() {
              this.dealCardsAnimate(cardNr + 1);
            }.bind(this));
            break;
          case 28:
            this.flipFaceUp(card);
            break;
          default:
            this.dealCardsAnimate(cardNr + 1);
            break;
        }
      }.bind(this));
    },

    moveCard: function (card, target, callback) {
      var left, top, newLeft, newTop, wrapper, speed = 20, offsetTop = 0;
      wrapper = document.body.querySelector(".wrapper");
      if (target.className.indexOf("stack") !== -1) {
        offsetTop = target.childNodes.length * 20;
      }
      left    = card.parentNode.offsetLeft + 2;
      top     = card.parentNode.offsetTop + 2 + card.offsetTop;
      newLeft = target.offsetLeft;
      newTop  = target.offsetTop + offsetTop;
      card.parentNode.removeChild(card);
      wrapper.appendChild(card);
      card.style.left = left + "px";
      card.style.top  = top + "px";
      intervalId = setInterval(function () {
        var tx = newLeft - left,
            ty = newTop - top,
            dist = Math.sqrt(tx * tx + ty * ty);
        if (dist >= speed) {
          left += (tx / dist) * speed;
          top += (ty / dist) * speed;
          card.style.left = left + "px";
          card.style.top  = top + "px";
        } else {
          clearInterval(intervalId);
          //wrapper.removeChild(card);
          card.style.left = null;
          card.style.top  = offsetTop ? offsetTop + "px" : null;
          target.appendChild(card);
          if (typeof callback === "function") {
            callback();
          }
        }
      }, 5);
    },

    flipCard: function (card, callback) {
      card.style.transitionDuration = "0.1s";
      card.style.transitionProperty = "transform";
      timeoutId = setTimeout(function () {
        card.style.transform = "rotateY(90deg)";
        timeoutId = setTimeout(function () {
          if (card.dataset.open === "true" || card.dataset.open === true) {
            card.dataset.open = false;
          } else {
            card.dataset.open = true;
          }
          card.style.transform = "rotateY(0deg)";
          timeoutId = setTimeout(function () {
            card.style.transform = null;
            card.style.transitionDuration = null;
            card.style.transitionProperty = null;
            if (typeof callback === "function") {
              callback();
            }
          }, 100);
        }, 100);
      }, 50);
    },

    flipFaceUp: function (card, callback) {
      if (card.dataset.open === "true" || card.dataset.open === true) {
        if (typeof callback === "function") {
          callback();
        }
        return;
      }
      card.style.transitionDuration = "0.1s";
      card.style.transitionProperty = "transform";
      timeoutId = setTimeout(function () {
        card.style.transform = "rotateY(90deg)";
        timeoutId = setTimeout(function () {
          card.dataset.open = true;
          card.style.transform = "rotateY(0deg)";
          timeoutId = setTimeout(function () {
            card.style.transform = null;
            card.style.transitionDuration = null;
            card.style.transitionProperty = null;
            if (typeof callback === "function") {
              callback();
            }
          }, 100);
        }, 100);
      }, 50);
    },

    flipFaceDown: function (card, callback) {
      if (card.dataset.open === "false" || card.dataset.open === false) {
        if (typeof callback === "function") {
          callback();
        }
        return;
      }
      card.style.transitionDuration = "0.1s";
      card.style.transitionProperty = "transform";
      timeoutId = setTimeout(function () {
        card.style.transform = "rotateY(90deg)";
        timeoutId = setTimeout(function () {
          card.dataset.open = false;
          card.style.transform = "rotateY(0deg)";
          timeoutId = setTimeout(function () {
            card.style.transform = null;
            card.style.transitionDuration = null;
            card.style.transitionProperty = null;
            if (typeof callback === "function") {
              callback();
            }
          }, 100);
        }, 100);
      }, 50);
    },

    shuffleCards: function() {
      var deck, card, dealer, j, x, i, len;
      deck = this.deck;
      for (i = 0, len = deck.length; i < len; i += 1) {
        card = deck[i];
        if (card.parentNode) {
          card.parentNode.removeChild(card);
        }
      }
      for (i = deck.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = deck[i - 1];
        deck[i - 1] = deck[j];
        deck[j] = x;
      }
      dealer = document.body.querySelector(".dealer[data-id='1']");
      for (i = 0, len = deck.length; i < len; i += 1) {
        card = deck[i];
        dealer.appendChild(deck[i]);
      }
      this.deck = deck;
    },

    solve: function () {
      timeoutId = setTimeout(this.findFromStackForPile.bind(this), solveSpeed);
    },

    findFromStackForPile: function () {
      var id, stack, card, value, pile;
      for (id = 1; id <= 7; id += 1) {
        stack = document.body.querySelector(".stack[data-id='" + id + "']");
        if (stack && stack.childNodes.length) {
          card  = stack.childNodes[stack.childNodes.length - 1];
          value = parseFloat(card.dataset.value);
          if (value === 1) {
            this.moveAceToEmptyPile(card);
            return;
          }
          pile = document.body.querySelector(".pile[data-suit='" + card.dataset.suit + "']");
          if (pile && pile.childNodes.length && parseFloat(pile.childNodes[pile.childNodes.length - 1].dataset.value) === value - 1) {
            this.moveCardToPile(card, pile);
            return;
          }
        }
      }
      timeoutId = setTimeout(this.dealNewCard.bind(this), solveSpeed);
    },

    moveCardToPile: function (card, pile) {
      var stack = card.parentNode, cards;
      this.moveCard(card, pile, function () {
        cards = stack.childNodes;
        if (cards.length) {
          this.flipFaceUp(cards[cards.length - 1], function () {
            timeoutId = setTimeout(this.findFromStackForPile.bind(this), solveSpeed);
          }.bind(this));
        } else {
          timeoutId = setTimeout(this.findFromStackForPile.bind(this), solveSpeed);
        }
      }.bind(this));
    },

    moveAceToEmptyPile: function (card) {
      var piles, pile, idx, len, stack = card.parentNode, cards;
      piles = document.body.getElementsByClassName("pile");
      for (idx = 0, len = piles.length; idx < len; idx += 1) {
        if (piles[idx].childNodes.length === 0 && !pile) {
          pile = piles[idx];
          break;
        }
      }
      if (pile) {
        pile.dataset.suit = card.dataset.suit;
        this.moveCard(card, pile, function () {
          cards = stack.childNodes;
          if (cards.length) {
            this.flipFaceUp(cards[cards.length - 1], function () {
              timeoutId = setTimeout(this.findFromStackForPile.bind(this), solveSpeed);
            }.bind(this));
          } else {
            timeoutId = setTimeout(this.findFromStackForPile.bind(this), solveSpeed);
          }
        }.bind(this));
      }
    },

    dealNewCard: function () {
      var dealer, cards, card, stack;
      dealer = document.body.querySelector(".dealer[data-id='1']");
      cards  = dealer.childNodes;
      if (!cards.length) {
        this.resetDealerCards();
        return;
      }
      card  = cards[cards.length - 1];
      this.moveCard(card, document.body.querySelector(".dealer[data-id='2']"), function () {
        this.flipFaceUp(card, function () {

        timeoutId = setTimeout(function () {
          if (this.findPileForCard(card)) {
            return;
          }
          stack = this.findStackForCard(card);
          if (stack) {
            this.moveCard(card, stack, function () {
              timeoutId = setTimeout(this.dealNewCard.bind(this), solveSpeed);
            }.bind(this));
            return;
          }

          timeoutId = setTimeout(this.dealNewCard.bind(this), solveSpeed);

        }.bind(this), solveSpeed);


        }.bind(this));
      }.bind(this));
    },

    resetDealerCards: function () {
      var dealer1, dealer2, card;
      dealer1 = document.body.querySelector(".dealer[data-id='1']");
      dealer2 = document.body.querySelector(".dealer[data-id='2']");
      while (dealer2.childNodes.length) {
        card = dealer2.childNodes[dealer2.childNodes.length - 1];
        card.dataset.open = false;
        dealer1.appendChild(card);
      }
      timeoutId = setTimeout(this.dealNewCard.bind(this), 100);
    },

    findPileForCard: function (card) {
      var value, pile;
      value = parseFloat(card.dataset.value);
      if (value === 1) {
        this.moveAceToEmptyPile(card);
        return true;
      }
      pile = document.body.querySelector(".pile[data-suit='" + card.dataset.suit + "']");
      if (pile && pile.childNodes.length && parseFloat(pile.childNodes[pile.childNodes.length - 1].dataset.value) === value - 1) {
        this.moveCardToPile(card, pile);
        return true;
      }
      return false;
    },

    findStackForCard: function (card) {
      var id, value, stack, lastCard;
      value = parseFloat(card.dataset.value);
      for (id = 1; id <= 7; id += 1) {
        stack = document.body.querySelector(".stack[data-id='" + id + "']");
        if (value === 13 && stack.childNodes.length === 0) {
          return stack;
        }
        if (value !== 13 && stack.childNodes.length > 0) {
          lastCard = stack.childNodes[stack.childNodes.length - 1];
          if (card.dataset.black !== lastCard.dataset.black && value + 1 === parseFloat(lastCard.dataset.value)) {
            return stack;
          }
        }
      }
      return false;
    }

  };


  window.app = new App();

}());

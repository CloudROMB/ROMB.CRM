import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {SocketService} from '../services/socket.service';
import {debugLog} from '../app.log';
import {defaultChatTranslation_RU} from '../classes/translation';
import {SharedService} from '../services/shared.service';
import {AuthService} from '../services/auth.service';
import {User} from '../classes/types';
import {$NBSP} from 'codelyzer/angular/styles/chars';

declare const $: any;

@Component({
  selector: 'romb-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  private msgSubscription: Subscription;

  private FADE_TIME = 150; // ms
  private TYPING_TIMER_LENGTH = 400; // ms
  private COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  private $window;
  private $usernameInput; // Input for username
  private $messages; // Messages area
  private $inputMessage; // Input message input box
  private $loginPage; // The login page
  private $chatPage; // The chatroom page

  public user: User;
  // Prompt for setting a username
  private typing = false;
  private lastTypingTime;
  private $currentInput;

  public labels = defaultChatTranslation_RU;
  public chatRoomName: string;

  @HostListener('document:click', ['$event'])
  onDocumentClick(e) {
    if (!SharedService.clickInsideElement(e, 'romb-chat')) {
      this.ws.isChatActive = false;
    }
  }

  @HostListener('document:keyup', ['$event'])
  onDocumentKeyUp(event) {
    if (SharedService.clickInsideElement(event, 'romb-chat')) {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        this.$currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      // if (event.which === 13) {
      if (event.keyCode === 13) {
        if (this.user.name) {
          this.sendMessage();
        } else {
          this.setUsername();
        }
      }
    }
  }

  constructor(private ws: SocketService,
              private auth: AuthService) {
    // debugLog('~~~ isActive', ws.isChatActive);
    this.user = this.auth.loadUserFromStorage(false);

    this.chatRoomName = this.user.name;
  }

  isActiveClass(): boolean {
    // debugLog('this.ws.isChatActive', this.ws.isChatActive);
    return this.ws.isChatActive;
  }

  ngOnInit() {
    this.$window = $(window);
    this.$usernameInput = $('.usernameInput'); // Input for username
    this.$messages = $('.messages'); // Messages area
    this.$inputMessage = $('.inputMessage'); // Input message input box
    this.$loginPage = $('.login.page'); // The login page
    this.$chatPage = $('.chat.page'); // The chatroom page
    this.$currentInput = this.$usernameInput.focus();


    this.$inputMessage.on('input', () => {
      this.updateTyping();
    });

    // Click events
    // Focus input when clicking anywhere on login page
    this.$loginPage.click(() => {
      this.$currentInput.focus();
    });

    // Focus input when clicking on the message input's border
    this.$inputMessage.click(() => {
      this.$inputMessage.focus();
    });

    // Socket events
    // Whenever the server emits 'login', log the login message
    this.ws.socket.on('login', (data) => {
      // connected = true;
      // Display the welcome message
      const message = 'Welcome to Socket.IO Chat – ';
      this.log(message, {
        prepend: true
      });
      this.addParticipantsMessage(data);
    });

    // Whenever the server emits 'new message', update the chat body
    this.ws.socket.on('new message', (data) => {
      this.addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    this.ws.socket.on('user joined', (data) => {
      this.log(data.username + ' joined');
      this.addParticipantsMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    this.ws.socket.on('user left', (data) => {
      this.log(data.username + ' left');
      this.addParticipantsMessage(data);
      this.removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    this.ws.socket.on('typing', (data) => {
      this.addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    this.ws.socket.on('stop typing', (data) => {
      this.removeChatTyping(data);
    });

    this.ws.socket.on('disconnect', () => {
      this.log('you have been disconnected');
    });

    this.ws.socket.on('reconnect', () => {
      this.log('you have been reconnected');
      if (this.user.name) {
        this.ws.socket.emit('add user', this.user.name);
      }
    });

    this.ws.socket.on('reconnect_error', () => {
      this.log('attempt to reconnect has failed');
    });


    this.msgSubscription = this.ws.messages.subscribe(msg => {
      debugLog('+ message:', msg);
    });

    // debugLog('~~ isActive', this.ws.isChatActive, this.isActiveClass());
  }

  ngAfterViewInit() {
    // debugLog('~ isActive', this.ws.isChatActive);
  }

  ngOnDestroy() {
    this.msgSubscription.unsubscribe();
  }

  addParticipantsMessage(data) {
    let message = '';
    if (data.numUsers === 1) {
      message += 'there\'s 1 participant';
    } else {
      message += 'there are ' + data.numUsers + ' participants';
    }
    this.log(message);
  }

  // Sets the client's username
  setUsername() {
    this.user.name = this.cleanInput(this.$usernameInput.val().trim());

    // If the username is valid
    if (this.user.name) {
      this.$loginPage.fadeOut();
      this.$chatPage.show();
      this.$loginPage.off('click');
      this.$currentInput = this.$inputMessage.focus();

      // Tell the server your username
      this.ws.socket.emit('add user', this.user.name);
    }
  }

  // Sends a chat message
  sendMessage() {
    let message = this.$inputMessage.val();
    // Prevent markup from being injected into the message
    message = this.cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && this.connected()) {
      this.$inputMessage.val('');
      this.addChatMessage({
        username: this.user.name,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      this.ws.socket.emit('new message', message);
    }

    this.ws.socket.emit('stop typing');
    this.typing = false;
  }

  // Log a message
  log(message, options?) {
    const $el = $('<li>').addClass('log').text(message);
    this.addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  addChatMessage(data, options?) {
    // Don't fade the message in if there is an 'X was typing'
    const $typingMessages = this.getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    const $usernameDiv = $('<span class="username"/>')
      .text(data.username + ': ')
      .css('color', this.getUsernameColor(data.username))
      .css('background-color', '#EEE');
    const $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    const typingClass = data.typing ? 'typing' : '';
    const $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    this.addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  addChatTyping(data) {
    data.typing = true;
    data.message = 'is typing';
    this.addChatMessage(data);
  }

  // Removes the visual chat typing message
  removeChatTyping(data) {
    this.getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  addMessageElement(el, options) {
    const $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(this.FADE_TIME);
    }
    if (options.prepend) {
      this.$messages.prepend($el);
    } else {
      this.$messages.append($el);
    }
    this.$messages[0].scrollTop = this.$messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  cleanInput(input) {
    return $('<div/>').text(input).html();
  }

  // Updates the typing event
  updateTyping() {
    if (this.connected()) {
      if (!this.typing) {
        this.typing = true;
        this.ws.socket.emit('typing');
      }
      this.lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        const typingTimer = (new Date()).getTime();
        const timeDiff = typingTimer - this.lastTypingTime;
        if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
          this.ws.socket.emit('stop typing');
          this.typing = false;
        }
      }, this.TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  getTypingMessages(data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  getUsernameColor(username) {
    // Compute hash code
    let hash = 7;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash < 5) - hash;
    }
    // Calculate color
    const index = Math.abs(hash % this.COLORS.length);
    return this.COLORS[index];
  }

  connected(): boolean {
    return this.ws.connected;
  }

  closeChat() {
    this.ws.isChatActive = false;
  }

  connectedClass(): string {
    if (this.ws.connected) {
      return 'btn-success';
    } else {
      return 'btn-danger';
    }
  }
}

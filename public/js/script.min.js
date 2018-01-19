"use strict";

var dateCurrent = new Date ();

var headerButton = document.querySelector(".header__button");

var mainPage = document.querySelector("main");

var diagram = mainPage.querySelector(".diagram");
var timeNow = mainPage.querySelector(".diagram__time-now");
var timeLine = mainPage.querySelector(".diagram__time-line");
var rowsWithRooms = mainPage.querySelectorAll(".floor__row");
var eventTooltips = mainPage.querySelectorAll(".tooltip");
var slotsOffTime = mainPage.querySelectorAll(".floor__off-time");
var date = mainPage.querySelector(".date");
var dateActive = date.querySelector(".date__active-date");
var dateCalendar = date.querySelector(".calendar");

var eventPage = document.querySelector(".event");

var eventHeading = eventPage.querySelector(".event__heading");
var inputEventName = eventPage.querySelector(".event__name input");
var buttonResetEventName = inputEventName.nextElementSibling;
var inputEventDate = eventPage.querySelector(".event__date input");
var eventCalendarControl = eventPage.querySelector(".event__calendar-contol");
var eventCalendar = eventPage.querySelector(".calendar");
var inputEventStart = eventPage.querySelector(".event__start input");
var inputEventEnd = eventPage.querySelector(".event__end input");
var inputEventCandidate = eventPage.querySelector(".event__participants input");
var buttonOpenCandidates = eventPage.querySelector(".event__candidates-control");
var buttonResetInputCandidate = inputEventCandidate.nextElementSibling;
var eventCandidatesList = eventPage.querySelector(".event__candidates");
var eventUsersList = eventPage.querySelector(".event__users");
var eventRecommendation = eventPage.querySelector(".event__recommendation");
var eventVariants = eventRecommendation.querySelectorAll(".event__variant");
var eventHelp = eventPage.querySelector(".event__help");
var eventWarning = eventPage.querySelector(".event__warning");
var buttonTopEventClose = eventPage.querySelector(".event__top-close");
var buttonFooterEventClose = eventPage.querySelector(".event__footer-close");
var buttonEventCreate = eventPage.querySelector(".event__create");
var buttonEventSave = eventPage.querySelector(".event__save");
var buttonEventRemove = eventPage.querySelector(".event__remove");

var modal = document.querySelector(".modal");

var modalEventCreate = modal.querySelector(".modal__message--create");
var modalEventRemove = modal.querySelector(".modal__message--remove");
var buttonModalOk = modal.querySelector(".modal__ok");
var buttonModalCancel = modal.querySelector(".modal__candel");
var buttonModalRemove = modal.querySelector(".modal__remove");

var templateEventCandidate = document.querySelector(".template__candidate");
var templateEventUser = eventUsersList.querySelector(".template__event-users");
var templateEvent = document.querySelector(".template__event-slot");
var templateOffTime = document.querySelector(".template__off-time-slot");;
var templateRoom = document.querySelector(".template__room");
var templateFloor = document.querySelector(".template__floor-table");
var templateEventMembers = document.querySelector(".template__event-users");
var templateRecommendedRoom = document.querySelector(".template__recommended-room");


var onClick = function (item, func) {
  item.addEventListener("click", function (evt) {
    evt.preventDefault ();
    func ();
  });
};

var eventOpen = function () {
  eventPage.removeAttribute('style');
  eventHeading.innerHTML = "Новая встреча";
  eventHelp.removeAttribute('style');
  eventWarning.style.display = "none";
  buttonEventCreate.removeAttribute('style');
  buttonEventRemove.style.display = "none";
  buttonEventSave.style.display = "none";
  mainPage.style.display = "none";
  headerButton.style.display = "none";
  modal.style.display = "none";
};

var eventEdit = function () {
  eventPage.removeAttribute('style');
  eventHeading.innerHTML = "Редактирование встречи";
  eventHelp.style.display = "none";
  eventWarning.removeAttribute('style');
  buttonEventCreate.style.display = "none";
  buttonEventRemove.removeAttribute('style');
  buttonEventSave.removeAttribute('style');
  mainPage.style.display = "none";
  headerButton.style.display = "none";
  modal.style.display = "none";
}

var eventClose = function () {
  eventPage.style.display = "none";
  mainPage.removeAttribute('style');
  headerButton.removeAttribute('style');
  eventRecommendation.removeAttribute('style');
  eventWarning.removeAttribute('style');
}


// При открытии страницы

eventPage.style.display = "none";


// Отображение текущего времени

var timeOutput = function () {

  var now = new Date ();
  var hour = now.getHours();
  var minute = now.getMinutes()
  var minuteInDay = hour * 60 + minute;

  if (minute < 10) {
    timeNow.innerHTML = hour + ":0" + minute;
  } else {
    timeNow.innerHTML = hour + ":" + minute;
  };

  if (minuteInDay >= 450 && minuteInDay <= 1410) {
    timeNow.style.left = (minuteInDay - 450) * 1.1 + 180 + "px";
    timeLine.style.left = (minuteInDay - 450) * 1.1 + 180 + "px";
  } else if (minuteInDay < 450) {
    timeNow.style.left = "180px";
    timeLine.style.left = "180px";
  } else {
    timeNow.style.left = "1236px";
    timeLine.style.left = "1236px";
  };
};

timeOutput();

var timeOutputUpdate = setInterval (function () {
  timeOutput();
}, 60000);


// Отображение сегодняшней даты

var optionsForDataInMain = {
  day: 'numeric',
  month: 'short',
};

var dateCurrentText = dateCurrent.toLocaleString("ru", optionsForDataInMain);
dateCurrentText = dateCurrentText.slice(0, dateCurrentText.length-1);

dateActive.innerHTML = dateCurrentText + " · Сегодня";


// Запрос данных о встречах

var loadEvents = function () {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', "/graphql?query={events{id, title, dateStart, dateEnd, users {id, login, avatarUrl, homeFloor}, room {id, title, capacity, floor}}}");
  xhr.send();
  xhr.onreadystatechange = function() {

    if (xhr.readyState != 4) return;

    if (xhr.status != 200) {
      console.log(xhr.status + ": " + xhr.statusText);
      return;
    } else {
      try {
        events = (JSON.parse(xhr.responseText)).data.events;
      } catch (e) {
        alert( "Некорректный ответ " + e.message );
      };
      sortAnEvents(events);
      loadRooms();
    };

  };
};


// Запрос данных о переговорках

var loadRooms = function () {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', "/graphql?query={rooms{id, title, capacity, floor}}");
  xhr.send();
  xhr.onreadystatechange = function() {

    if (xhr.readyState != 4) return;

    if (xhr.status != 200) {
      console.log(xhr.status + ": " + xhr.statusText);
      return;
    } else {
      try {
        rooms = (JSON.parse(xhr.responseText)).data.rooms;
      } catch (e) {
        alert( "Некорректный ответ " + e.message );
      };
      renderFloors(selectitionFloors(rooms), rooms);
      window.addEventListener("scroll", function () {
        roomOnScroll(roomTitles);
      });
    };

  };
};


// Отрисовка встреч

var events;

var sortAnEvents = function (eventsArray) {
  for (var i = 0; i < eventsArray.length - 1; i++) {
    var before = Date.parse(eventsArray[i].dateStart);
    for (var j = i + 1 ; j < eventsArray.length; j++) {
      var current = Date.parse(eventsArray[j].dateStart);
      if (current < before) {
        before = current;
        var swap = eventsArray[i];
        eventsArray[i] = eventsArray[j];
        eventsArray[j] = swap;
      };
    };
  };
};

var renderEvents = function (room, eventRow, eventsArray) {

  var fragmentRoom = document.createDocumentFragment();
  var timePoints = [];
  var startOfDay = Date.parse((eventsArray[1].dateStart).slice(0, 11) + "03:30:00.000Z");
  var endOfDay = Date.parse((eventsArray[1].dateEnd).slice(0, 11) + "19:30:00.000Z");
  var timeSwap = startOfDay;

  for (var i = 0; i < eventsArray.length; i++) {

    if (room.id === eventsArray[i].room.id) {

      var eventSlot = templateEvent.content.cloneNode(true);
      var eventSlotInner = eventSlot.querySelector(".floor__event");
      var eventTooltip = eventSlot.querySelector(".tooltip");
      var eventTitle = eventSlot.querySelector(".tooltip__title");
      var eventInfo = eventSlot.querySelector(".tooltip__info");
      var eventStart = new Date (Date.parse(eventsArray[i].dateStart));
      var optionsStart = {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      };
      var eventEnd = new Date (Date.parse(eventsArray[i].dateEnd));
      var optionsEnd = {
        hour: 'numeric',
        minute: 'numeric'
      };
      var avatar = eventSlot.querySelector(".user__avatar");
      var login = eventSlot.querySelector(".user__login");
      var cauntMembers = eventSlot.querySelector(".tooltip__caunt-users");

      eventSlotInner.style.width = (eventEnd - eventStart) / 60000 * 1.1 + "px";
      eventTooltip.setAttribute("data-id", eventsArray[i].id);
      eventTooltip.setAttribute("data-index", i);
      eventTitle.innerHTML = eventsArray[i].title;
      eventInfo.innerHTML = eventStart.toLocaleString("ru", optionsStart) + "—" + eventEnd.toLocaleString("ru", optionsEnd) + " · " + room.title;
      avatar.setAttribute("alt", eventsArray[i].users[1].login);
      login.innerHTML = eventsArray[i].users[1].login;

      if (eventsArray[i].users[1].avatarUrl != null) {
        avatar.setAttribute("src", eventsArray[i].users[1].avatarUrl);
      } else {
        avatar.setAttribute("src", "https://hochu.ua/i/default-user-avatar.png");
      };

      if (eventsArray[i].users.length === 2 || eventsArray[i].users.length === 3 || eventsArray[i].users.length === 4) {
        cauntMembers.innerHTML = " и еще " + (eventsArray[i].users.length - 1) + " человека";
      } else {
        cauntMembers.innerHTML = " и еще " + (eventsArray[i].users.length - 1) + " человек";
      };

      tooltipOnClick (eventTooltip.parentNode);

      if (Date.parse(eventsArray[i].dateStart) > timeSwap) {
        var slotOffTime = templateOffTime.content.cloneNode(true);
        var slotOffTimeInner = slotOffTime.querySelector(".floor__off-time");
        slotOffTimeInner.setAttribute("data-start", timeSwap);
        slotOffTimeInner.setAttribute("data-end", Date.parse(eventsArray[i].dateStart));
        slotOffTimeInner.style.width = (Date.parse(eventsArray[i].dateStart) - timeSwap) / 60000 * 1.1 + "px";
        eventOpeninRoom (slotOffTimeInner);
        fragmentRoom.appendChild(slotOffTime);
        fragmentRoom.appendChild(eventSlot);
        timeSwap = Date.parse(eventsArray[i].dateEnd);
      } else {
        fragmentRoom.appendChild(eventSlot);
        timeSwap = Date.parse(eventsArray[i].dateEnd);
      };
    };

  };

  if (timeSwap < endOfDay) {
    var slotOffTime = templateOffTime.content.cloneNode(true);
    var slotOffTimeInner = slotOffTime.querySelector(".floor__off-time");
    slotOffTimeInner.setAttribute("data-start", timeSwap);
    slotOffTimeInner.setAttribute("data-end", endOfDay);
    slotOffTimeInner.style.width = (endOfDay - timeSwap) / 60000 * 1.1 + "px";
    eventOpeninRoom (slotOffTimeInner);
    fragmentRoom.appendChild(slotOffTime);
  };

  eventRow.appendChild(fragmentRoom);

};


// Отрисовка переговорок

var renderRoom = function (room) {
  var rowRoom = templateRoom.content.cloneNode(true);
  var roomTitle = rowRoom.querySelector(".floor__room-title");
  var roomCapacity = rowRoom.querySelector(".floor__room-capacity");
  var roomEvents = rowRoom.querySelector(".floor__events");

  roomTitle.innerHTML = room.title;
  roomCapacity.innerHTML = "до " + room.capacity + " человек";
  renderEvents(room, roomEvents, events);
  return rowRoom;
};


// Выборка этажей

var rooms = [];

var floors = [];

var selectitionFloors = function (rooms) {

  var numberFloors = [];

  for (var i = 0; i < rooms.length; i++) {
    numberFloors[i] = rooms[i].floor;
  };

  for (var i = 0; i < numberFloors.length; i++) {
    if (numberFloors[i] != null) {
      floors.push(numberFloors[i]);
    };
    for (var j = i + 1; j < numberFloors.length; j++) {
      if (numberFloors[j] === numberFloors[i]) {
        numberFloors[j] = null;
      };
    };
  };

  return floors.sort();
};


// Отрисовка этажей

var roomTitles = [];

var renderFloors = function (floorsArray, roomsArray) {

  for (var i = 0; i < floorsArray.length; i++) {
    var floor = templateFloor.content.cloneNode(true);
    var floorNumber = floor.querySelector(".floor__number");
    var floorBody = floor.querySelector(".floor__body");

    floorNumber.innerHTML = floorsArray[i] + " этаж";
    for (var j = 0; j < rooms.length; j++) {
      if (roomsArray[j].floor === floorsArray[i]) {
        floorBody.appendChild(renderRoom(roomsArray[j]));
      };
    };
    diagram.appendChild(floor);
  };
  roomTitles = mainPage.querySelectorAll(".floor__room-title");
};


// Появление плавающего тултипа с названием переговорки

var roomOnScroll = function (items) {

  var room = mainPage.querySelector(".floor__room");

  if (window.pageXOffset > room.offsetWidth) {
    for (var i = 0; i < items.length; i++) {
      items[i].classList.add("floor__room-title--tooltip");
      items[i].style.left = window.pageXOffset + 12 + "px";
    };
  } else {
    for (var j = 0; j < rooms.length; j++) {
      if (items[j].classList.contains("floor__room-title--tooltip")) {
        items[j].classList.remove("floor__room-title--tooltip");
      };
    };
  };
};

loadEvents();


//Генерация списка всех пользователей в форме

var loadUsers = function () {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', "/graphql?query={users{id, login, avatarUrl, homeFloor}}");
  xhr.send();
  xhr.onreadystatechange = function() {

    if (xhr.readyState != 4) return;

    if (xhr.status != 200) {
      console.log(xhr.status + ": " + xhr.statusText);
      return;
    } else {
      try {
        users = (JSON.parse(xhr.responseText)).data.users;
      } catch (e) {
        alert( "Некорректный ответ " + e.message );
      };
      createEventCandidatesList ();
    };
  };
};

var users;

var createEventCandidatesList = function () {

  for (var i = 0; i < users.length; i++) {

    var candidate = templateEventCandidate.content.cloneNode(true);
    var field = candidate.querySelector(".field__option");
    var avatar = candidate.querySelector(".user__avatar");
    var login = candidate.querySelector(".user__login");
    var homeFloor = candidate.querySelector(".user__home-floor");

    field.setAttribute("data-id", users[i].id);
    field.setAttribute("data-index", i);
    avatar.setAttribute("alt", users[i].login);
    login.innerHTML = users[i].login;
    homeFloor.innerHTML = users[i].homeFloor + " этаж";

    if (users[i].avatarUrl != null) {
      avatar.setAttribute("src", users[i].avatarUrl);
    } else {
      avatar.setAttribute("src", "https://hochu.ua/i/default-user-avatar.png");
    };

    eventCandidatesList.appendChild(candidate);
  };

};

loadUsers ();


// Выбор участников встречи

var selectEventCandidate = function (index) {

  var member = templateEventMembers.content.cloneNode(true);
  var user = member.querySelector(".event__user");
  var input = member.querySelector("input");
  var avatar = member.querySelector(".user__avatar");
  var login = member.querySelector(".user__login");

  user.setAttribute("data-id", users[index].id);
  user.setAttribute("data-index", index);
  input.setAttribute("name", users[index].id);

  if (users[index].avatarUrl != null) {
    avatar.setAttribute("src", users[index].avatarUrl);
  } else {
    avatar.setAttribute("src", "https://hochu.ua/i/default-user-avatar.png");
  };

  login.innerHTML = users[index].login;
  eventUsersList.appendChild(member);
};

eventCandidatesList.addEventListener("click", function (evt) {

  evt.preventDefault();

  var target = evt.target;

  while (!target.classList.contains("event__candidates")) {
    if (target.classList.contains("field__option")) {
      selectEventCandidate (target.getAttribute("data-index"));
      target.style.display = "none";
      return;
    };
    target = target.parentNode;
  };
});


// Удаление участников встречи

eventUsersList.addEventListener("click", function (evt) {

  evt.preventDefault();

  var target = event.target;

  while (!target.classList.contains("event__users")) {
    if (target.classList.contains("event__user")) {
      eventUsersList.removeChild(target);
      var index = "[data-id=\"" + target.getAttribute("data-id") + "\"]";
      var candidate = eventCandidatesList.querySelector(index);
      candidate.removeAttribute("style");
      return;
    };
    target = target.parentNode;
  };
});


// Открытие и закрытите календаря на главной странице

dateActive.addEventListener("click", function () {
  dateCalendar.classList.toggle("date__calendar--shown");
});

dateCalendar.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("calendar__day-number")) {
    setTimeout(function () {
      dateCalendar.classList.remove("date__calendar--shown");
    }, 350);
  };
});


// Открытие и закрытите календаря на странице встречи

eventCalendarControl.addEventListener("click", function () {
  eventCalendar.classList.toggle("event__calendar--shown");
});

eventCalendar.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("calendar__day-number")) {
    evt.preventDefault ();
    setTimeout (function () {
      eventCalendar.classList.remove("event__calendar--shown");
    }, 350);
  }
});


// Открытие страницы с созданием встречи при клике на кнопку в шапке

headerButton.addEventListener("click", function (evt) {
  evt.preventDefault ();
  eventOpen ();
  buttonResetEventName.style.display = "none";
  inputEventDate.value = "";
  inputEventStart.value = "";
  inputEventEnd.value = "";
  eventUsersList.innerHTML = "";
  eventRecommendation.innerHTML = "";
  inputEventStart.addEventListener("input", function (evt) {
    if (inputEventStart.value && inputEventEnd.value) {
      eventRecommendation.innerHTML = "Подбор переговорок...";
    };
  });
  inputEventEnd.addEventListener("input", function (evt) {
    if (inputEventStart.value && inputEventEnd.value) {
      eventRecommendation.innerHTML = "Подбор переговорок...";
    };
  });
});


// Открытие страницы с созданием встречи при клике на свободном слоте

var optionsForDateInEvent = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

var eventOpeninRoom = function (item) {
  item.addEventListener("click", function (evt) {
    if (evt.target.classList.contains("floor__plus")) {
      evt.preventDefault();

      var titleCurrentRoom = item.querySelector(".floor__room-title");
      var inputText = dateCurrent.toLocaleString("ru", optionsForDateInEvent);
      var eventStart = new Date (parseInt ((evt.target.parentNode.getAttribute("data-start"))));
      var eventEnd = new Date (parseInt (evt.target.parentNode.getAttribute("data-end")));

      inputEventDate.value = inputText.slice(0, inputText.length - 8) + ", " + inputText.slice(inputText.length - 7, inputText.length - 3);
      inputEventStart.value = eventStart.getHours() + ":" + eventStart.getMinutes();
      inputEventEnd.value = eventEnd.getHours() + ":" + eventEnd.getMinutes();
      eventRecommendation.innerHTML = "Подбор переговорок...";
      eventOpen ();
    };
  });
};


// Появление тултипа с информацией о встрече и переход на страницу встречи

var tooltipOnClick = function (item) {
  item.addEventListener("click", function (evt) {
    evt.preventDefault ();
    item.classList.toggle("floor__event--active");

    setTimeout (function () {
      if (item.classList.contains("floor__event--active")) {
        item.classList.remove("floor__event--active");
      };
    }, 30000);

    if (evt.target.classList.contains("tooltip__edit")) {
      var index = evt.target.parentNode.getAttribute("data-index");
      var eventStart = new Date (Date.parse (events[index].dateStart));
      var eventEnd = new Date (Date.parse (events[index].dateEnd));

      inputEventName.value = events[index].title;
      inputEventStart.value = eventStart.getHours() + ":" + eventStart.getMinutes();
      inputEventEnd.value = eventEnd.getHours() + ":" + eventEnd.getMinutes();

      for (var i = 0; i < events[index].users.length; i++) {
        var candidate = eventCandidatesList.querySelector("[data-id=\"" + events[index].users[i].id + "\"]");
        if (candidate) {
          candidate.style.display = "none";
          selectEventCandidate (candidate.getAttribute("data-index"));
        };
      };

      renderRecommenderRoom(events[index].room, Date.parse(events[index].dateStart), Date.parse(events[index].dateEnd), true);

      eventEdit ();
    };

  });
};


// Открытие и закрытие списка возможных участников на странице всречи

inputEventCandidate.addEventListener("focus", function () {
  eventCandidatesList.classList.add("event__candidates--shown");
  buttonOpenCandidates.removeAttribute('style');
});

inputEventCandidate.addEventListener("blur", function () {

  if (eventCandidatesList.classList.contains("event__candidates--shown")) {
    setTimeout (function () {
      eventCandidatesList.classList.remove("event__candidates--shown");
      buttonOpenCandidates.style.display = "none";
    }, 250);
  };

  if (inputEventCandidate.value) {
    buttonResetInputCandidate.removeAttribute('style');
  } else {
    buttonResetInputCandidate.style.display = "none";
  };

});

buttonOpenCandidates.addEventListener("click", function () {
  if (eventCandidatesList.classList.contains("event__candidates--shown")) {
    eventCandidatesList.classList.remove("event__candidates--shown");
  };
});


// Появление кнопки сброса при вводе темы встречи

inputEventName.addEventListener("input", function () {
  if (inputEventName.value) {
    buttonResetEventName.removeAttribute('style');
  } else {
    buttonResetEventName.style.display = "none";
  };
});


// Отрисовка переговорки

var renderRecommenderRoom = function (roomEvent, eventStart, eventEnd, check) {
  var room = templateRecommendedRoom.content.cloneNode(true);
  var input = room.querySelector(".event__variant-control");
  var duration = room.querySelector(".event__duration");
  var start = new Date (eventStart);
  var end = new Date (eventEnd);
  var title = room.querySelector(".event__room");
  var floor = room.querySelector(".event__floor");

  if (check === true) {
    input.parentNode.classList.add("event__variant--active");
    input.checked = true;
  };

  input.setAttribute("value", roomEvent.id);
  duration.innerHTML = start.getHours() + ":" + start.getMinutes() + "—" + end.getHours() + ":" + end.getMinutes();
  title.innerHTML = roomEvent.title;
  floor.innerHTML = roomEvent.floor + " этаж";
  eventRecommendation.appendChild(room);
};


// Выбор переговорки из предложенных

var variantOnClick = function (item) {
  item.addEventListener("click", function (evt) {
    evt.preventDefault ();

    var input = item.querySelector("input");

    if (!input.checked) {
      eventRecommendation.dataset.heading = "Ваша переговорка";
      input.checked = true;
      item.classList.add("event__variant--active");

      for (var i = 0; i < eventVariants.length; i++) {
        if (!eventVariants[i].classList.contains("event__variant--active")) {
          eventVariants[i].style.display = "none";
        };
      };

    } else {
      eventRecommendation.dataset.heading = "Рекомендованные переговорки";
      input.checked = false;

      for (var i = 0; i < eventVariants.length; i++) {
        eventVariants[i].removeAttribute('style');
        eventVariants[i].classList.remove("event__variant--active");
      };

    };
  });
};

for (var i = 0; i < eventVariants.length; i++) {
  variantOnClick(eventVariants[i]);
};


// Закрытие страницы встречи без сохранения

buttonTopEventClose.addEventListener("click", function () {
  eventClose ();
});

buttonFooterEventClose.addEventListener("click", function () {
  eventClose ();
});


// Закрытие страницы встречи c появлением модального окна

modal.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("modal__remove")) {
    eventPage.submit();
    eventClose ();
    modal.style.display = "none";
  } else if (evt.target.classList.contains("modal__button")) {
    modal.style.display = "none";
  };
});

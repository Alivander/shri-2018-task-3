var mainPage = document.querySelector("main");
var eventPage = document.querySelector(".event");
var modal = document.querySelector(".modal");

var headerButton = document.querySelector(".header__button");

var room = mainPage.querySelector(".floor__room");
var roomTitles = mainPage.querySelectorAll(".floor__room-title");
var events = mainPage.querySelectorAll(".floor__event");
var eventTooltips = mainPage.querySelectorAll(".tooltip");
var slotsOffTime = mainPage.querySelectorAll(".floor__off-time");
var date = mainPage.querySelector(".date");
var dateActive = date.querySelector(".date__active-date");
var dateCalendar = date.querySelector(".calendar");

var eventHeading = eventPage.querySelector(".event__heading");
var eventCalendarControl = eventPage.querySelector(".event__calendar-contol");
var eventCalendar = eventPage.querySelector(".calendar");
var inputEventCandidate = eventPage.querySelector("#event-participants");
var buttonOpenCandidates = eventPage.querySelector(".event__candidates-control");
var buttonResetInputCandidate = inputEventCandidate.nextElementSibling;
var inputEventName = eventPage.querySelector("#event-name");
var buttonResetEventName = inputEventName.nextElementSibling;
var eventCandidates = eventPage.querySelector(".event__candidates");
var eventRecommendation = eventPage.querySelector(".event__recommendation");
var eventVariants = eventRecommendation.querySelectorAll(".event__variant");
var eventVariantInputs = eventRecommendation.querySelectorAll("input");
var eventWarning = eventPage.querySelector(".event__warning");
var buttonTopEventClose = eventPage.querySelector(".event__top-close");
var buttonFooterEventClose = eventPage.querySelector(".event__footer-close");
var buttonEventCreate = eventPage.querySelector(".event__create");
var buttonEventSave = eventPage.querySelector(".event__save");
var buttonEventRemove = eventPage.querySelector(".event__remove");

var modalEventCreate = modal.querySelector(".modal__message--create");
var modalEventRemove = modal.querySelector(".modal__message--remove");
var buttonModalOk = modal.querySelector(".modal__ok");
var buttonModalCancel = modal.querySelector(".modal__candel");
var buttonModalRemove = modal.querySelector(".modal__remove");


var onClickToggle = function (item, classToggle, targerClass, targetFunc) {
  item.addEventListener("click", function (evt) {
    evt.preventDefault ();
    if (classToggle != "") {
      item.classList.toggle(classToggle);
    }
    if (evt.target.classList.contains(targerClass)) {
      targetFunc ();
    }
  });
};

var eventOpen = function () {
  eventPage.removeAttribute('style');
  mainPage.style.display = "none";
  headerButton.style.display = "none";
};

var eventClose = function () {
  eventPage.style.display = "none";
  mainPage.removeAttribute('style');
  headerButton.removeAttribute('style');
  eventRecommendation.removeAttribute('style');
  eventWarning.removeAttribute('style');
}


//При открытии страницы

eventPage.style.display = "none";


//Появление плавающего тултипа с названием переговорки

var roomOnScroll = function (items) {
  if (window.pageXOffset > room.offsetWidth) {
    for (var i = 0; i < items.length; i++) {
      items[i].classList.add("floor__room-title--tooltip");
      items[i].style.left = window.pageXOffset + 12 + "px";
    };
  } else {
    for (var j = 0; j < roomTitles.length; j++) {
      if (items[j].classList.contains("floor__room-title--tooltip")) {
        items[j].classList.remove("floor__room-title--tooltip");
      };
    };
  };
};

window.addEventListener("scroll", function () {
  roomOnScroll(roomTitles);
});


//Открытие и закрытите календаря на главной странице

dateActive.addEventListener("click", function () {
  dateCalendar.classList.toggle("date__calendar--shown");
});

dateCalendar.addEventListener("click", function (event) {
  if (event.target.classList.contains("calendar__day-number")) {
    setTimeout(function () {
      dateCalendar.classList.remove("date__calendar--shown");
    }, 350);
  }
});


//Появление тултипа с информацией о встрече и переход на страницу встречи

for (var i = 0; i < events.length; i++) {
  var eventLeft = events[i].offsetWidth / 2 - eventTooltips[i].offsetWidth / 2;
  eventTooltips[i].style.marginLeft = eventLeft + "px";
  onClickToggle (events[i], "floor__event--active", "tooltip__edit", eventOpen);
};


//Открытие и закрытите календаря на странице встречи

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


//Открытие страницы с созданием встречи при клике на кнопку в шапке

headerButton.addEventListener("click", function (evt) {
  evt.preventDefault ();
  eventOpen ();
  eventRecommendation.style.display = "none";
  eventWarning.style.display = "none";
});


//Открытие страницы с созданием встречи при клике на свободном слоте

for (var i = 0; i < slotsOffTime.length; i++) {
  onClickToggle (slotsOffTime[i], "", "floor__plus", eventOpen);
}


//Открытие и закрытие списка возможных участников на странице всречи

inputEventCandidate.addEventListener("focus", function () {
  eventCandidates.classList.add("event__candidates--shown");
  buttonOpenCandidates.removeAttribute('style');
});

inputEventCandidate.addEventListener("blur", function () {
  if (eventCandidates.classList.contains("event__candidates--shown")) {
    eventCandidates.classList.remove("event__candidates--shown");
    buttonOpenCandidates.style.display = "none";
  };
  if (inputEventCandidate.value) {
    buttonResetInputCandidate.removeAttribute('style');
  } else {
    buttonResetInputCandidate.style.display = "none";
  };
});

buttonOpenCandidates.addEventListener("click", function () {
  if (eventCandidates.classList.contains("event__candidates--shown")) {
    eventCandidates.classList.remove("event__candidates--shown");
  };
});


//Появление кнопки сброса при вводе темы встречи

inputEventName.addEventListener("input", function () {
  if (inputEventName.value) {
    buttonResetEventName.removeAttribute('style');
  } else {
    buttonResetEventName.style.display = "none";
  };
});


//Выбор переговорки из предложенных

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


//Закрытие страницы встречи без сохранения

buttonTopEventClose.addEventListener("click", function () {
  eventClose ();
});

buttonFooterEventClose.addEventListener("click", function () {
  eventClose ();
});


//Закрытие страницы встречи c появлением модального окна

modal.addEventListener("click", function (evt) {
  if (evt.target.classList.contains("modal__remove")) {
    eventPage.submit();
    eventClose ();
    modal.style.display = "none";
  } else if (evt.target.classList.contains("modal__button")) {
    modal.style.display = "none";
  };
});

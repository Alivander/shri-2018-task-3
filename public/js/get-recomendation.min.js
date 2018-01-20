/**
 * @typedef {Object} Person
 * @property {String} login Идентификатор сотрудника.
 * @property {Number} floor "Домашний" этаж сотрудника.
 * @property {String} avatar Ссылка на аватар.
 */

/**
 * @typedef {Object} Room
 * @property {Number} id Идентификатор переговорки.
 * @property {String} title Название переговорки.
 * @property {Number} capacity Вместимость (количество человек).
 * @property {Number} floor Этаж, на котором расположена переговорка.
 */

/**
 * @typedef {Object} EventDate
 * @property {Number} start Timestamp начала встречи.
 * @property {Number} end Timestamp окончания встречи.
 */

/**
 * @typedef {Object} Event
 * @property {String} id Идентификатор встречи.
 * @property {String} title Название встречи.
 * @property {String[]} members Логины участников встречи.
 * @property {EventDate} date Дата и время проведения встречи.
 * @property {Number} room Идентификатор переговорки.
 */

/**
 * @typedef {Object} RoomsSwap
 * @property {string} event Идентификатор встречи.
 * @property {String} room Новый идентификатор переговорки.
 */

/**
 * @typedef {Object} Recommendation
 * @property {EventDate} date Дата и время проведения встречи.
 * @property {String} room Идентификатор переговорки.
 * @property {RoomsSwap[]} [swap] Необходимые замены переговорк для реализации рекомендации.
 */

/**
 * @param {EventDate} date Дата планируемой встречи.
 * @param {Person[]} members Участники планируемой встречи.
 * @param {Object} db
 * @param {Event[]} db.events Список все встреч.
 * @param {Room[]} db.rooms Список всех переговорок.
 * @returns {Recommendation[]}
 */

var date = {
  start: "2017-12-13T13:15:00.000Z",
  end: "2017-12-13T15:15:00.000Z"
};

function getRecommendation(date, members, db) {

  // Я не нашла способа запросить данные с сервера для конкретной даты, поэтому просто задаю одну дату, используемую в БД

  var startOfDay = Date.parse(date.start.slice(0, 11) + "03:30:00.000Z");
  var newEventStart = Math.floor((Date.parse (date.start) - startOfDay) / 900000);
  var newEventEnd = Math.floor((Date.parse (date.end) - startOfDay) / 900000);
  var newEventDuration = Math.floor((Date.parse (date.end) - Date.parse (date.start)) / 900000);
  var suitable = {
    roomsIndexes: [],
    passedFloors: []
  };

  var calculatesPassedFloors = function (roomFloor, membersEvent) {
    var sumPassedFloor = 0;
    for (var i = 0; i < membersEvent.length; i++) {
      sumPassedFloor += Math.abs(membersEvent[i].homeFloor - roomFloor);
    };
    return sumPassedFloor;
  };

  for (var i = 0; i < db.rooms.length; i++) {
    var freeSlot = 0;
    if (db.rooms[i].capacity >= members.length) {
      for (var j = newEventStart; j < newEventEnd; j++) {
        if (!db.rooms[i].segments[j]) {
          freeSlot++;
        };
      };
    };

    if (freeSlot === newEventDuration) {
      suitable.roomsIndexes.push(i);
      suitable.passedFloors.push(calculatesPassedFloors (db.rooms[i].floor, members));
    };
  };

  for (var i = 0; i < suitable.roomsIndexes.length - 1; i++) {
    var min = suitable.passedFloors[i];
    for (var j = i + 1; j < suitable.roomsIndexes.length; j++) {
      if (suitable.passedFloors[j] < min) {
        min = suitable.passedFloors[j];
        suitable.passedFloors[j] = suitable.passedFloors[i];
        suitable.passedFloors[i] = min;
        var swap = suitable.roomsIndexes[j];
        suitable.roomsIndexes[j] = suitable.roomsIndexes[i];
        suitable.roomsIndexes[i] = swap;
      };
    };
  };

  for (var i = 0; i < 3; i++) {
    if (suitable.roomsIndexes[i]) {
      renderRecommenderRoom (db.rooms[suitable.roomsIndexes[i]], Date.parse (date.start), Date.parse (date.end));
    } else {
      break
    };
  };
};

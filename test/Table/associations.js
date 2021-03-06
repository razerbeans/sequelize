var Sequelize = require(__dirname + "/../../lib/sequelize/Sequelize").Sequelize
  , config    = require(__dirname + '/../config')
  , s         = new Sequelize(config.database, config.username, config.password, {disableLogging: true})
  , Day       = s.define('Day', { name: Sequelize.TEXT })
  , assert    = require("assert")

module.exports = {
  'hasMany': function() {
    var HasManyBlubb = s.define('HasManyBlubb', {})
    Day.hasMany('HasManyBlubbs', HasManyBlubb)
    assert.isDefined(new Day({name:''}).getHasManyBlubbs)
  },
  'hasMany: set association': function(beforeExit) {
    var assoc = null
    var Character = s.define('Character', {})
    var Word = s.define('Word', {})
    Character.hasMany('Words', Word, 'Characters')

    Sequelize.chainQueries([
      {drop: Character}, {drop: Word}, {prepareAssociations: Word}, {prepareAssociations: Character}, {sync: Word}, {sync: Character}
    ],
    function() {
      var Association = s.tables.CharactersWords.klass
      Association.sync(function() {
        var w = new Word()
        var c1 = new Character()
        var c2 = new Character()
        Sequelize.chainQueries([{save: w}, {save: c1}, {save: c2}], function() {
          w.setCharacters([c1, c2], function(associations) {
            assoc = associations
          })
        })
      })
    })

    beforeExit(function() {
      assert.match(1,2)
      assert.isNotNull(assoc)
      assert.equal(assoc.length, 2)
    })
  },
  'hasOne': function() {
    var s = new Sequelize(config.database, config.username, config.password, {disableLogging: true})
    var Day = s.define('Day2', { name: Sequelize.TEXT })
    var HasOneBlubb = s.define('HasOneBlubb', {})
    Day.hasOne('HasOneBlubb', HasOneBlubb)

    assert.isDefined(Day.prototype.getHasOneBlubb)
  },
  'hasOne set association': function(beforeExit) {
    var s2 = new Sequelize(config.database, config.username, config.password, {disableLogging: true})
    var Task = s2.define('Task', {title: Sequelize.STRING})
    var Deadline = s2.define('Deadline', {date: Sequelize.DATE})

    Task.hasOneAndBelongsTo('deadline', Deadline, 'task')

    var task = new Task({ title:'do smth' })
    var deadline = new Deadline({date: new Date()})
    var assertMe = null

    Sequelize.chainQueries([{sync: s2}, {drop: s2}, {sync: s2}, {save: task}, {save: deadline}], function() {
      task.setDeadline(deadline, function(_deadline) {
        assertMe = _deadline
      })
    })

    beforeExit(function() {
      assert.isNotNull(Me)
      assert.eql(Me, deadline)
    })
  },
  'belongsTo': function() {
    var BelongsToBlubb = s.define('BelongsToBlubb', {})
    var Day = s.define('Day2', { name: Sequelize.TEXT })
    var assoc = Day.hasOne('asd', BelongsToBlubb)
    Day.belongsTo('BelongsToBlubb', BelongsToBlubb, assoc)
    assert.isDefined(new Day({name:''}).getBelongsToBlubb)
  },
  'belongsTo: set association': function(beforeExit) {
    var s2 = new Sequelize(config.database, config.username, config.password, {disableLogging: true})
    var Task = s2.define('Task', {title: Sequelize.STRING})
    var Deadline = s2.define('Deadline', {date: Sequelize.DATE})
    var allowExit = false

    var assoc = Task.hasOne('deadline', Deadline)
    Deadline.belongsTo('task', Task, assoc)

    var task = new Task({ title:'do smth' })
    var deadline = new Deadline({date: new Date()})

    Sequelize.chainQueries([{drop: s2}, {sync: s2}], function() {
      task.save(function() {
        deadline.save(function() {
          assert.isDefined(deadline.id)
          assert.isNotNull(deadline.id)
          deadline.setTask(task, function(_task) {
            assert.isNotNull(_task)
            assert.eql(_task.id, task.id)
            allowExit = true
          })
        })
      })
    })

    beforeExit(function() {
      assert.equal(allowExit, true)
    })
  }
}
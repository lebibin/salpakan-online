// Load dependencies
var emitter = require('events').EventEmitter
  , _ = require('underscore')
  , util = require('util')

// Store stopped flag, instances list and heap diff state externally
var instances = []
  , memwatch
  , diff
  , nf;

// Expose nodefly global and start conditional step trigger from gc clean event
exports.init = function() {
  nf = global.nodefly;
  try {
    memwatch = require('memwatch')
    
    // Make instance tracker toggleable
    var useInstances = false;
    process.on('SIGUSR2', function () {
      useInstances = !useInstances;

      if (useInstances) {
        console.log('instance monitoring started')
        instances = []
        diff = new memwatch.HeapDiff()
        memwatch.on('stats', step)
      } else {
        console.log('instance monitoring stopped')
        memwatch.off('stats', step)
      }
    });
  } catch (e) {
    console.log('memwatch must be installed to use the instances feature')
  }
}

function step () {
  console.log('instance monitoring step')

  // Stop heap diff and get the change data
  diff.end().change.details.forEach(function (change) {
    // Attempt to find existing instance
    var inst = _(instances).find(function (inst) {
      return inst.type === change.what
    })

    // If not present, create a new one from the current change item
    if (typeof inst === 'undefined') {
      inst = { type: change.what, total: 0, size: 0 }
      instances.push(inst)
    }

    // Adjust total
    inst.total += change['+']
    inst.total -= change['-']

    // Grab updated memory usage
    inst.size += change.size_bytes
  })

  // Emit state
  nf.emit('instances', {
    type: 'Instances'
    , state: instances
  })
  
  // Reset heap diff    
  diff = new memwatch.HeapDiff()
}
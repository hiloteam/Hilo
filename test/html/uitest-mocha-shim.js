(function() {
  var isElectron = /Electron/i.test(navigator.userAgent);
  if (!isElectron) {
    console.info('Macaca Electron Environment not support.');
  } else {
    var { remote } = require('electron');
    var remoteConsole = remote.require('console');
    var ipcRenderer = require('electron').ipcRenderer;

    // we have to do this so that mocha output doesn't look like shit
    console.log = function () {
      if (/stdout:/.test(arguments[0])) {
        return;
      }

      remoteConsole.log.apply(remoteConsole, arguments)
    }
  }

  window._macaca_uitest = {
    screenshot: function(name, cb) {
      if (!isElectron) {
        return cb();
      }
      var mochaElem = document.getElementById('mocha');

      if (typeof process === 'undefined') {
        return cb();
      }

      setTimeout(function() {
        ipcRenderer.send('ipc', {
          action: 'screenshot',
          data: {
            dir: './test/screenshot/' + name
          }
        });

        setTimeout(function() {
          cb();
        }, 100);
      }, 100);
    },

    setup: function(options) {
      var mochaOptions = options;

      if (isElectron) {
        mochaOptions = Object.assign({}, options, {
          reporter: 'spec',
          useColors: true
        })
      }

      return mocha.setup(mochaOptions);
    },

    run: function() {
      return mocha.run(function(failedCount) {
        isElectron && ipcRenderer.send('ipc', {
          action: 'exit',
          data: {
            failedCount: failedCount
          }
        });
      });
    }
  };

})();

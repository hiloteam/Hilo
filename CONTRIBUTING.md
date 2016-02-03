We appreciate you submit code to help perfect Hilo. And there are conventions to obey before you commit changes.

Format of the commit message

```

<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>

```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on github as well as in various git tools.


Seven types are allowed when committing.
This describes the kind of change that this commit is providing.

+ feat (feature)
+ fix (bug fix)
+ docs (documentation)
+ style (formatting, missing semi colons, …)
+ refactor
+ test (when adding missing tests)
+ chore (maintain)

etc:

```

   fix: view.js WebGLRender bug

   when run on some android phones,we found it has compatibility problem

   Closes #392
   Breaks  hilo.render api, hilo.renderGL should be used instead

```


More details: [AngularJS Git Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#https://github.com/hiloteam/Hilo/wiki/Commit-Message-Conventions/_edit#)

And git tools —— commitizen：

[commitizen](https://github.com/commitizen/cz-cli)
